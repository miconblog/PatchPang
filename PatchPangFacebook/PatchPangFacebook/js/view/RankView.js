(function() {
	
	/**
	 * 
	 * @param {BackboneModel} model
	 * @returns
	 */
	RankView = function(model) {

		this.model = model;
		this.wel = $("#list");
		
		this.model.on('reset', function(e){
			this.render(e.models);
		}.bind(this));
	};
	
	
	RankView.prototype.render = function(data){
		
		var tpl = "<li><span class='ip'>{{=ip}}</span><span class='score'>{{=score}}</span></li>";
		var html = [];
		
		_.each(data, function(m){
			
			html.push( tpl.replace("{{=ip}}", decodeURIComponent(m.get("name")))
			   .replace("{{=score}}", m.get("point")) );

			this.wel.html(html.join(""));
			
		}.bind(this));
		
	};
	
	
	
})();