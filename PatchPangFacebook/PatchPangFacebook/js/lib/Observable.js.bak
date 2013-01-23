/**
 * @overview Observable Class - add event callbacks & invoke messages
 * @author ByungDae, SOHN(miconblog@gmail.com)
 * 
 * @class
 * @construct
 * @returns Observable Class
 */
var Observable = function () {
	this.handler = {};
};
Observable.prototype = {
	/**
	 * register event
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
	 * invoke event
	 * @param eventName
	 * @param eventData
	 */
	notify : function(eventName, eventData) {
		
		if( this.handler[eventName] && this.handler[eventName].length > 0 ){
			
			var self = this;
			
			// add end of message queue 
			setTimeout(function(){
				var i,l;
				
				for(i=0, l=self.handler[eventName].length;  i<l; ++i){
					self.handler[eventName][i].call(self, eventData);	
				}
				
			},0);
			
		}
	}
};