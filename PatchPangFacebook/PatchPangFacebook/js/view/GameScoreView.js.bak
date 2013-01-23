/**
 * 게임 점수 뷰
 * 
 * 
 * @returns
 */
var GameScoreView = function(model, collieLayer){
	this.model = model;
	this.layer = collieLayer;
	this.initialize();
	this.initModelEvent();
};

GameScoreView.prototype.initialize = function () {
    this.scoreText = new collie.DisplayObject({
        x: 0,
        y: 54,
        backgroundImage: "score"
    }).addTo(this.layer);

    this.dpScore = new collie.ImageNumber({
        x: 60,
        y: 50,
        width: 300,
        height: 30
    }).number({
        width: 25,
        height: 30,
        backgroundImage: "combo_number_small"
    }).addTo(this.layer);
};

GameScoreView.prototype.initModelEvent = function(){
	this.model.observe({
		"CHANGE_SCORE" : function(e){
			this.dpScore.setValue(e.score);
			this.dpScore.detachAll("click");
		}.bind(this)
	});
};