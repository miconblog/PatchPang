/**
 * 게임 점수 모델
 * @returns
 */
var GameScoreModel = function () {

	var totalScore = 0;
	
	this.plus = function(nPoint){
		totalScore += nPoint;
		
		this.notify("CHANGE_SCORE", { score: totalScore });
	};
};

GameScoreModel.prototype = new Observable();
GameScoreModel.prototype.calculatePoint = function(result){
	
	var points = 0;
	
	_.each(result, function(o){
		 points += o.indexes.length * 10; 
	});
	
	this.plus(points);
};