/**
 * @overview N x N 보드판을 탐색하는 알고리즘
 * @author ByungDae, SOHN(miconblog@gmail.com)
 * 
 *  1. 연속된 숫자가 많은 것부터 검색한다.
 *     즉, 7개 연속된 수부터 3개가 연속된 수까지 탐색한다. 
 *   
 *  2. 좌에서 우로 가로 검색을 먼저 한후, 세로 검색을 한다. 
 *     가로 검색은, 
 *  	  [1,2][1,3][1,4].... 으로 검색하는 방법
 *     세로 검색은 
 *  	  [1,8][1,15][1,22]... 로 검색하는 방법이다.   
 *  
 *  3. 검색된 결과에서 크로스 검색을 다시한다.  
 * @depends underscore.js
 */
(function(){
	var N = 7;	// 보드판 크기
	
	/**
	 * 연속된 숫자를 찾아서 반환한다. 
	 * @param {Array} board 보드판
	 * @param {Number} start 시작 위치
	 * @param {Number} length 연속된 숫자의 길이
	 *  
	 * @returns {Array} 없으면 null을 반환
	 */
	var search = function(board, start, length) {
		//console.log("------------ search ", start, length," -----------");
		
		var x, y, ret=[], idx=[];
		
		// 가로 검색
		for( y=0; y<N; ++y){
			
			if( board[y*N+start] < 1 ){ continue; }	// 값이 0보다 작으면 통과!
			
			idx.length = 0;
			idx.push(y*N+start);
			for(x=1; x<length; ++x){
				if( board[y*N+x+start] !== board[y*N+start] ){
					break;
				}
				idx.push(y*N+x+start);
			}
			
			if( idx.length === length ){
				ret.push({
					number : board[y*N+start],
					indexes: idx.concat(),
					dir : 1
				});
				
				_.each(idx, function(v){
					board[v] = 0;
				});
			}
		}
		
		
		// 가로 검색시 7개짜리가 하나라도 발견되면, 세로 검색에선 7개가 나올수 없다!
		if(length === N && ret.length>0){
			//console.log("결과", ret.length ? ret : null);
			return ret.length ? ret : null;
		}
		
		// 세로 검색
		for( x=0; x<N; ++x){
			
			if( board[x+start*N] < 1 ){ continue; }	// 값이 0보다 작으면 통과!
			
			idx.length = 0;
			idx.push(x+start*N);
			for(y=1; y<length; ++y){
				if( board[y*N+(x+start*N)] !== board[x+start*N] ){
					break;
				}
				idx.push(y*N+(x+start*N));
			}
			
			if( idx.length === length ){
				ret.push({
					number : board[x+start*N],
					indexes: idx.concat(),
					dir : 0
				});
				
				_.each(idx, function(v){
					board[v] = 0;
				});
			}
		}
		
		//console.log("결과", ret.length ? ret : null);
		return ret.length ? ret : null;
	};
	
	/**
	 * 연속된 길이별로 검색한다. 
	 * @param {Array} board 보드판
	 * @param {Number} length 연속된 숫자의 길이
	 * 
	 * @returns {Array} 없으면 빈 배열을 반환
	 */
	var searchByLength = function(board, length){
		
		var i, max=N-length, result=[];
		
		for(i=0; i <= max; ++i){
			result.push( search(board, i, length) );
		}
		return _.compact(result)[0];
		
	};
	
	/**
	 * 아이템에 있는 인덱스 목록을 다시 위,아래로 검색한다. 
	 * 검색해서 같은 값이 있으면 인덱스에 추가한다. 
	 * 
	 * @param {Array} board 보드판
	 * @param {Object} item 세로 검색에서 검색된 결과 
	 */
	var verticalSearch = function(board, item){
		
		_.each( item.indexes, function(v){
			var basket = [v];
			
			// up search
			var idx = v-7; 
			while(idx > -1){
			
				if ( board[idx] !== item.number ){
					break;
				}
				basket.push(idx);
				idx -= 7;
			}
			
				
			// down search
			idx = v+7;
			while(idx < 49){
				
				if ( board[idx] !== item.number ){
					break;
				}
				basket.push(idx);
				idx += 7;
			}
			
			
			// check length;
			if( 3 <= basket.length ){
				
				_.each(basket, function(v){
					board[v] = 0;
				});
				item.indexes = _.uniq(basket);
				item.dir = 3;
			}
		});
		
		return item;
	};
	
	
	/**
	 * 아이템에 있는 인덱스 목록을 다시 좌우로 검색한다. 
	 * 검색해서 같은 값이 있으면 인덱스에 추가한다. 
	 * 
	 * @param {Array} board 보드판
	 * @param {Object} item 가로 검색에서 검색된 결과 
	 */
	var horizontalSearch = function(board, item){
		
		_.each( item.indexes, function(v){
			var basket = [v];
			
			// left search
			var idx = v-1, 
				value = Math.floor( v / 7 );
			
			while( Math.floor( idx / 7 ) === value ){	// 같은 라인 선상에 있는 경우
				if ( board[idx] !== item.number ){
					break;
				}
				basket.push(idx);
				idx -= 1;
			}
			
				
			// right search
			idx = v+1;
			while( Math.floor( idx / 7 ) === value ){  // 같은 라인 선상에 있는 경우
				if ( board[idx] !== item.number ){
					break;
				}
				basket.push(idx);
				idx += 1;
			}
			
			// check length;
			if( 3 <= basket.length ){
				
				_.each(basket, function(v){
					board[v] = 0;
				});
				item.indexes = _.uniq(basket);
				item.dir = 4;
			}
		});
		
		return item;
	};
	
	var doCrossSearch = function(board, a){
		var result = [];
		
		_.each(a, function(b){
			_.each(b, function(v){
				if( v.dir ){	// 수직 검색 

					result.push( verticalSearch(board, v) );
					
				}else{			// 수평 검색
					
					result.push( horizontalSearch(board, v) );
				}
			});
		});
		
		return _.compact(result);
	};
	
	SearchAlgorithm = {
			
		search : function(board){
			var i, result=[];
			
			for( i=7; i>2; --i){
				result.push( searchByLength(board, i));	
			}
			return doCrossSearch(board, _.compact(result));
		},
		
		/**
		 * 지정한 인덱스를 기준으로 상항좌우 탐색을 한다. 
		 * @param board
		 * @param idx
		 */
		targetSearch : function(board, idx){
			var result = [], number = board[idx];
			
			var item = verticalSearch(board, {
				indexes : [idx],
				number : number
			});
			if( item.indexes.length > 2 ){
				result.push(_.clone(item));
				_.each(result, function(v){
					board[v] = 0;
				});
			}
			
			item =horizontalSearch(board, {
				indexes : [idx],
				number : number
			});
			if( item.indexes.length > 2 ){
				result.push(_.clone(item));
				_.each(result, function(v){
					board[v] = 0;
				});
			}
			
			if(!_.isEmpty(result)){
				return _.compact(result); 
			}else{
				return null;
			}
		},
		
		/**
		 * 터져서 없어져야할 인덱스값을 모은다. 
		 * @param result
		 * @returns
		 */
		collectIndexes : function(result){
			var ret = [];
			_.each(result, function(o){
				ret.push(_.uniq(o.indexes));
			});
			return _.flatten(ret);
		},
		
		/**
		 * 슈퍼잼을 찾아서 -1로 바꾼다.
		 *  
		 * @param board
		 * @param result
		 */
		replaceSuperZem: function(board, result){
			_.each(result, function(o){
				if( o.indexes.length > 3 ){
					var maxIdx = _.max(o.indexes);
					board[maxIdx] = -1 * ("" + o.number + o.indexes.length );
				}
			});
		},
		
		/**
		 * 힌트를 찾는다. 
		 * @param board
		 */
		findHint : function(board){
			
			var cboard = board.concat();
			
			// 좌우 스위치
			var x,y,tmp,result;
			for(y=0; y<N; ++y){
				for(x=0; x<N-1; ++x ){
					tmp = cboard[y*N + x+1];
					cboard[y*N + x+1] = cboard[y*N + x];
					cboard[y*N + x] = tmp;
					
					result =  this.targetSearch(cboard, y*N + x);
					
					if(result){
						//console.log("찾았다!", y*N + x, result);
						return y*N + x;
					}else{
						result =  this.targetSearch(cboard, y*N + x+1);
						if( result ){
							//console.log("찾았다!", y*N + x+1, result);
							return y*N + x+1;	
						}else{
							//console.log(y*N + x, "못찾았다!");
							cboard = board.concat();
						}
					}
				}
			}
			
			
			// 상하  스위치
			for(y=0; y<N-1; ++y){
				for(x=0; x<N; ++x ){
					tmp = cboard[y*N + x+7];
					cboard[y*N + x+7] = cboard[y*N + x];
					cboard[y*N + x] = tmp;
					
					result =  this.targetSearch(cboard, y*N + x);
					if(result){
						//console.log("찾았다!", y*N + x, result);
						return y*N + x;
					}else{
						result =  this.targetSearch(cboard, y*N + x+7);
						if( result ){
						//	console.log("찾았다!", y*N + x+7, result);
							return y*N + x+7;	
						}else{
							//console.log(y*N + x, "못찾았다!");
							cboard = board.concat();
						}
					}
				}
			}
			
			console.log("진짜 못찾았다!!! GameOver!!");
			return null;
		}
	};
})();