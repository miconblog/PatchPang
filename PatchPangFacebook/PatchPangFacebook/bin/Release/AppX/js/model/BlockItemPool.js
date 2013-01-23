(function(){
	
	var SIZE = 60;
	
	BlockItemPool = function (poolSize) {
		var i=0;

		this.pool = [];
		this.poolSize = poolSize;
		
		for(; i<poolSize; ++i){
			
			var item = new collie.DisplayObject({
				width : SIZE * 2, 
			    height : SIZE * 2,
			    originX: 'left',
			    originY: 'top',
			    scaleX : 0.5,
			    scaleY : 0.5,
			    spriteWidth  : SIZE,
			    spriteHeight : SIZE,
			    backgroundImage : "animal",
			    offsetX : 0,
			    offsetY : 0,
			    spriteX : 0,
			    spriteY : 0,
			    spriteLength : 14,
			    isMoving : false
			});
			
			item.used = false;
			this.pool.push(item);
		}
	};
	
	
	BlockItemPool.prototype.reset = function () {
	    this.pool.forEach(function (v, i, a) {
	        v.set("backgroundImage", null);
	        v.set("backgroundImage", "animal");
	    });
	};

	BlockItemPool.prototype.getOne = function(opt){
		var i=0;
		for(; i < this.poolSize; ++i){
			
			if(!this.pool[i].used ){
				this.pool[i].used = true;
				this.pool[i].set(opt);
				this.pool[i].set("isMoving", false);
				return this.pool[i];
			}
		}
		
		throw new Error("full the Pool");
	};

})();