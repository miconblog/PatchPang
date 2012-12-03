/**
 * @overview 이벤트를 등록하고, 발생시켜주는 옵져버 클래스
 * @author ByungDae, SOHN(miconblog@gmail.com)
 * 
 * @class
 * @construct
 * @returns 옵저버 객체를 반환
 */
var Observable = function () {
	this.handler = {};
};
Observable.prototype = {
	/**
	 * 감지할 이벤트를 등록한다.
	 */
	observe : function(oEvent) {
		
		for( eventName in oEvent ){
			if( oEvent.hasOwnProperty(eventName) ){
				
				if(!this.handler[eventName] ){
					this.handler[eventName] = [];
				}
				
				this.handler[eventName].push(oEvent[eventName]);
			}
		}
	},

	/**
	 * 등록된 이벤트를 모두 발생시킨다.
	 * @param eventName
	 * @param eventData
	 */
	notify : function(eventName, eventData) {
		
		if( this.handler[eventName].length > 0 ){
			
			var self = this;
			
			// 큐의 맨뒤에 쌓는다.
			setTimeout(function(){
				var i,l;
				
				for(i=0, l=self.handler[eventName].length;  i<l; ++i){
					self.handler[eventName][i].call(self, eventData);	
				}
				
			},0);
			
		}
	}
};