/**
 * 게임 타이머 모델 1분 동안 타이머가 동작한다.
 * @returns
 */
var GameTimerModel = function () {
<<<<<<< HEAD
    var TIME_LIMIT = 60; // sec
    var remainTime = TIME_LIMIT, nTick = null, lastTime, currTime;
    var self = this;
    var timer = collie.Timer.transition(function (e) {
        remainTime = TIME_LIMIT * e.value;
        self.notify("CHANGE_TIME", {
            percent: e.value,
            remainTime: remainTime,
            totalTime: TIME_LIMIT
        });
    }, TIME_LIMIT * 1000, {
        useAutoStart: false,
        from: 1,
        to: 0,
        onComplete: function () {
            remainTime = 0;
=======

	var remainTime = 60, // default 60 sec
	nTick = null, lastTime, currTime;
>>>>>>> 콤보모델 및 로직 버그 수정

            self.notify("END_TIME", {
                percent: 0,
                remainTime: remainTime,
                totalTime: TIME_LIMIT
            });
        }
    });
	
<<<<<<< HEAD
	this.start = function() {
	    timer.start();
=======
	this.start = function(nTime) {
		lastTime = new Date().getTime();
		nTick = setInterval(function() {

			currTime = new Date().getTime();

			if (currTime - lastTime > 1000) {
				remainTime--;
				lastTime = currTime;
				
				if(remainTime <= 0){
					remainTime = 0;
					self.notify("END_TIME", {
						remainTime : remainTime
					});
					self.stop();
				}else{
					self.notify("CHANGE_TIME", {
						remainTime : remainTime
					});
				}
			}
		}, 100);

>>>>>>> 콤보모델 및 로직 버그 수정
	},

	/**
	 * 타이머를 멈춘다.
	 * 
	 * @returns
	 */
	this.stop = function() {
	    timer.stop();
	};
	
	this.reset = function(){
<<<<<<< HEAD
	    remainTime = TIME_LIMIT;
	    timer.reset();
	    self.notify("RESET_TIME", {});
	    self.notify("CHANGE_TIME", {
            percent: 1,
		    remainTime: remainTime,
		    totalTime: TIME_LIMIT
=======
		remainTime = 60;
		self.notify("CHANGE_TIME", {
			remainTime : remainTime
>>>>>>> 콤보모델 및 로직 버그 수정
		});
	};
};

GameTimerModel.prototype = new Observable();