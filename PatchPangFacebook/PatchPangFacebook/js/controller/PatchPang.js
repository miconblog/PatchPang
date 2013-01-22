var PatchPang = function (boardLayer, bgLayer) {
    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    this.gameover = new collie.DisplayObject({
        x: "center",
        y: 0,
        width: 300,
        height: 337,
        backgroundImage: "game_over",
        visible: false,
        zIndex: 5
    }).addTo(boardLayer);

	// 타이머 
	this.timer = new GameTimerModel();
	this.timer.observe({
	    "END_TIME": function (e) {
	        var timeLimit = 3 * 1000; // 기다려주는 시간, 점수 등록 시간이랑 이 시간 중에 더 긴 시간을 기준으로 한다

			logicView.deactivateUserEvent();
			console.log(this.score.getScore());
			var localSettings = Windows.Storage.ApplicationData.current.localSettings;
			var startTime = (+new Date());

			console.log(JSON.stringify({
			    score: this.score.getScore(),
			    id: localSettings.values["id"],
			    token: localSettings.values["accessToken"]
			}));

			Sound.stopBG();
			Sound.stop();
			logic.stop();
			this.gameover.set("visible", true);
			Sound.start("end");

            // 점수 등록
			WinJS.xhr({
			    type: "PUT",
			    url: "http://miconblog.com:8888/api/record/" + localSettings.values["id"],
			    data: JSON.stringify({
			        score: this.score.getScore(),
			        id: localSettings.values["id"],
			        token: localSettings.values["accessToken"]
			    })
			}).then(function (result) {
			    var duringTime = (+new Date()) - startTime;
			    var term = 0;

                // 3초보다 오래 걸렸으면 바로 실행, 아니면 기다렸다 실행
			    if (duringTime < timeLimit) {
			        term = timeLimit - duringTime;
			    }

                // 랭킹 페이지로 이동
			    setTimeout(function () {
			        WinJS.Navigation.navigate("/pages/ranking/ranking.html", {
                        isAfterGame: true                        
			        });
			    }, Math.max(0, term));
			}, function (err) {
			    new Windows.UI.Popups.MessageDialog("랭킹을 등록하는 도중 에러가 발생했습니다", "Error").showAsync();
			    console.log(err);
			});
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
	collie.Renderer.refresh();
	this.gameover.set("visible", false);
	this.score.reset();
	this.timer.reset();
	this.timer.start();
};