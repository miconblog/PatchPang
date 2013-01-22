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
	
	this.reset = function(){
		totalScore = 0;
		this.notify("CHANGE_SCORE", { score: totalScore });
	};
	
	this.getScore = function(){
		return totalScore;
	};
};

GameScoreModel.prototype = new Observable();
GameScoreModel.prototype.calculatePoint = function(result){
	
	var points = 0,
		point = [200,300,400,500,600,700,800,900,1000];
	
	_.each(result, function(o){
		
		 points += point[o.indexes.length-3]; 
	});
	
	this.plus(points);
};


GameScoreModel.prototype.end = function(){

	this.notify("GAME_END");
};
