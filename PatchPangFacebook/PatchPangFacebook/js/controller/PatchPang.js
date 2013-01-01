var PatchPang = function(boardLayer, bgLayer){
	// 타이머 
	this.timer = new GameTimerModel();
	this.timer.observe({
		"END_TIME" : function(e){
			logicView.deactivateUserEvent();
			
			console.log(this.score.getScore());


			var localSettings = Windows.Storage.ApplicationData.current.localSettings;
			

			WinJS.xhr({
			    type: "put",
			    url: "http://miconblog.com/api/record",
			    data: JSON.stringify({
			        score: this.score.getScore(),
			        id: localSettings.values["id"],
			        token: localSettings.values["accessToken"]
			    })
			}).done(function (result) {
			}, function (err) {
			});
			
			//alert("TIME OVER!");		
			$("#game").hide();
			$("#home").show();
		    //getRank();

			$("#ranking").trigger("click");
			
		}.bind(this)
	});
	new GameTimerView(this.timer, bgLayer);
	
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
			this.score.calculatePoint( e.result );
			
		}.bind(this)
	});
	logicView = new LogicBoardView(logic, boardLayer);
};

PatchPang.prototype.reset = function(){
	logic.initializeWithoutPang();
	logic.resetBoardItemPositioin();
	logic.search();
	
	logicView.activateUserEvent();
	this.score.reset();
	this.timer.reset();
	this.timer.start();
};