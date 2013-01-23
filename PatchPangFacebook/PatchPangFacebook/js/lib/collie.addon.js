
(function () { /** @globals */
	if (typeof Box2D === "undefined") {
		return;
	}
	
	var b2Vec2 = Box2D.Common.Math.b2Vec2
	    , b2AABB = Box2D.Collision.b2AABB
	    , b2BodyDef = Box2D.Dynamics.b2BodyDef
	    , b2Body = Box2D.Dynamics.b2Body
	    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	    , b2Fixture = Box2D.Dynamics.b2Fixture
	    , b2World = Box2D.Dynamics.b2World
	    , b2MassData = Box2D.Collision.Shapes.b2MassData
	    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	    , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
	    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
	    
	/**
	 * Box2d를 쉽게 사용할 수 있는 클래스
	 * Box2d-web 라이브러리가 필요하며 라이브러리는 <a href="http://code.google.com/p/box2dweb/" target="_blank">http://code.google.com/p/box2dweb/</a> 에서 다운로드 받을 수 있습니다.
	 */
	collie.Box2d = collie.Class(/** @lends collie.Box2d.prototype */{
		ITERATIONS_VELOCITY : 6, // 속도 체크의 정확도, 높을 수록 정확하다
		ITERATIONS_POSITION : 3, // 위치 체크의 정확도, 높을 수록 정확하다
		WIDTH_OF_WALL : 10, // 벽의 두께(px)
		
		/**
		 * Box2d를 쉽게 사용할 수 있는 클래스
		 * Box2d-web 라이브러리가 필요하며 라이브러리는 <a href="http://code.google.com/p/box2dweb/" target="_blank">http://code.google.com/p/box2dweb/</a> 에서 다운로드 받을 수 있습니다.
		 * 
		 * @example
		 * var layer = new collie.Layer({
		 * 	width: 300,
		 * 	height: 300
		 * });
		 * 
		 * var box2d = new collie.Box2d(layer.option("width"), layer.option("height"), 10);
		 * box2d.addFixture("normal", {
		 * 	density: 1.0,
		 * 	friction: 0.5,
		 * 	restitution: 0.2
		 * });
		 * 
		 * box2d.createWall("right");
		 * box2d.createWall("left");
		 * box2d.createWall("top");
		 * box2d.createWall("bottom", "ground");
		 * 
		 * var box = new DisplayObject({
		 * 	x: "center",
		 * 	y: "center",
		 * 	width: 100,
		 * 	height: 100,
		 * 	backgroundColor: "red"
		 * }).addTo(layer);
		 * 
		 * box2d.createObject(box, {
		 * 	type: "dynamic"
		 * }, "normal");
		 * 
		 * collie.Renderer.addLayer(layer);
		 * collie.Renderer.load(document.getElementById("contianer"));
		 * collie.Renderer.start();
		 *  
		 * @class collie.Box2d
		 * @version 0.0.1
		 * @see http://code.google.com/p/box2dweb/
		 * @see http://www.box2dflash.org/docs/2.1a/reference/
		 * @requires collie.addon.js
		 * @requires box2d-web-2.1.a.3.js
		 * @param {Number} nWidth 스테이지 너비(px)
		 * @param {Number} nHeight 스테이지 높이(px)
		 * @param {Number} [nGravity=10] 중력
		 * @constructs
		 */
		$init : function (nWidth, nHeight, nGravity) {
			this._oDebugLayer = null;
			this._oDebugDraw = null;
			this._bIsLoaded = false;
			this._bIsDebug = false;
			this._nStep = 60;
			this._nWidth = 0;
			this._nHeight = 0;
			this._htFixtures = {};
			this._htBodies = {};
			nGravity = nGravity || 10;
			this._htWall = {};
			this._oWorld = this.createWorld(nGravity);
			this._fOnProcess = this._onProcess.bind(this);
			this.resize(nWidth, nHeight);
		},
		
		/**
		 * displayObject로 body를 찾는다
		 * 
		 * @return {Box2D.Dynamics.b2Body}
		 */
		getBody : function (oDisplayObject) {
			var nId = oDisplayObject.getId();
			return this._htBodies[nId] || false;
		},
		
		/**
		 * Fixture를 추가한다
		 * 
		 * @param {String} sName Fixture 이름
		 * @param {Option} htOption Fixture 옵션
		 * @param {Number} htOption.friction 마찰력 0~1, 0이면 마찰력이 없다
		 * @param {Number} htOption.restitution 반발력 0~1, 0이면 비탄성충돌, 튀기지 않는다
		 * @param {Box2D.Collision.Shapes.b2PolygonShape|Box2D.Collision.Shapes.b2CircleShape} [oShape] shape도 지정할 경우 입력
		 */
		addFixture : function (sName, htOption, oShape) {
			if (oShape) {
				htOption.shape = oShape;
			}
			
			var fixture = this.createFixture(htOption);
			this._htFixtures[sName] = fixture;
		},
		
		/**
		 * 등록된 Fixture를 지움
		 * 
		 * @param {String} sName Fixture 이름
		 */
		removeFixture : function (sName) {
			delete this._htFixtures[sName];
		},
		
		/**
		 * 등록된 Fixture를 반환
		 * 
		 * @param {String} sName Fixture 이름
		 * @return {Box2D.Dynamics.b2FixtureDef|Boolean}
		 */
		getFixture : function (sName) {
			if (this._htFixtures[sName]) {
				var fixture = new b2FixtureDef();
				
				for (var i in this._htFixtures[sName]) {
					fixture[i] = this._htFixtures[sName][i];
				}
				
				return fixture;
			} else {
				return false;
			}
		},
		
		/**
		 * b2FixtureDef를 생성
		 * @param {Object} htOption
		 * @return {Box2D.Dynamics.b2FixtureDef}
		 */
		createFixture : function (htOption) {
			var fixture = new b2FixtureDef();
			fixture.density = typeof htOption.density != "undefined" ? htOption.density : fixture.density;
			fixture.filter = htOption.filter || fixture.filter;
			fixture.friction = typeof htOption.friction != "undefined" ? htOption.friction : fixture.friction;
			fixture.restitution = typeof htOption.restitution != "undefined" ? htOption.restitution : fixture.restitution;
			fixture.isSensor = htOption.isSensor || fixture.isSensor;
			fixture.userData = htOption.userData || fixture.userData;
			fixture.shape = htOption.shape || fixture.shape;
			return fixture;
		},
		
		/**
		 * b2BodyDef를 생성
		 * @param {Object} htOption
		 * @param {String} [htOption.type="dynamic"] body 타입 static, dynamic, kinematic
		 * @return {Box2D.Dynamics.b2BodyDef}
		 */
		createBody : function (htOption) {
			var body = new b2BodyDef();
			body.active = htOption.active || body.active;
			body.allowSleep = htOption.allowSleep || body.allowSleep;
			body.angle = htOption.angle || body.angle;
			body.angularDamping = htOption.angularDamping || body.angularDamping;
			body.angularVelocity = htOption.angularVelocity || body.angularVelocity;
			body.awake = htOption.awake || body.awake;
			body.bullet = htOption.bullet || body.bullet;
			body.fixedRotation = htOption.fixedRotation || body.fixedRotation;
			body.inertiaScale = htOption.inertiaScale || body.inertiaScale;
			body.linearDamping = htOption.linearDamping || body.linearDamping;
			body.linearVelocity = htOption.linearVelocity || body.linearVelocity;
			body.position.x = htOption.x / collie.Box2d.SCALE || 0;
			body.position.y = htOption.y / collie.Box2d.SCALE || 0;

			switch (htOption.type) {
				case "static" :
					body.type = b2Body.b2_staticBody;
					break;
					
				case "kinematic" :
					body.type = b2Body.b2_kinematicBody;
					break;
				
				case "dynamic" :
				default :
					body.type = b2Body.b2_dynamicBody;
			}

			body.userData = htOption.userData || body.userData;
			return body;
		},
		
		/**
		 * Box2d 객체를 생성한다
		 * 
		 * @param {collie.DisplayObject} oDisplayObject
		 * @param {Object} htOption body options
		 * @param {Number} [htOption.radius] 반지름, 이 값이 설정되면 Shape는 해당 반지름을 가지는 원으로 생성됨 
		 * @param {Number} [htOption.width] 상자 너비(px) 이 값이 설정되면 Shape는 상자로 생성됨 
		 * @param {Number} [htOption.height] 상자 높이(px) 이 값이 설정되면 Shape는 상자로 생성됨 
		 * @param {String} [htOption.type="dynamic"] Body 종류, static(고정), dynamic(움직임), kinematic(움직이지만 다른 body에 영향이 없음) 
		 * @param {Number} [htOption.groupIndex] 충돌 그룹을 지정할 수 있다. 양수와 음수를 쓸 수 있으며 같은 양수의 index끼리는 충돌하고, 같은 음수의 index끼리는 충돌하지 않는다 
		 * @param {String|Box2D.Dynamics.b2FixtureDef} vFixture addFixture로 추가한 이름이나 FixtureDef를 입력
		 * @return {Box2D.Dynamics.b2Body}
		 */
		createObject : function (oDisplayObject, htOption, vFixture) {
			var htInfo = oDisplayObject.get();
			htOption.userData = oDisplayObject.getId(); // 나중에 body에서 displayObject를 찾기 위해서 id를 넣어줌
			htOption.x = htInfo.x + htInfo.width / 2;
			htOption.y = htInfo.y + htInfo.height / 2;
			var bodyDef = this.createBody(htOption);
			var fixtureDef = typeof vFixture == "string" ? this.getFixture(vFixture) : vFixture;
			
			// 충돌 그룹을 설정한다
			if ("groupIndex" in htOption) {
				fixtureDef.filter.groupIndex = htOption.groupIndex;
			}
			
			// 정해진 shape가 없으면 조건에 따라 shape을 만든다
			if (!fixtureDef.shape) {
				fixtureDef.shape = this._createShape(oDisplayObject, htOption);
			}
			
			var body = this._oWorld.CreateBody(bodyDef);
			this._htBodies[htOption.userData] = body; 
			body.CreateFixture(fixtureDef);
			return body;
		},
		
		/**
		 * DisplayObject와 관계 없는 Static Object를 생성
		 * 
		 * @param {Object} htOption
		 * @param {Number} htOption.x 좌상단 x좌표
		 * @param {Number} htOption.y 좌상단 y좌표
		 * @param {Number} htOption.width
		 * @param {Number} htOption.height
		 * @param {String|Box2D.Dynamics.b2FixtureDef} [vFixture] addFixture로 추가한 이름이나 FixtureDef를 입력
		 * @return {Box2D.Dynamics.b2Body}
		 */
		createStaticObject : function (htOption, vFixture) {
			var fixtureDef;
			htOption.type = "static";
			htOption.x += htOption.width / 2; // 중심 좌표로 변환, collie는 좌상단 기준, box2d는 중심 기준 좌표를 쓰고 있기 때문
			htOption.y += htOption.height / 2;
			
			if (!vFixture) {
				fixtureDef = new b2FixtureDef();
			} else {
				fixtureDef = typeof vFixture == "string" ? this.getFixture(vFixture) : vFixture;
			}
			
			// 정해진 shape가 없으면 조건에 따라 shape을 만든다
			if (!fixtureDef.shape) {
				fixtureDef.shape = this._createShape(null, htOption);
			}
			
			var bodyDef = this.createBody(htOption);
			var body = this._oWorld.CreateBody(bodyDef);
			body.CreateFixture(fixtureDef);
			return body;
		},
		
		/**
		 * 벽을 만든다
		 * 
		 * @param {String} sDirection 벽 방향, left, right, top, bottom
		 * @param {String|Box2D.Dynamics.b2FixtureDef} [vFixture] addFixture로 추가한 이름이나 FixtureDef를 입력
		 * @return {Box2D.Dynamics.b2Body}
		 */
		createWall : function (sDirection, vFixture) {
			var body;
			
			switch (sDirection) {
				case "left" :
					body = this.createStaticObject({
						x : -this.WIDTH_OF_WALL,
						y : -this.WIDTH_OF_WALL,
						width : this.WIDTH_OF_WALL,
						height : this._nHeight + this.WIDTH_OF_WALL * 2
					}, vFixture);
					break;
					
				case "right" :
					body = this.createStaticObject({
						x : this._nWidth,
						y : -this.WIDTH_OF_WALL,
						width : this.WIDTH_OF_WALL,
						height : this._nHeight + this.WIDTH_OF_WALL * 2
					}, vFixture);
					break;
					
				case "top" :
					body = this.createStaticObject({
						x : -this.WIDTH_OF_WALL,
						y : -this.WIDTH_OF_WALL,
						width : this._nWidth + this.WIDTH_OF_WALL * 2,
						height : this.WIDTH_OF_WALL
					}, vFixture);
					break;
					
				case "bottom" :
					body = this.createStaticObject({
						x : -this.WIDTH_OF_WALL,
						y : this._nHeight,
						width : this._nWidth + this.WIDTH_OF_WALL * 2,
						height : this.WIDTH_OF_WALL
					}, vFixture);
					break;
					
				default :
					throw new Error("not invalid direction");
			}
			
			this._htWall[sDirection] = body;
			return body;
		},
		
		/**
		 * 등록된 객체를 제거한다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody
		 */
		removeObject : function (oBody) {
			if (collie.Box2d.hasUserData(oBody)) {
				delete this._htBodies[oBody.GetUserData()];
			}
			
			this._oBody.DestroyBody(oBody);
		},
		
		/**
		 * 조건에 따라 shape를 만든다
		 * @private
		 * @return {Box2D.Collision.Shapes.b2PolygonShape|Box2D.Collision.Shapes.b2CircleShape}
		 */
		_createShape : function (oDisplayObject, htOption) {
			var shape;
			
			if (("width" in htOption) && ("height" in htOption)) {
				shape = this._createShapeBox(htOption.width / collie.Box2d.SCALE, htOption.height / collie.Box2d.SCALE);
			} else if (("radius" in htOption)) {
				shape = this._createShapeCircle(htOption.radius / collie.Box2d.SCALE);
			} else if (oDisplayObject) {
				if (oDisplayObject instanceof collie.Circle) {
					shape = this._createShapeCircle(oDisplayObject.get("radius") / collie.Box2d.SCALE);
				} else {
					shape = this._createShapeBox(oDisplayObject.get("width") / collie.Box2d.SCALE, oDisplayObject.get("height") / collie.Box2d.SCALE);
				}
			}
			
			return shape;
		},
		
		/**
		 * 사각형 Shape를 만듦
		 * @private
		 * @param {Number} nWidth
		 * @param {Number} nHeight
		 * @return {Box2D.Collision.Shapes.b2PolygonShape}
		 */
		_createShapeBox : function (nWidth, nHeight) {
			var shape = new b2PolygonShape();
			shape.SetAsBox(nWidth / 2, nHeight / 2);
			return shape;
		},
		
		/**
		 * 원형 shape를 만듦
		 * @private
		 * @param {Number} nRadius 반지름
		 * @return {Box2D.Collision.Shapes.b2CircleShape}
		 */
		_createShapeCircle : function (nRadius) {
            return new b2CircleShape(nRadius);
		},
		
		/**
		 * Contact를 만든다
		 * 
		 * @param {Function} [fBeginContact]
		 * @param {Function} [fEndContact]
		 * @param {Function} [fPostSolve]
		 * @param {Function} [fPreSolve]
		 */
		createContact : function (fBeginContact, fEndContact, fPostSolve, fPreSolve) {
			var listener = new Box2D.Dynamics.b2ContactListener();
			
			if (typeof fBeginContact != "undefined") {
				listener.BeginContact = fBeginContact;
			}
			if (typeof fEndContact != "undefined") {
				listener.EndContact = fEndContact;
			}
			if (typeof fPostSolve != "undefined") {
				listener.PostSolve = fPostSolve;
			}
			if (typeof fPreSolve != "undefined") {
				listener.PreSolve = fPreSolve;
			}
			
			this._oWorld.SetContactListener(listener); 
		},
		
		/**
		 * RevoluteJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor 연결점
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createRevoluteJoint : function (oBody1, oBody2, oAnchor, htOption) {
			var oJoint = new b2RevoluteJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor);
			oJoint.enableLimit = typeof htOption.enableLimit != "undefined" ? htOption.enableLimit : oJoint.enableLimit; 
			oJoint.enableMotor = typeof htOption.enableMotor != "undefined" ? htOption.enableMotor : oJoint.enableMotor; 
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.lowerAngle = typeof htOption.lowerAngle != "undefined" ? htOption.lowerAngle : oJoint.lowerAngle; 
			oJoint.maxMotorTorque = typeof htOption.maxMotorTorque != "undefined" ? htOption.maxMotorTorque : oJoint.maxMotorTorque; 
			oJoint.motorSpeed = typeof htOption.motorSpeed != "undefined" ? htOption.motorSpeed : oJoint.motorSpeed; 
			oJoint.referenceAngle = typeof htOption.referenceAngle != "undefined" ? htOption.referenceAngle : oJoint.referenceAngle; 
			oJoint.upperAngle = typeof htOption.upperAngle != "undefined" ? htOption.upperAngle : oJoint.upperAngle;
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * DistanceJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor1 왼쪽 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor2 오른쪽 연결점
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createDistanceJoint : function (oBody1, oBody2, oAnchor1, oAnchor2, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2DistanceJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor1, oAnchor2);
			oJoint.dampingRatio = typeof htOption.dampingRatio != "undefined" ? htOption.dampingRatio : oJoint.dampingRatio; 
			oJoint.frequencyHz = typeof htOption.frequencyHz != "undefined" ? htOption.frequencyHz : oJoint.frequencyHz; 
			oJoint.length = typeof htOption.length != "undefined" ? htOption.length : oJoint.length; 
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * FrictionJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor 연결점
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createFrictionJoint : function (oBody1, oBody2, oAnchor, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2FrictionJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor);
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.maxForce = typeof htOption.maxForce != "undefined" ? htOption.maxForce : oJoint.maxForce; 
			oJoint.maxTorque = typeof htOption.maxTorque != "undefined" ? htOption.maxTorque : oJoint.maxTorque; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * GearJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.Joints.b2Joint} oJoint1 연결할 joint1
		 * @param {Box2D.Dynamics.Joints.b2Joint} oJoint2 연결할 joint2
		 * @param {Number} nRatio 기어 비율
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createGearJoint : function (oJoint1, oJoint2, nRatio) {
			var oJoint = new Box2D.Dynamics.Joints.b2GearJointDef();
			oJoint.joint1 = oJoint2 
			oJoint.joint2 = oJoint2; 
			oJoint.ratio = nRatio; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * LineJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oAxis 축
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createLineJoint : function (oBody1, oBody2, oAnchor, oAxis, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2LineJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor, oAxis);
			oJoint.enableLimit = typeof htOption.enableLimit != "undefined" ? htOption.enableLimit : oJoint.enableLimit; 
			oJoint.enableMotor = typeof htOption.enableMotor != "undefined" ? htOption.enableMotor : oJoint.enableMotor; 
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.localAxisA = typeof htOption.localAxisA != "undefined" ? htOption.localAxisA : oJoint.localAxisA; 
			oJoint.lowerTranslation = typeof htOption.lowerTranslation != "undefined" ? htOption.lowerTranslation : oJoint.lowerTranslation; 
			oJoint.maxMotorForce = typeof htOption.maxMotorForce != "undefined" ? htOption.maxMotorForce : oJoint.maxMotorForce; 
			oJoint.motorSpeed = typeof htOption.motorSpeed != "undefined" ? htOption.motorSpeed : oJoint.motorSpeed; 
			oJoint.upperTranslation = typeof htOption.upperTranslation != "undefined" ? htOption.upperTranslation : oJoint.upperTranslation; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * MouseJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody 연결할 대상 body 
		 * @param {Box2D.Common.Math.b2Vec2} oTarget 대상 좌표
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createMouseJoint : function (oBody, oTarget, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2MouseJointDef();
			htOption = htOption || {};
			oJoint.bodyA = this._oWorld.GetGroundBody();
			oJoint.bodyB = oBody;
			oJoint.target = oTarget;
			oJoint.dampingRatio = typeof htOption.dampingRatio != "undefined" ? htOption.dampingRatio : oJoint.dampingRatio; 
			oJoint.frequencyHz = typeof htOption.frequencyHz != "undefined" ? htOption.frequencyHz : oJoint.frequencyHz; 
			oJoint.maxForce = typeof htOption.maxForce != "undefined" ? htOption.maxForce : oJoint.maxForce;
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * PrismaticJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oAxis 축
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createPrismaticJoint : function (oBody1, oBody2, oAnchor, oAxis, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor, oAxis);
			oJoint.enableLimit = typeof htOption.enableLimit != "undefined" ? htOption.enableLimit : oJoint.enableLimit; 
			oJoint.enableMotor = typeof htOption.enableMotor != "undefined" ? htOption.enableMotor : oJoint.enableMotor; 
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.localAxisA = typeof htOption.localAxisA != "undefined" ? htOption.localAxisA : oJoint.localAxisA; 
			oJoint.lowerTranslation = typeof htOption.lowerTranslation != "undefined" ? htOption.lowerTranslation : oJoint.lowerTranslation; 
			oJoint.maxMotorForce = typeof htOption.maxMotorForce != "undefined" ? htOption.maxMotorForce : oJoint.maxMotorForce; 
			oJoint.motorSpeed = typeof htOption.motorSpeed != "undefined" ? htOption.motorSpeed : oJoint.motorSpeed; 
			oJoint.referenceAngle = typeof htOption.referenceAngle != "undefined" ? htOption.referenceAngle : oJoint.referenceAngle; 
			oJoint.upperTranslation = typeof htOption.upperTranslation != "undefined" ? htOption.upperTranslation : oJoint.upperTranslation; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * PulleyJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oGroundAnchor1 첫번째 땅 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oGroundAnchor2 두번째 땅 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor1 왼쪽 연결점
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor2 오른쪽 연결점
		 * @param {Number} nRatio The pulley ratio, used to simulate a block-and-tackle.
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createPulleyJoint : function (oBody1, oBody2, oGaA, oGaB, oAnchor1, oAnchor2, nR, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2PulleyJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oGaA, oGaB, oAnchor1, oAnchor2, nR);
			oJoint.lengthA = typeof htOption.lengthA != "undefined" ? htOption.lengthA : oJoint.lengthA; 
			oJoint.lengthB = typeof htOption.lengthB != "undefined" ? htOption.lengthB : oJoint.lengthB;
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.maxLengthA = typeof htOption.maxLengthA != "undefined" ? htOption.maxLengthA : oJoint.maxLengthA; 
			oJoint.maxLengthB = typeof htOption.maxLengthB != "undefined" ? htOption.maxLengthB : oJoint.maxLengthB; 
			return this._oWorld.CreateJoint(oJoint);
		},
		
		/**
		 * WeldJoint를 만든다
		 * 
		 * @param {Box2D.Dynamics.b2Body} oBody1 연결할 왼쪽 body 
		 * @param {Box2D.Dynamics.b2Body} oBody2 연결할 오른쪽 body 
		 * @param {Box2D.Common.Math.b2Vec2} oAnchor 연결점
		 * @param {Object} htOption Joint 옵션
		 * @return {Box2D.Dynamics.Joints.b2Joint} 생성된 Joint
		 */
		createWeldJoint : function (oBody1, oBody2, oAnchor, htOption) {
			var oJoint = new Box2D.Dynamics.Joints.b2WeldJointDef();
			htOption = htOption || {};
			oJoint.Initialize(oBody1, oBody2, oAnchor);
			oJoint.localAnchorA = typeof htOption.localAnchorA != "undefined" ? htOption.localAnchorA : oJoint.localAnchorA; 
			oJoint.localAnchorB = typeof htOption.localAnchorB != "undefined" ? htOption.localAnchorB : oJoint.localAnchorB; 
			oJoint.referenceAngle = typeof htOption.referenceAngle != "undefined" ? htOption.referenceAngle : oJoint.referenceAngle; 
			return this._oWorld.CreateJoint(oJoint);
		},		
		
		/**
		 * 등록된 Joint를 지운다
		 * 
		 * @param {Box2D.Dynamics.Joints.b2Joint} oJoint
		 */
		removeJoint : function (oJoint) {
			this._oWorld.DestroyJoint(oJoint);
		},
		
		/**
		 * b2World를 생성한다
		 * 
		 * @param {Number} nGravity 중력
		 * @return {Box2D.Dynamics.b2World}
		 */
		createWorld : function (nGravity) {
			return new b2World(new b2Vec2(0, nGravity), true);
		},
		
		/**
		 * Box2d를 로드한다.
		 * 
		 * @param {Boolean} bIsDebug 디버깅용 레이어를 표시할지 여부
		 */
		load : function (bIsDebug) {
			if (!this._bIsLoaded) {
				this._bIsLoaded = true;
				this._nStep = Math.round(1000 / collie.Renderer.getDuration());
				
				if (bIsDebug) {
					this._setDebug(this._nWidth, this._nHeight);
				}
				
				collie.Renderer.attach("process", this._fOnProcess);
			}
		},
		
		/**
		 * Box2d를 해제하여 사용하지 않는다
		 */
		unload : function () {
			if (this._bIsLoaded) {
				this._bIsLoaded = false;
				collie.Renderer.detach("process", this._fOnProcess);
				this._unsetDebug();
			}
		},
		
		/**
		 * 스테이지 크기가 바뀔 경우
		 * 
		 * @param {Number} nWidth
		 * @param {Number} nHeight
		 */
		resize : function (nWidth, nHeight) {
			var x, y, width, height;
			this._nWidth = nWidth;
			this._nHeight = nHeight;
			
			if (this._htWall) {
				for (var i in this._htWall) {
					switch (i) {
						case "left" :
							x = -this.WIDTH_OF_WALL + (this.WIDTH_OF_WALL / 2);
							y = -this.WIDTH_OF_WALL + ((this._nHeight + this.WIDTH_OF_WALL * 2) / 2);
							width = this.WIDTH_OF_WALL;
							height = this._nHeight + this.WIDTH_OF_WALL * 2;
							break;
							
						case "right" :
							x = this._nWidth + (this.WIDTH_OF_WALL / 2);
							y = -this.WIDTH_OF_WALL + ((this._nHeight + this.WIDTH_OF_WALL * 2) / 2);
							width = this.WIDTH_OF_WALL;
							height = this._nHeight + this.WIDTH_OF_WALL * 2;
							break;
							
						case "top" :
							x = -this.WIDTH_OF_WALL + ((this._nWidth + this.WIDTH_OF_WALL * 2) / 2);
							y = -this.WIDTH_OF_WALL + (this.WIDTH_OF_WALL / 2);
							width = this._nWidth + this.WIDTH_OF_WALL * 2;
							height = this.WIDTH_OF_WALL;
							break;
							
						case "bottom" :
							x = -this.WIDTH_OF_WALL + ((this._nWidth + this.WIDTH_OF_WALL * 2) / 2);
							y = this._nHeight + (this.WIDTH_OF_WALL / 2);
							width = this._nWidth + this.WIDTH_OF_WALL * 2;
							height = this.WIDTH_OF_WALL;
							break;
					}
					
					x /= collie.Box2d.SCALE;
					y /= collie.Box2d.SCALE;
					width /= collie.Box2d.SCALE;
					height /= collie.Box2d.SCALE;
					this._htWall[i].SetPosition(collie.Box2d.vec2(x, y));
					this._htWall[i].GetFixtureList().GetShape().SetAsBox(width / 2, height / 2);
				}
			}
		},
		
		/**
		 * 디버깅 모드를 설정한다. 설정 후에는 화면에 Box2d 객체가 표시 된다
		 * @private
		 */
		_setDebug : function (nWidth, nHeight) {
			if (!this._bIsDebug) {
				if (this._oDebugLayer === null) {
					this._oDebugLayer = new collie.Layer({
						width: nWidth,
						height: nHeight
					});
				} else {
					this._oDebugLayer.resize(nWidth, nHeight);
				}
				
				collie.Renderer.addLayer(this._oDebugLayer);
				
				if (this._oDebugDraw === null) {
	                this._oDebugDraw = new b2DebugDraw();
	                this._oDebugDraw.SetSprite(this._oDebugLayer.getContext());
	                this._oDebugDraw.SetDrawScale(30.0);
	                this._oDebugDraw.SetFillAlpha(0.3);
	                this._oDebugDraw.SetLineThickness(1.0);
	                this._oDebugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	                this._oWorld.SetDebugDraw(this._oDebugDraw);
				}
				
                this._bIsDebug = true;
			}
		},
		
		/**
		 * 디버깅 모드를 해제한다
		 * @private
		 */
		_unsetDebug : function () {
			if (this._bIsDebug) {
				collie.Renderer.removeLayer(this._oDebugLayer);
				this._bIsDebug = false;
			}
		},
		
		_onProcess : function (e) {
            var nStepRate = 1 / this._nStep;
            this._oWorld.Step(nStepRate, this.ITERATIONS_VELOCITY, this.ITERATIONS_POSITION);
            this._oWorld.ClearForces();
			var body = this._oWorld.GetBodyList();
			
			// 등록된 객체가 있을 경우 업데이트
			if (body) {
				do {
					// 업데이트할 수 있는 객체면
					if (body.IsActive() && collie.Box2d.hasUserData(body)) {
						this._update(body);
					}
					
					body = body.GetNext();
				} while (body);
			}
			
            // 디버깅 용 box2d 객체 그림
            if (this._bIsDebug) {
            	this._oWorld.DrawDebugData();
            }
		},
		
		/**
		 * 객체의 상태를 업데이트
		 *
		 * @param {Box2D.Dynamics.b2Body} oBody 
		 */
		_update : function (oBody) {
			var oDisplayObject = collie.util.getDisplayObjectById(oBody.GetUserData());
			
			if (oDisplayObject) {
				var htInfo = oDisplayObject.get();
				var htPosition = oBody.GetPosition();
				oDisplayObject.set("angle", collie.util.toDeg(oBody.GetAngle()));
				oDisplayObject.set("x", (htPosition.x - ((htInfo.width / collie.Box2d.SCALE) / 2)) * collie.Box2d.SCALE);
				oDisplayObject.set("y", (htPosition.y - ((htInfo.height / collie.Box2d.SCALE) / 2)) * collie.Box2d.SCALE);
			} else {
				// displayObject가 사라졌다면 box2d 객체도 지움
				this._oWorld.DestroyBody(oBody);
			}
		}
	});
	
	/**
	 * b2Vec2를 생성해서 반환, 주로 속도에서 쓰임
	 *
	 * @static 
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Boolean} bIsPixel
	 * @return {Box2D.Common.Math.b2Vec2}
	 */
	collie.Box2d.vec2 = function (x, y, bIsPixel) {
		if (bIsPixel) {
			x /= collie.Box2d.SCALE;
			y /= collie.Box2d.SCALE;
		}
		
		return new b2Vec2(x, y);
	};
	
	/**
	 * UserData 설정돼 있는지 여부를 반환
	 *
	 * @static 
	 * @param {Box2D.Dynamics.b2Body} oBody 대상 Body 
	 * @return {Boolean} UserData가 있으면 true를 반환 
	 */
	collie.Box2d.hasUserData = function (oBody) {
		var userData = oBody.GetUserData();
		return (typeof userData != "undefined") && userData !== null; 
	};
	
	/**
	 * @static
	 * @property {Number} pixel을 meter로 바꿈;
	 */
	collie.Box2d.SCALE = 30;
	
	/**
	 * @static
	 * @property {Object} Body type
	 */
	collie.Box2d.BODY_TYPE = {
		STATIC : "static",
		KINEMATIC : "kinematic",
		DYNAMIC : "dynamic"
	};
})();
/**
 * 비트맵으로 구성된 숫자를 사용하기 위한 클래스
 * 0과 양수만 표현할 수 있다.
 * number에서 쓰이는 이미지는 0부터 9까지 가로로 나열된 스프라이트 이미지여야한다
 * @class collie.ImageNumber
 * @extends collie.DisplayObject
 * @param {Object} [htOption] 설정
 * @param {String} [htOption.textAlign="left"] 숫자 정렬 방법, left, right, center를 설정할 수 있다.
 * @param {Number} [htOption.letterSpacing=0] 숫자 간격 음수를 사용하면 간격이 줄어든다 단위는 px
 * @requires collie.addon.js
 * @example
 * var number = new collie.ImageNumber({
 * 	textAlign: "center",
 * 	letterSpacing: -5,
 * 	width: 300,
 * 	height: 100
 * }).number({
 * 	width: 90,
 * 	height: 100,
 * 	backgroundImage: "number" // This Image should be contained numbers from 0 to 9.  
 * }).comma({
 * 	width: 45, // comma method requires a width option
 * 	height: 100,
 * 	backgroundImage: "comma"
 * });
 * 
 * number.setValue(999000); // 'number' object would be shown by "999,000"
 * number.comma(false); // It would be shown by "999000"
 */
