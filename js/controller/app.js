(function() {
	var SIZE = 60;
	
	// logo.png 이미지를 로딩한다
	collie.ImageManager.add({
		"logo" 	 : "http://jindo.dev.naver.com/collie/img/small/logo.png",
		"animal" : "image/ani.png"
	});

	// 레이어를 만든다
	var layer = new collie.Layer({
		width : SIZE * 7,
		height : SIZE * 10
	});
	
	var itemLayer = new collie.Layer({
		width : SIZE * 7,
		height : SIZE * 7
	});
	

	// 레이어를 렌더러에 붙인다
	collie.Renderer.addLayer(layer);
	collie.Renderer.addLayer(itemLayer);

	// 렌더러를 container 아이디의 엘리먼트에 불러온다
	collie.Renderer.load(document.getElementById("container"));

	// 렌더링을 시작한다
	collie.Renderer.start();

	// 타이머 
	var timer = new GameTimerModel();
	timer.observe({
		"END_TIME" : function(e){
			//alert("TIME OVER!");
			logicView.deactivateUserEvent();
		}
	});
	var timerView = new GameTimerView(timer, layer);
	
	// 게임 점수
	var score = new GameScoreModel();
	var scoreView= new GameScoreView(score, layer);

	
	// 로직 보드
	logic = new LogicBoard();
	logic.observe({
		"CHANGE_BOARD" : function(e){
			score.calculatePoint( e.result );
			
		}
	});
	logicView = new LogicBoardView(logic, itemLayer);
	logic.search()

	timer.start();
})();