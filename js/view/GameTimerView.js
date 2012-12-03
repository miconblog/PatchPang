/**
 * 게임 타이머 뷰
 * 
 * @class
 * @returns
 */
var GameTimerView = function(model, collieLayer){
	
	this.model = model;
	this.layer = collieLayer;
	
	this.initialize();
	this.initModelEvent();
	this.initViewItemEvent();
};

GameTimerView.prototype.initialize = function(){
	
	// 화면에 표시할 객체를 만든다
	this.dpTimer = new collie.MovableObject({
		x : "left",
		y : "bottom",
		//velocityRotate : 180,
		backgroundImage : "logo" // 배경 이미지는 아까 로딩한 logo.png, 크기는 자동 설정 된다
	}).addTo(this.layer); // layer에 붙인다
};

GameTimerView.prototype.initModelEvent = function(){
	this.model.observe({
		"CHANGE_TIME" : function(oData){

			this.dpTimer.set('angle', -1*360*oData.remainTime / 60);
			
		}.bind(this),
		
		"END_TIME" : function(oData) {
			
			console.log(this, "END_TIME", oData.remainTime);
			
		}.bind(this)
	});
};


GameTimerView.prototype.initViewItemEvent = function(){
	this.dpTimer.attach("mousedown", function(){
		this.model.reset();
		
		this.notify("CLICK_TIMER");
		
	}.bind(this));
};

