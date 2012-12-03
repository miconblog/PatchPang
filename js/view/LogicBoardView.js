(function() {
	var SIZE = 60;
	
	/**
	 * 로직 보드 뷰
	 * 
	 * @returns
	 */
	LogicBoardView = function(model, collieLayer) {

		this.model = model;
		this.layer = collieLayer;
		this.userEvent;

		this.initialize();
		this.initModelEvent();
		this.initLayerEvent();
		this.initItemEvent();
	};

	/**
	 * 보드판을 화면에 그린다.
	 */
	LogicBoardView.prototype.initialize = function() {

		_(this.model.block).each(function(v, i) {

			v.addTo(this.layer);

		}.bind(this));

	};

	LogicBoardView.prototype.clearBlocks = function(){
		_(this.model.block).each(function(v, i) {
			if( !v.used ){
				this.layer.removeChild(v);
			}
		}.bind(this));
	};

	LogicBoardView.prototype.moveBlocks = function() {
		
		_(this.model.block).each(function(v, i) {
			
			var y = Math.floor(i / 7),
				cy = v.get("y");
			
			// 자신이 있어야 할 곳이 아니라면 이동 시킨다!
			if( y * SIZE !==  cy){
				v.isMove = true;
				collie.Timer.transition(v, 200, {
				    from : [cy],
				    to 	 : [y*SIZE],
				    set  : ["y"],
				    onComplete : function(){
				    	v.isMove = false;
				    }
				});
			}
			
		}.bind(this));
		
	};

	/**
	 * 두 아이템의 자리를 바꾼다. 
	 * 
	 * @param p1
	 * @param p2
	 */
	LogicBoardView.prototype.switchBlocks = function(p1, p2, rollback) {

		var x1 = this.model.block[p1].get("x"),
			x2 = this.model.block[p2].get("x"),
			y1 = this.model.block[p1].get("y"),
			y2 = this.model.block[p2].get("y"),
			view = this;
		
		if( Math.abs( p1 - p2 ) === 1 ){	// 좌우 이동
			
			collie.Timer.transition(function(oEvent){
				view.model.block[p1].set("x", oEvent.value[0]);
				view.model.block[p1].isMove = true;
				view.model.block[p2].set("x", oEvent.value[1]);
				view.model.block[p2].isMove = true;
			}, 200, {
			    from : [x1, x2],
			    to 	 : [x2, x1],
			    onComplete : function(){
			    	
			    	var result = view.model.targetSearch(p1, p2);
			    	view.model.block[p1].isMove = false;
			    	view.model.block[p2].isMove = false;
			    	
			    	if( rollback && !result ) {
			    		view.model.switchPos(p1, p2, true);
			    		view.switchBlocks(p1, p2, false);
			    	}
			    }
			});
			
		} else {								// 상하 이동
			
			collie.Timer.transition(function(oEvent){
				view.model.block[p1].set("y", oEvent.value[0]);
				view.model.block[p1].isMove = true;
				view.model.block[p2].set("y", oEvent.value[1]);
				view.model.block[p2].isMove = true;
			}, 200, {
			    from : [y1, y2],
			    to 	 : [y2, y1],
			    onComplete : function(){
			    	
			    	var result = view.model.targetSearch(p1, p2);
			    	view.model.block[p1].isMove = false;
			    	view.model.block[p2].isMove = false;
			    	
			    	if( rollback && !result ) {
			    		view.model.switchPos(p1, p2, true);
			    		view.switchBlocks(p1, p2, false);
			    	}
			    }
			});
		}
	};
	
	
	
	
	
	/**
	 * 0.2초간 터지는 애니메이션
	 */
	LogicBoardView.prototype.animatePang = function(indexes, callback){
		
		var view = this;
		
		collie.Timer.cycle(function (e) {
		    // 0, 1, 2, 1, 0 순으로 플레이
			//console.log("팡 애니메이션 타이머", e.count);
			
			_(indexes).each(function(v){
				
				view.model.block[v].isMove = true;
				view.model.block[v].set({
					offsetY : 0,
					offsetX : 0,
					spriteX : e.value,
					spriteY : 0
				});	
			});
			
			if(e.count === 10) {
				callback.apply(view);
			}
			
			
		}, 200, {
		    valueSet : [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
		    loop : 1,
		    onComplete: function(){
		    	_(indexes).each(function(v){
					view.model.block[v].isMove = false;
				});
		    }
		});
	};
	
	
	LogicBoardView.prototype.initModelEvent = function() {
		// ## 모델 이벤트 옵저버
		this.model.observe({

			"CHANGE_BOARD" : function(e) {
				console.log("============== CHANGE_BOARD ==============", e);					
					// 일단 터질 녀석을 화면에서 효과를 내어 없앤다!
					this.animatePang(e.indexes, function(){
						// 터진 자리를 메꾸는 객체를 만들어낸다. 						this.model.fillTheSpace();						this.model.printBoard();//						console.log("---");//						this.model.printBlock();

						this.clearBlocks();												this.model.fillTheItem();						this.model.printBoard();//						console.log("---");//						this.model.printBlock();												console.log("========== CHANGE_BOARD END ==========");					});
				
			}.bind(this),

			
			"NEW_BLOCKS" : function(e){
				
				console.log("============== NEW_BLOCKS ==============");	
				
				_(e.items).each(function(v){
					
//					console.log(v.used);
					
					v.addTo(this.layer);
				}.bind(this));
				
				this.moveBlocks();
				setTimeout(function(){
					this.model.search();
				}.bind(this), 250);
				
				console.log("============== NEW_BLOCKS END ==============");	
			}.bind(this),
			
			"SWITCH_BLOCKS" : function(e){
				
				this.switchBlocks(e.p1, e.p2, true);
				
				
			}.bind(this),
			
			"SELECT_ITEM"  : function(e){
				this.model.block[e.index].set("spriteY", 1);
				
			}.bind(this),
			
			"UNSELECT_ITEM"  : function(e){
				console.log("선택 취소", e);
				this.model.block[e.prev].set("spriteY", 0);
				this.model.block[e.index].set("spriteY", 0);
			}.bind(this)
			
			
		});
		
	};
	
	LogicBoardView.prototype.initItemEvent = function(){
		if(!this.userEvent ){
			this.userEvent = {
				"mousedown" : function(e){
					
					
					console.log(e.displayObject.isMove);
					if( ! e.displayObject.isMove ){
						var idx = e.displayObject.get("index");
						console.log(idx);
						this.model.selectItemIndex(idx);	
					}else{
						console.log(" 이동중인 녀석은 선택못해요!!! ");
					}
					
				}.bind(this)
			};
		}
		this.activateUserEvent();
	};
	
	LogicBoardView.prototype.activateUserEvent = function(){
		_(this.model.itemPool.pool).each(function(v, i){
			v.attach(this.userEvent);
		}.bind(this));
	};
	
	
	LogicBoardView.prototype.deactivateUserEvent = function(){
		_(this.model.itemPool.pool).each(function(v, i){
			v.detach(this.userEvent);
		}.bind(this));
	};
	
	
	LogicBoardView.prototype.initLayerEvent = function() {
		// ## 모델 이벤트 옵저버
		this.layer.attach({
//			"click" : function(e){
//				console.log(e);
//			}
		
		});
	};
})();
