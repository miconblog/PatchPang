(function() {
	var SIZE = 60, logic = SearchAlgorithm;
	ready = false;

	/**
	 * 인덱싱
	 */
	var reindex = function(block) {
		_(block).each(function(v, i) {
			if (v) {
				v.set("index", i);
			}
		});
	};

	/**
	 * 자리이동 가능 여부 확인
	 */
	var canSwitchPos = function(p1, p2) {

		if (Math.abs(p1 - p2) === 1) {
			if (Math.floor(p1 / 7) === Math.floor(p2 / 7)) {
				return true;
			}
		}

		if (Math.abs(p1 - p2) === 7) {
			if (Math.floor(p1 % 7) === Math.floor(p2 % 7)) {
				return true;
			}
		}

		return false;
	};

	/**
	 * 보드판을 담당하는 로직 모델
	 * 
	 * @class LogicBoard
	 * @constructs
	 * @extend Observable
	 * 
	 * @returns {LogicBoard}
	 */
	LogicBoard = function() {

		this.board = []; // 7x7;
		this.block = []; // 
		this.curSelectIndex = -1; // 현재 선택한 아이템, 없으면 -1;
		this.itemPool = new BlockItemPool(100);
		this.timerHint = null;
		this.timerPatchpatch = null;
		this.initializeWithTestSet();
		this.initBoardItemPositioin();
	};
	LogicBoard.prototype = new Observable();

	/**
	 * 보드 아이템의 위치를 초기화 한다.
	 */
	LogicBoard.prototype.initBoardItemPositioin = function() {
		// 화면에 표시할 객체를 만든다
		_(this.board).each(function(v, i) {
			var x = i % 7;
			var y = Math.floor(i / 7);

			this.block[i] = this.itemPool.getOne({
				x : x * SIZE,
				y : y * SIZE,
				offsetY : 0,
				offsetX : 0,
				spriteX : [ v - 1 ],
				spriteY : 0,
				index : i
			});

		}.bind(this));
	};

	LogicBoard.prototype.resetBoardItemPositioin = function() {
		_(this.board).each(function(v, i) {
			this.block[i].set({
				spriteX : [ v - 1 ]
			});
		}.bind(this));
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
		this.board = [ 6, 7, 7, 7, 7, 7, 7, 6, 7, 4, 4, 6, 7, 6, 5, 5, 5, 4, 5,
				5, 6, 6, 3, 2, 4, 3, 7, 6, 6, 2, 1, 4, 5, 3, 6, 6, 6, 6, 4, 3,
				6, 6, 6, 6, 6, 6, 6, 6, 6 ];

		this.board = [ 7, 2, 6, 5, 5, 1, 5, 5, 7, 4, 1, 6, 6, 2, 7, 3, 4, 7, 5,
				4, 2, 4, 1, 7, 1, 3, 7, 7, 2, 5, 6, 3, 2, 6, 6, 7, 5, 2, 3, 3,
				6, 1, 6, 4, 5, 7, 6, 5, 7 ];

		this.board = [ 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 3, 3, 3, 5, 3, 3, 3,
				5, 3, 3, 5, 3, 3, 3, 5, 3, 3, 5, 5, 5, 5, 3, 3, 3, 5, 3, 3, 3,
				3, 3, 3, 5, 3, 3, 3, 3, 3 ];

		this.printBoard();
	};

	LogicBoard.prototype.initializeWithoutPang = function() {
		var i = 0, l = 49;

		for (; i < l; ++i) {
			this.board[i] = Math.floor(Math.random() * 100) % 7 + 1;
		}

		this.hint = logic.findHint(this.board);
		if (this.hint === null) {
			console.log("다시 셋팅!");
			this.initializeWithoutPang();
		} else {
			this.resetHint();
			this.printBoard();
		}
	};

	/**
	 * 보드판을 콘솔 화면에 출력
	 */
	LogicBoard.prototype.printBoard = function() {
		var x, y, line = [];

		console.log("-------print Board------");
		for (y = 0; y < 7; ++y) {
			for (x = 0; x < 7; ++x) {
				line.push(this.board[y * 7 + x]);
			}
			console.log("> ", line);
			line = [];
		}
	};

	LogicBoard.prototype.printBlock = function() {
		var x, y, line = [];

		// console.log("-------print Block------");
		for (y = 0; y < 7; ++y) {
			for (x = 0; x < 7; ++x) {

				var d = this.block[y * 7 + x];
				if (d.used) {
					line.push(d.get("index"));
				} else {
					line.push(-1);
				}
			}
			// console.log("> ", line);
			line = [];
		}
	};

	/**
	 * 터질 녀석이 있는지 검색한다. 검색은 총 5단계... 5개가 연결된 경우 패치팡~~! 4개가 연결된 경우 팡팡~~! 3개가 연결된
	 * 경우 팡~!
	 */
	LogicBoard.prototype.search = function() {
		console.log("------------ search ----------------");

		var result = logic.search(this.board), indexes;
		if (!_.isEmpty(result)) {

			// 슈퍼 잼을 찾아내서 -1로 바꾼다.
			// logic.replaceSuperZem(this.board, result);
			indexes = logic.collectIndexes(result);
			this.notify("CHANGE_BOARD", {
				result : result,
				indexes : indexes
			});
		}
		this.printBoard();
		this.printBlock();
		this.hint = logic.findHint(this.board);

		if (this.hint === null) {
			this.initializeWithoutPang();
		}

	};

	/**
	 * 두 지점을 중심으로 검색을 시작한다.
	 * 
	 * @param p1
	 * @param p2
	 * @returns {Boolean}
	 */
	LogicBoard.prototype.searchTargets = function(p1, p2) {

		var result = _.union(logic.targetSearch(this.board, p1), logic
				.targetSearch(this.board, p2));
		return _.compact(result);
	};

	/**
	 * 실제 자리를 바꾸고 검색을 시작한다.
	 * 
	 * @param p1
	 * @param p2
	 * @param isRollback
	 */
	LogicBoard.prototype.switchedPos = function(p1, p2, isRollback) {
		// 이동 완료 상태로 변경
		this.board[p1] *= -1;
		this.board[p2] *= -1;

		// 실제 값을 이동
		var tmp = this.board[p2];
		this.board[p2] = this.board[p1];
		this.board[p1] = tmp;

		tmp = this.block[p2];
		this.block[p2] = this.block[p1];
		this.block[p1] = tmp;
		tmp = null;

		// 값 이동 후에는 블록의 인덱스를 재정렬한다.
		reindex(this.block);

		this.printBoard();
		// this.printBlock();

		// 되돌리는 경우엔 검색을 할 필요가 없다!
		if (isRollback) {
			
			if (this.board[p1] < 0 || this.board[p2] < 0) {
				tmp = this.board[p1] *= -1;
				this.board[p1] = this.board[p2] *= -1; 
				this.board[p2] = tmp;
			}

			this.printBoard();

			this.notify("VALID_CHECK");
			return;
		}

		// 그리고 타겟팅 된 지점을 중심으로 검색을 시작한다.
		var result = this.searchTargets(p1, p2);
		if (!_.isEmpty(result)) {

			// 슈퍼 잼을 찾아내서 -1로 바꾼다.
			indexes = logic.collectIndexes(result);
			this.notify("CHANGE_BOARD", {
				result : result,
				indexes : indexes
			});
		} else {
			console.log("검색 결과가 없어 되돌리자!!");
			this.switchingPos(p1, p2, true);
		}
	};

	/**
	 * 실제 자리를 이동하기전에 이동중인 상태로 만들고,.. 이동이 완료된 후에 검색을 한다.
	 * 
	 * @param p1
	 * @param p2
	 * @param isRollback
	 *            검색결과가 없어 되돌리는 경우 true
	 * @returns {Boolean}
	 */
	LogicBoard.prototype.switchingPos = function(p1, p2, isRollback) {

		// 이동가능한 자리인지 파악하고, 이동가능하면...
		if (canSwitchPos(p1, p2)) {

			// 이동 상태로 변경
			this.board[p1] *= -1;
			this.board[p2] *= -1;

			// 블록을 이동시킨다.
			this.notify("SWITCH_BLOCKS", {
				p1 : p1,
				p2 : p2,
				rollback : isRollback
			});
		}
	};

	/**
	 * 터진 공간 위로 올리기
	 */
	LogicBoard.prototype.fillTheSpace = function() {
		// console.log("---- fill the space ----");

		_.each(this.board, function(v, i) {
			var up, cur;
			if (v === 0) {
				this.block[i].used = false;
				// this.block[i] = 0;

				cur = i;
				// 만나면 맨위로 보내라!
				while (cur > -1) {
					up = cur - 7;
					if (up < 0) {
						break;
					}

					if (this.board[cur] === this.board[up]) {
						break;
					}

					this.board[cur] = this.board[up];
					this.board[up] = 0;

					cur = up;
				}

			}
		}.bind(this));

		_.each(this.block, function(v, i) {
			var up, cur, tmp;
			if (!v.used) {
				cur = i;
				// 만나면 맨위로 보내라!
				while (cur > -1) {
					up = cur - 7;
					if (up < 0) {
						break;
					}

					if (this.block[cur].used === this.block[up].used) {
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
	LogicBoard.prototype.fillTheItem = function() {
		// console.log("------ fill the item -------");

		var items = [];

		_(this.board).each(function(v, i) {

			if (v === 0) {
				var x = i % 7;

				this.board[i] = Math.floor(Math.random() * 100) % 7 + 1;
				this.block[i] = this.itemPool.getOne({
					x : x * SIZE,
					y : -1 * SIZE,
					offsetY : 0,
					offsetX : 0,
					spriteX : this.board[i] - 1,
					spriteY : 0,
					index : i
				});

				items.push(this.block[i]);
			}

			if (v < 0) {
				var vs = (-1 * v).toString();

				this.board[i] = vs[0] - 0;
				this.block[i].set({
					offsetY : 0,
					offsetX : 0,
					spriteX : this.board[i] - 1,
					spriteY : 0,
					index : i
				});

			}

		}.bind(this));

		reindex(this.block);
		this.notify("NEW_BLOCKS", {
			items : items
		});
	};

	/**
	 * 아이템 선택
	 * 
	 * @param idx
	 */
	LogicBoard.prototype.selectItemIndex = function(idx) {

		// 없거나 빈공간은 패스~!
		console.log("선택한 공간의 값은? ", this.board[idx]);
		if (!this.board[idx] || this.board[idx] < 1) {
			// this.printBoard();
			return;
		}

		if (this.curSelectIndex < 0) {
			this.curSelectIndex = idx;
			this.notify("SELECT_ITEM", {
				index : idx
			});
		} else {

			if (this.curSelectIndex !== idx) {
				this.switchingPos(this.curSelectIndex, idx, false);

				this.resetHint();

				this.notify("UNSELECT_ITEM", {
					prev : this.curSelectIndex,
					index : idx,
				});
				this.curSelectIndex = -1;
			}
		}
	};

	/**
	 * 지정한 시간안에 액션이 없으면 힌트를 발동시킨다.
	 * 
	 * 5초 힌트..
	 */
	LogicBoard.prototype.resetHint = function(){
		if (this.timerHint === null) {
		    this.timerHint = collie.Timer.delay(this.findHint.bind(this), 5000, {
		        useAutoStart: false
		    });
		}

		if (this.timerPatchpatch === null) {
		    this.timerPatchpatch = collie.Timer.delay(function () {
		        Sound.start("patchpatch");
		    }.bind(this), 3000, {
		        useAutoStart: false
		    });
		}

		this.timerHint.stop();
		this.timerHint.start();
		this.timerPatchpatch.stop();
		this.timerPatchpatch.start();
	};
	
	
	LogicBoard.prototype.findHint = function(){
		if( this.hint ){
		    this.block[this.hint].set("spriteY", 1);
		    Sound.start("hint");
		}else{
			this.initializeWithoutPang();
		}
	};

	LogicBoard.prototype.stop = function () {
	    this.timerHint.stop();
	    this.timerPatchpatch.stop();
	};
})();