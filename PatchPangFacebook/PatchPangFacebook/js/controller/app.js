var SIZE = 60;

// logo.png 이미지를 로딩한다
collie.ImageManager.add({
    "logo": "http://jindo.dev.naver.com/collie/img/small/logo.png",
    "animal": "/images/ani.png"
});

// 레이어를 만든다
var bgLayer = new collie.Layer({
    width: SIZE * 7,
    height: SIZE * 10
});

var boardLayer = new collie.Layer({
    width: SIZE * 7,
    height: SIZE * 7
});

if (collie.util.getDeviceInfo().ios) {
    bgLayer.resize(320, 480, true);
    boardLayer.resize(320, 320, true);
}

game = new PatchPang(boardLayer, bgLayer);

function gameLoad() {
    // 레이어를 렌더러에 붙인다
    collie.Renderer.addLayer(boardLayer);
    collie.Renderer.addLayer(bgLayer);

    //collie.Renderer.resize(320, 600, true);
    // 렌더러를 container 아이디의 엘리먼트에 불러온다
    collie.Renderer.load(document.getElementById("container"));

    // 렌더링을 시작한다
    collie.Renderer.start();
}

function gameUnload() {
    game.timer.stop();
    collie.Renderer.stop();
    collie.Renderer.unload();
    collie.Renderer.removeAllLayer();
}