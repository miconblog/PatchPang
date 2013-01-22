/**
 * 게임 타이머 모델 1분 동안 타이머가 동작한다.
 * @returns
 */
var GameTimerModel = function () {

	var remainTime = 60, // default 60 sec
	nTick = null, lastTime, currTime;

	var self = this;
	
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

	},

	/**
	 * 타이머를 멈춘다.
	 * 
	 * @returns
	 */
	this.stop = function() {
		if (nTick !== null) {
			clearInterval(nTick);
			nTick = null;
		}
	};
	
	this.reset = function(){
		remainTime = 60;
		self.notify("CHANGE_TIME", {
			remainTime : remainTime
		});
	};
};

GameTimerModel.prototype = new Observable();