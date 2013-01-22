/**
 * 게임 타이머 뷰
 * 
 * @class
 * @returns
 */
var ComboView = function(model, collieLayer){
	
	this.model = model;
	this.layer = collieLayer;
	
	this.initialize();
	this.initModelEvent();
};

ComboView.prototype.initialize = function(){
	
	// 화면에 표시할 객체를 만든다
	this.dpScore = new collie.Text({
		x : 250,
		y : "bottom",
		width : 250, // 너비와 높이를 반드시 지정해야 합니다.
	    height : 100,
	    fontSize : 45,
	    fontColor : "#234"
	}).addTo(this.layer); // layer에 붙인다
};

ComboView.prototype.initModelEvent = function(){
	this.model.observe({
		"CHANGE_COMBO" : function(e){
			this.dpScore.text(e.count);
		}.bind(this)
	});
};