﻿/**
 * 게임 타이머 뷰
 * 
 * @class
 * @returns
 */
var ComboView = function(model, collieLayer){
	this.model = model;
	this.layer = collieLayer;
	this.timer = null;
	this.initialize();
	this.initModelEvent();
};

ComboView.prototype.initialize = function(){
    this.combo = new collie.DisplayObject({
        x: 0,
        y: -50,
        visible: false,
        scaleX: 0.7,
        scaleY: 0.7,
        width: 237,
        height: 181,
        backgroundImage: "combo"
    }).right(10).addTo(this.layer);

	// 화면에 표시할 객체를 만든다
    this.dpScore = new collie.ImageNumber({
        y: "bottom",
	    width: 237,
	    height: 60,
        textAlign: "center"
	}).number({
	    width: 50,
	    height: 60,
        backgroundImage: "combo_number"
	}).addTo(this.combo); // layer에 붙인다
};

ComboView.prototype.initModelEvent = function(){
	this.model.observe({
	    "CHANGE_COMBO": function (e) {
	        if (this.timer === null) {
	            this.timer = collie.Timer.queue({
	                onStart: function () {
	                    this.combo.set("visible", true);
	                }.bind(this)
	            }).delay(function () {
	                this.combo.set("visible", false);
	            }.bind(this), 1000);
	        }

	        this.dpScore.setValue(e.count);
	        this.timer.reset();
	        this.timer.start();
		}.bind(this)
	});
};