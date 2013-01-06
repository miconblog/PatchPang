var PatchPang = function(boardLayer, bgLayer){
	// 타이머 
	this.timer = new GameTimerModel();
	this.timer.observe({
		"CHANGE_TIME" : function(e){
			this.combo.setRemainTime(e.remainTime);
		}.bind(this),
		
		"END_TIME" : function(e){
			logicView.deactivateUserEvent();
			
			console.log( this.score.getScore() );
			
			var score = new Rank({
				score: this.score.getScore(),
				id : USER.id,
				token: USER.token
			});
			score.save();
			this.score.end();
			
			alert("TIME OVER!");		
			$("#game").hide();
			$("#home").show();
			getRank();
			
		}.bind(this)
	});
	new GameTimerView(this.timer, bgLayer);
	
	// 콤보 
	this.combo = new ComboModel();
	new GameTimerView(this.combo, bgLayer);
	
	
	// 게임 점수
	this.score = new GameScoreModel();
	this.score.observe({
		"GAME_START" : function(){
			this.reset();
		}.bind(this)
	});
	new GameScoreView(this.score, bgLayer);

	
	// 로직 보드
	logic = new LogicBoard();
	logic.observe({
		"CHANGE_BOARD" : function(e){
			this.combo.add();
			this.score.calculatePoint( e.result, this.combo.count);
						
		}.bind(this)
	});
	logicView = new LogicBoardView(logic, boardLayer);
};

PatchPang.prototype.reset = function(){
	logic.initializeWithoutPang();
	logic.resetBoardItemPositioin();
	logic.search();
	
	logicView.activateUserEvent();
	collie.Renderer.refresh();
	this.combo.reset();
	this.score.reset();
	this.timer.reset();
	this.timer.start();
};