collie.ImageNumber = collie.Class(/** @lends collie.ImageNumber.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this._aNumber = [];
		this._aComma = [];
		this._nIndexNumber = null;
		this._nIndexComma = null;
		this._nValue = null;
		this.option({
			textAlign : "left",
			letterSpacing : 0
		}, null, true);
	},
	
	/**
	 * 값을 설정
	 * 
	 * @param {Number} nNumber
	 * @return {collie.ImageNumber}
	 */
	setValue : function (nNumber) {
		this._nValue = Math.max(0, parseInt(nNumber, 10));
		this._nIndexNumber = null;
		this._nIndexComma = null;
		var sNumber = this._nValue.toString();
		var len = sNumber.length;
		var nWidth = this._getWidth(this._nValue);
		var nStartLeft = this._getStartPosition(nWidth);
		var nLeft = nStartLeft + nWidth;
		var nCountNumber = 0;
		var bLastCharacter = false;
		
		for (var i = len - 1; i >= 0; i--) {
			// 세 자리 콤마 붙여야 할 때
			if (this._htOptionComma && nCountNumber % 3 === 0 && nCountNumber !== 0) {
				nLeft = nLeft - (this._htOptionComma.width + this._htOption.letterSpacing);
				this._getComma().set({
					x : nLeft,
					visible : true
				});
			}
			
			bLastCharacter = (nCountNumber === 0 && this._htOption.textAlign == "right") || (nCountNumber === len && this._htOption.textAlign == "left");
			nLeft = nLeft - (this._htOptionNumber.width + this._htOption.letterSpacing * (bLastCharacter ? 0 : 1));
			this._getNumber().set({
				x : nLeft,
				spriteX : parseInt(sNumber.charAt(i), 10),
				visible : true
			});
			
			nCountNumber++;
		}
		
		this._hideUnusedObject();
	},
	
	/**
	 * 설정된 값을 반환한다.
	 * @return {Number}
	 */
	getValue : function () {
		return this._nValue;
	},
	
	/**
	 * 숫자를 만들 때 사용할 옵션을 설정한다
	 * 
	 * @param {Object} htOption
	 * @see {collie.DisplayObject}
	 * @return {collie.ImageNumber}
	 */
	number : function (htOption) {
		this._htOptionNumber = htOption;
		return this;
	},
	
	/**
	 * 세 자리 콤마를 사용할 경우 콤마를 생성할 때 사용할 옵션을 설정한다
	 * 
	 * @param {Object|Boolean} htOption 콤마를 만들 때 사용할 옵션, 반드시 width를 입력해야 한다, false를 입력하면 콤마를 제거한다
	 * @see {collie.DisplayObject}
	 * @return {collie.ImageNumber}
	 */
	comma : function (htOption) {
		if (!htOption) {
			this._htOptionComma = null;
		} else {
			if (!("width" in htOption)) {
				throw new Error("comma method in ImageNumber requires a width property in options.");
			}
			
			this._htOptionComma = htOption;
		}
		
		if (this._nValue !== null) {
			this.setValue(this._nValue);
		}
		
		return this;
	},
	
	/**
	 * 현재 숫자의 표시될 너비를 구한다
	 * 
	 * @private
	 * @return {Number}
	 */
	_getWidth : function (nValue) {
		var sValue = nValue.toString();
		var nWidth = sValue.length * (this._htOptionNumber.width + this._htOption.letterSpacing);
		
		if (this._htOptionComma) {
			nWidth += Math.max(0, Math.ceil(sValue.length / 3 - 1)) * (this._htOptionComma.width + this._htOption.letterSpacing);
		}
		
		return nWidth;
	},
	
	/**
	 * 현재 숫자가 정렬에 따라 제일 처음에 표기될 위치를 반환한다.
	 * @private
	 * @return {Number}
	 */
	_getStartPosition : function (nWidth) {
		switch (this._htOption.textAlign) {
			case "right" :
				return this._htOption.width - nWidth;
				break;
				
			case "center" :
				return this._htOption.width / 2 - nWidth / 2;
				break;
				
			case "left" :
			default :
				return 0;
		}
	},
	
	/**
	 * Pool에서 빈 숫자 객체를 가져온다. 사용하지 않은 객체가 없으면 새로 생성한다
	 * 
	 * @private
	 * @return {collie.DisplayObject}
	 */
	_getNumber : function () {
		var startIdx = this._nIndexNumber === null ? 0 : this._nIndexNumber + 1;
		
		// 새로 생성
		if (this._aNumber.length < startIdx + 1) {
			 this._aNumber.push(new collie.DisplayObject(this._htOptionNumber).addTo(this));
		}
		
		this._nIndexNumber = startIdx;
		return this._aNumber[startIdx];
	},
	
	/**
	 * Pool에서 빈 콤마 객체를 가져온다. 사용하지 않은 객체가 없으면 새로 생성한다
	 * 
	 * @private
	 * @return {collie.DisplayObject}
	 */
	_getComma : function () {
		var startIdx = this._nIndexComma === null ? 0 : this._nIndexComma + 1;
		
		// 새로 생성
		if (this._aComma.length < startIdx + 1) {
			 this._aComma.push(new collie.DisplayObject(this._htOptionComma).addTo(this));
		}
		
		this._nIndexComma = startIdx;
		return this._aComma[startIdx];
	},
	
	/**
	 * 사용하지 않은 객체는 visible을 false로 설정한다
	 * @private
	 */
	_hideUnusedObject : function () {
		// 콤마는 생성 안됐을 경우에도 전부 없앰
		for (var i = this._nIndexComma !== null ? this._nIndexComma + 1 : 0, l = this._aComma.length; i < l; i++) {
			this._aComma[i].set("visible", false);
		}
		
		// 숫자는 없을 경우가 없으므로 전부 없애지 않음 (최소 0)
		if (this._nIndexNumber !== null) {
			for (var i = this._nIndexNumber + 1, l = this._aNumber.length; i < l; i++) {
				this._aNumber[i].set("visible", false);
			}
		}
	},

	/**
	 * 문자열로 클래스 정보 반환
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "ImageNumber" + (this.get("name") ? " " + this.get("name") : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	}
}, collie.DisplayObject);