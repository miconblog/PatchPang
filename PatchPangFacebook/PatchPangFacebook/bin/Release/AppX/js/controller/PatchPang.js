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
			var score = this.score.getScore();

            // 로그인 안된 상태면 스코어를 로컬에 저장
			if (!localSettings.values["id"]) {
			    localSettings.values["beforeScore"] = localSettings.values["score"];
			    localSettings.values["score"] = score;
                
			    var term = timeLimit;

			    // 랭킹 페이지로 이동
			    setTimeout(function () {
			        WinJS.Navigation.navigate("/pages/ranking/ranking.html", {
			            isAfterGame: true,
			            score: score,
			            bestScore: localSettings.values["beforeScore"] ? localSettings.values["beforeScore"] : 0
			        });
			    }, term);
			} else {
			    // 점수 등록
			    WinJS.xhr({
			        type: "PUT",
			        url: "http://miconblog.com:8888/api/record/" + localSettings.values["id"],
			        data: JSON.stringify({
			            score: score,
			            id: localSettings.values["id"],
			            token: localSettings.values["accessToken"]
			        })
			    }).then(function (result) {
			        var resultData = JSON.parse(result.responseText);
			        var duringTime = (+new Date()) - startTime;
			        var term = 0;

			        // 3초보다 오래 걸렸으면 바로 실행, 아니면 기다렸다 실행
			        if (duringTime < timeLimit) {
			            term = timeLimit - duringTime;
			        }

			        //console.log("end!!!!!!!!!!!!!!!!!!!!!!!");
			        //console.log("http://miconblog.com:8888/api/record/" + localSettings.values["id"]);
			        //console.log(JSON.stringify({
			        //    score: score,
			        //    id: localSettings.values["id"],
			        //    token: localSettings.values["accessToken"]
			        //}));
			        //console.log(result.responseText);
			        //console.log(resultData.data && resultData.data.beforeBestScore ? resultData.data.beforeBestScore : 0);

			        // 랭킹 페이지로 이동
			        setTimeout(function () {
			            WinJS.Navigation.navigate("/pages/ranking/ranking.html", {
			                isAfterGame: true,
			                score: score,
			                bestScore: resultData.data && resultData.data.beforeBestScore ? resultData.data.beforeBestScore : 0
			            });
			        }, Math.max(0, term));
			    }, function (err) {
			        new Windows.UI.Popups.MessageDialog("랭킹을 등록하는 도중 에러가 발생했습니다", "Error").showAsync();
			        console.log(err);
			    });
			}
		}.bind(this)
	});
	new GameTimerView(this.timer, bgLayer);
	
	// 콤보 
	this.combo = new ComboModel();
	new ComboView(this.combo, bgLayer);
	
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

	this.gameover.set("visible", false);
	this.combo.reset();
	this.score.reset();
	this.timer.reset();
	this.timer.start();
};