(function() {
	var SIZE = 60, MOVE = 20;
	
	/**
	 * 로직 보드 뷰
	 * 
	 * @returns
	 */
	LogicBoardView = function(model, collieLayer) {

		this.model = model;
		this.layer = collieLayer;
		this.userEvent;
		this.isMovingBlocks = false;

		this.initialize();
		this.initModelEvent();
		this.initItemEvent();
		this.initLayerEvent();
	};

	/**
	 * 보드판을 화면에 그린다.
	 */
	LogicBoardView.prototype.initialize = function() {

		_(this.model.block).each(function(v, i) {

			v.addTo(this.layer);

		}.bind(this));

	};
	
	LogicBoardView.prototype.clearBlocks = function(){
		_(this.model.block).each(function(v, i) {
			if( !v.used ){
				this.layer.removeChild(v);
			}
		}.bind(this));
	};

	LogicBoardView.prototype.moveBlocks = function() {
		
		this.isMovingBlocks = true;
		
		_(this.model.block).each(function(v, i) {
			
			var y = Math.floor(i / 7),
				cy = v.get("y");
			
			// 자신이 있어야 할 곳이 아니라면 이동 시킨다!
			if( y * SIZE !==  cy){
				collie.Timer.transition(v, 200, {
				    from : [cy],
				    to 	 : [y*SIZE],
				    set  : ["y"],
				    effect : collie.Effect.easeInQuart,
				    onComplete : function(){
				    	this.isMovingBlocks = false;
				    }.bind(this)
				});
			}
			
		}.bind(this));
	};
	
	
	LogicBoardView.prototype.validBlocks = function() {
		_(this.model.board).each( function(v, i){
			
			var x = i % 7;
			var y = Math.floor(i / 7);

			this.model.block[i].set({ 
				x : x * SIZE,
				y : y * SIZE,
				spriteX : [v-1]
			});
		}.bind(this) );
		
	};
	

	/**
	 * 두 아이템의 자리를 바꾼다. 
	 * 
	 * @param p1
	 * @param p2
	 * @param rollback 롤백하는 경우 true
	 */
	LogicBoardView.prototype.switchBlocks = function(p1, p2, rollback) {

		var x1 = this.model.block[p1].get("x"),
			x2 = this.model.block[p2].get("x"),
			y1 = this.model.block[p1].get("y"),
			y2 = this.model.block[p2].get("y"),
			view = this;
		
		this.isMovingBlocks = true;
		
		if( Math.abs( p1 - p2 ) === 1 ){	// 좌우 이동
			
			collie.Timer.transition(function(oEvent){
				view.model.block[p1].set("x", oEvent.value[0]);
				view.model.block[p2].set("x", oEvent.value[1]);
				
			}, 150, {
			    from : [x1, x2],
			    to 	 : [x2, x1],
			    onComplete : function(){
			    	view.model.block[p1].set("x", x2);
					view.model.block[p2].set("x", x1);
			    	view.model.switchedPos(p1, p2, rollback);
			    	view.isMovingBlocks = false;
			    }
			});
			
		} else if( Math.abs( p1 - p2 ) === 7 ) {								// 상하 이동
			
			collie.Timer.transition(function(oEvent){
				view.model.block[p1].set("y", oEvent.value[0]);
				view.model.block[p2].set("y", oEvent.value[1]);
			}, 150, {
			    from : [y1, y2],
			    to 	 : [y2, y1],
			    onComplete : function(){
			    	view.model.block[p1].set("y", y2);
					view.model.block[p2].set("y", y1);
			    	view.model.switchedPos(p1, p2, rollback);
			    	view.isMovingBlocks = false;
			    }
			});
		}
	};
	
	
	/**
	 * 0.2초간 터지는 애니메이션
	 */
	LogicBoardView.prototype.animatePang = function(indexes, callback){
		
		var view = this;

		this.isMovingBlocks = true;

		collie.Timer.cycle(function (e) {
			_(indexes).each(function(v){
				view.model.block[v].set({
					offsetY : 0,
					offsetX : 0,
					spriteX : e.value,
					spriteY : 0
				});	
			});
		}, 200, {
		    valueSet : [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
		    loop : 1,
		    onComplete: function () {
	            callback.apply(view);
		    	view.isMovingBlocks = false;
		    }
		});
	};
	
	
	LogicBoardView.prototype.initModelEvent = function() {
		// ## 모델 이벤트 옵저버
		this.model.observe({

			"CHANGE_BOARD" : function(e) {
			    console.log("============== CHANGE_BOARD ==============", e);			        Sound.start("effect" + (Math.round(Math.random() * 5) + 1));

			        // 일단 터질 녀석을 화면에서 효과를 내어 없앤다!
					this.animatePang(e.indexes, function(){
						// 터진 자리를 메꾸는 객체를 만들어낸다. 						this.model.fillTheSpace();						this.clearBlocks();						this.model.fillTheItem();						console.log("========== CHANGE_BOARD END ==========");					});
			}.bind(this),

			
			"NEW_BLOCKS" : function(e){
				
				console.log("============== NEW_BLOCKS ==============");	
				
				_(e.items).each(function(v){
					
//					console.log(v.used);
					
					v.addTo(this.layer);
				}.bind(this));
				
				this.moveBlocks();
				this.validBlocks();
				setTimeout(function(){
					this.model.search();
				}.bind(this), 250);
				
				console.log("============== NEW_BLOCKS END ==============");	
			}.bind(this),
			
			"SWITCH_BLOCKS" : function(e){
				
				console.log("SWITCH_BLOCKS -----> ", e.p1, e.p2, e.rollback );
				this.switchBlocks(e.p1, e.p2, e.rollback);
				
			}.bind(this),
			
			"SELECT_ITEM"  : function(e){
				this.model.block[e.index].set("spriteY", 1);
				
			}.bind(this),
			
			"UNSELECT_ITEM"  : function(e){
				this.model.block[e.prev].set("spriteY", 0);
				this.model.block[e.index].set("spriteY", 0);
			}.bind(this)
			
			
		});
		
	};
	
	LogicBoardView.prototype.initItemEvent = function(){
		if(!this.userEvent ){
			this.userEvent = {
				"mousedown" : function(e){
					
					if( this.isMovingBlocks ){
						this.isMouseDown = false;
						return;
					}
					
					this.isMouseDown = true;
					this.sx = e.x;
					this.sy = e.y;
					
					this.idx = e.displayObject.get("index");
					this.model.selectItemIndex(this.idx);	
					
				}.bind(this)
				
				
			};
		}
	};
	
	
	LogicBoardView.prototype.activateUserEvent = function(){
		_(this.model.itemPool.pool).each(function(v, i){
			v.attach(this.userEvent);
		}.bind(this));
	};
	
	
	LogicBoardView.prototype.deactivateUserEvent = function(){
		_(this.model.itemPool.pool).each(function(v, i){
			v.detach(this.userEvent);
		}.bind(this));
	};
	
	
	LogicBoardView.prototype.initLayerEvent = function() {
		this.layer.attach({
			"mousemove" : function(e){
				if(this.isMouseDown){
					var dx = e.x - this.sx;
					var dy = e.y - this.sy ;
					
					if( Math.abs(dx) > MOVE || Math.abs(dy) > MOVE ){
						this.isMouseDown = false;
					}
					
					if( dx > MOVE ){
						this.model.selectItemIndex(this.idx + 1);	
					}else if (dx < -MOVE ){
						this.model.selectItemIndex(this.idx - 1);
					}else if (dy > MOVE){
						this.model.selectItemIndex(this.idx + 7);
					}else if (dy < -MOVE){
						this.model.selectItemIndex(this.idx - 7);
					}
				}
			}.bind(this),
			
			"mouseup" : function(e){
				this.isMouseDown = false;
				
			}.bind(this)
		
		});
	};
})();
