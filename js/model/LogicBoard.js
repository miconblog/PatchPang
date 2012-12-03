(function(){
	var SIZE = 60,
		logic = SearchAlgorithm;
	
	/**
	 * 인덱싱
	 */
	var reindex = function(block){
		_(block).each(function(v, i){
			if( v ){
				v.set("index", i);	
			}
		});
	};
	
	/**
	 * 자리이동 가능 여부 확인
	 */
	var canSwitchPos = function(p1, p2){
		
		if( Math.abs(p1-p2) === 1){
			if( Math.floor( p1 / 7 ) ===  Math.floor( p2 / 7 ) ){
				return true;
			} 
		}
		
		if( Math.abs(p1-p2) === 7){
			if( Math.floor( p1 % 7 ) ===  Math.floor( p2 % 7 ) ){
				return true;
			} 
		}
		
		return false;
	};
	
	/**
	 * 보드판을 담당하는 로직 모델
	 * @class LogicBoard
	 * @constructs
	 * @extend Observable
	 * 
	 * @returns {LogicBoard}
	 */
	LogicBoard = function() {

		this.board = []; 			// 7x7;
		this.block = [];			// 
		this.curSelectIndex = -1;  	// 현재 선택한 아이템, 없으면 -1;
		this.itemPool = new BlockItemPool(100);
		

		this.initializeWithTestSet();
		this.initBoardItemPositioin();
	};
	LogicBoard.prototype = new Observable();

	/**
	 * 보드 아이템의 위치를 초기화 한다.
	 */
	LogicBoard.prototype.initBoardItemPositioin = function(){
		// 화면에 표시할 객체를 만든다
		_(this.board).each( function(v, i){
			var x = i % 7;
			var y = Math.floor(i / 7);

			this.block[i] = this.itemPool.getOne({
				x : x * SIZE,
				y : y * SIZE,
				offsetY : 0,
				offsetX : 0, 
				spriteX : [v-1],
				spriteY : 0,
				index : i
			});
			
		}.bind(this) );
	};
	
	/**
	 * 보드 초기화
	 */
	LogicBoard.prototype.initialize = function() {
		var i = 0, l = 49;

		for (; i < l; ++i) {
			this.board[i] = 0;
		}
	};

	LogicBoard.prototype.initializeWithTestSet = function() {
		var i = 0, l = 49;

		for (; i < l; ++i) {
			this.board[i] = Math.floor(Math.random() * 100) % 7 + 1;
		}
		this.printBoard();
	};

	LogicBoard.prototype.initializeWithTestSet = function() {
		this.board = [6, 7, 7, 7, 7, 7, 7,
		              6, 7, 4, 4, 6, 7, 6,
		              5, 5, 5, 4, 5, 5, 6,
		              6, 3, 2, 4, 3, 7, 6,
		              6, 2, 1, 4, 5, 3, 6,
		              6, 6, 6, 4, 3, 6, 6,
		              6, 6, 6, 6, 6, 6, 6];

		this.board = [7, 2, 6, 5, 5, 1, 5,
					  5, 7, 4, 1, 6, 6, 2,
					  6, 3, 4, 7, 5, 4, 2,
					  4, 1, 7, 3, 3, 7, 7,
					  2, 5, 6, 3, 3, 6, 6,
					  7, 5, 2, 7, 3, 6, 1,
					  6, 4, 5, 7, 6, 5, 7];
		
		this.board = [	3, 6, 4, 7, 4, 6, 1,
						3, 2, 1, 2, 4, 2, 5,
						6, 5, 4, 3, 6, 2, 5,
						5, 5, 1, 3, 7, 5, 7,
						4, 3, 3, 2, 4, 1, 4,
						2, 4, 4, 4, 4, 2, 1,
						1, 5, 1, 2, 2, 1, 3] ;
		
		this.printBoard();
	};

	LogicBoard.prototype.initializeWithoutPang = function() {
		var i = 0, l = 49;

		for (; i < l; ++i) {
			this.board[i] = Math.floor(Math.random() * 100) % 7 + 1;
		}
		

		if( this.search().length === 0 ){
			console.log("다시 셋팅!");
			this.initializeWithoutPang();
		}else{
			this.printBoard();	
		}
		
	};


	/**
	 * 보드판을 콘솔 화면에 출력
	 */
	LogicBoard.prototype.printBoard = function() {
		var x, y, line=[];

		for (y = 0; y <7 ; ++y) {
			for (x = 0; x < 7; ++x) {
				line.push(this.board[y * 7 + x]);
			}
			console.log("> ", line);
			line = [];
		}
	};
	
	LogicBoard.prototype.printBlock = function() {
		var x, y, line=[];

		for (y = 0; y <7 ; ++y) {
			for (x = 0; x < 7; ++x) {
				
				var d = this.block[y * 7 + x];
				if(d.used){
					line.push(d.get("index"));	
				}else{
					line.push(-1);
				}
			}
			console.log("> ", line);
			line = [];
		}
	};

	/**
	 * 터질 녀석이 있는지 검색한다. 
	 * 검색은 총 5단계...
	 * 5개가 연결된 경우 패치팡~~!
	 * 4개가 연결된 경우 팡팡~~! 
	 * 3개가 연결된 경우 팡~!
	 */
	LogicBoard.prototype.search = function() {
		console.log("------------ search ----------------");
		
		var result = logic.search(this.board), indexes;
		
		console.log("검색결과: ", result);
		
		if ( !_.isEmpty(result)  ) {

			// 슈퍼 잼을 찾아내서 -1로 바꾼다. 
			//logic.replaceSuperZem(this.board, result);
			
			
			indexes = logic.collectIndexes(result);
			this.notify("CHANGE_BOARD", {
				result : result,
				indexes: indexes
			});	
		}
		this.printBoard();	
	};
	
	LogicBoard.prototype.targetSearch = function(p1, p2){
		
		var result = _.union(logic.targetSearch(this.board, p1), logic.targetSearch(this.board, p2));
		result = _.compact(result);
		
		if ( !_.isEmpty(result)  ) {

			
			// 슈퍼 잼을 찾아내서 -1로 바꾼다.  
			
			
			indexes = logic.collectIndexes(result);
			this.notify("CHANGE_BOARD", {
				result : result,
				indexes: indexes
			});	
			return true;
		}
		return false;
	};

	/**
	 * 인덱스를 바꾼다.
	 * @param p1
	 * @param p2
	 * @isRollback {Boolean} 롤백하는 경우엔 이벤트가 발생하지 않는다.
	 */
	LogicBoard.prototype.switchPos = function(p1, p2, isRollback){

		if( !canSwitchPos(p1, p2) ){
			
			console.log("자리를 바꿀수 없다. !!");
			return false;
		}
		
		var tmp = this.board[p2];
		this.board[p2] = this.board[p1];
		this.board[p1] = tmp;
		
		
		tmp = this.block[p2];
		this.block[p2] = this.block[p1];
		this.block[p1] = tmp;
		tmp = null;
		
		
		console.log("---- 자리 이동 ---- ");
		if(!isRollback){
			this.notify("SWITCH_BLOCKS", {
				p1 : p1, 
				p2 : p2
			});	
		}
		
		
		reindex(this.block);
		this.printBoard();
		return true;
	};

	/**
	 * 터진 공간 위로 올리기
	 */
	LogicBoard.prototype.fillTheSpace = function(){
		console.log("---- fill the space ----");
		
		_.each(this.board, function(v, i){
			var up, cur;	
			if( v === 0 ){
				this.block[i].used = false;
				//this.block[i] = 0;
				
				cur = i;
				// 만나면 맨위로 보내라!
				while (cur > -1){
					up = cur-7;
					if(up < 0){
						break;
					}
					
					if( this.board[cur] === this.board[up] ){
						break;
					}
					
					this.board[cur] = this.board[up];
					this.board[up] = 0;
					
					cur = up;
				}
				
				
			} 
		}.bind(this));
		
		_.each(this.block, function(v, i){
			var up, cur, tmp;
			if( !v.used ){
				cur = i;
				// 만나면 맨위로 보내라!
				while (cur > -1){
					up = cur-7;
					if(up < 0){
						break;
					}
					
					if( this.block[cur].used === this.block[up].used ){
						break;
					}
					
					tmp = this.block[cur]; 
					this.block[cur] = this.block[up];
					this.block[up] = tmp;
					cur = up;
				}
			} 
		}.bind(this));
		
		reindex(this.block);
	};

	/**
	 * 빈 공간 채우기
	 */
	LogicBoard.prototype.fillTheItem = function(){
		console.log("------ fill the item  -------");
		
		var items = [];
		
		_(this.board).each(function(v, i){
			
			if( v === 0 ){
				var x = i % 7;
				
				this.board[i] = Math.floor(Math.random() * 100) % 7 + 1;
				this.block[i] = this.itemPool.getOne({
					x : x * SIZE,
					y : -1 * SIZE,
					offsetY : 0,
					offsetX : 0, 
					spriteX : this.board[i]-1,
					spriteY : 0,
					index : i
				});
				
				items.push(this.block[i]);
			}
			
			
			if( v < 0 ){
				var vs = (-1 * v).toString();
				console.log( vs[0], vs[1] );
				
				this.board[i] = vs[0]-0;
				this.block[i].set({
					offsetY : 0,
					offsetX : 0, 
					spriteX : this.board[i]-1,
					spriteY : 0,
					index : i
				});
				
			}
			
			
		}.bind(this));
		
		reindex(this.block);
		
		this.notify("NEW_BLOCKS", {items: items});
	};
	
	/**
	 * 아이템 선택 
	 * 
	 * @param idx
	 */
	LogicBoard.prototype.selectItemIndex = function(idx){
		if( this.curSelectIndex < 0 ){
			this.curSelectIndex = idx;	
			this.notify("SELECT_ITEM", {
				index: idx
			});
		}else{
			
			if( this.curSelectIndex !== idx ){
				this.switchPos(this.curSelectIndex, idx);
				this.notify("UNSELECT_ITEM", {
					prev : this.curSelectIndex,
					index : idx,
				});
				this.curSelectIndex = -1;	
			}
		}
	};
	
})();