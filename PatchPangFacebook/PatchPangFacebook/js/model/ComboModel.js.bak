/**
 * 콤보 모델
 * @returns
 */
var ComboModel = function() {

	this.count = 0;
	this.lastTime = 0;
	this.intervalTime = 0;

};

ComboModel.prototype = new Observable();

// 현재시간 - 마지막 시간이 인터벌 보다 작은 더해라!!
ComboModel.prototype.add = function() {
	var now = new Date().getTime();
	var dt = now - this.lastTime;

	
	if ( dt < this.intervalTime) {
		this.count++;
	}else{
		this.count = 1;
	}

	this.lastTime = now;
	
	console.log("콤보 추가", this.count, 	"콤보 간격: ",dt, "  인터벌 타임: ", this.intervalTime);
	this.notify("CHANGE_COMBO", {count: this.count});
};

ComboModel.prototype.setRemainTime = function(nTime) {
	if (nTime > 40) {
		this.intervalTime = 3000;
	} else if (nTime > 20) {
		this.intervalTime = 1500;
	} else {
		this.intervalTime = 1000;
	}
	
	var now = new Date().getTime();
	var dt = now - this.lastTime;
	if ( dt > this.intervalTime) {
		this.count = 0;
	}
	
	this.notify("CHANGE_COMBO", {count: this.count});
};

ComboModel.prototype.reset = function() {
	this.count = 0;
	this.lastTime = new Date().getTime();
	this.intervalTime = 2000;
};
