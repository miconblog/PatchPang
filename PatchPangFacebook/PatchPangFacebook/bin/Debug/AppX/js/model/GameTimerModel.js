/**
 * 게임 타이머 모델 1분 동안 타이머가 동작한다.
 * @returns
 */
var GameTimerModel = function () {
    var TIME_LIMIT = 1; // sec
    var remainTime = TIME_LIMIT;
    var nTick = null;
    var lastTime, currTime;
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
            self.notify("END_TIME", {
                percent: 0,
                remainTime: remainTime,
                totalTime: TIME_LIMIT
            });
        }
    });
	
    this.start = function () {
        timer.start();
    };

	/**
	 * 타이머를 멈춘다.
	 * 
	 * @returns
	 */
	this.stop = function() {
	    timer.stop();
	};
	
	this.reset = function(){
	    remainTime = TIME_LIMIT;
	    timer.reset();
	    self.notify("RESET_TIME", {});
	    self.notify("CHANGE_TIME", {
            percent: 1,
		    remainTime: remainTime,
		    totalTime: TIME_LIMIT
		});
	};
};

GameTimerModel.prototype = new Observable();