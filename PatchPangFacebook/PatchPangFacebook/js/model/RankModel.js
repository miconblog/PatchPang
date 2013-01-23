var Rank = Backbone.Model.extend({
	urlRoot : "/api/record"
});

var RankingList = Backbone.Collection.extend({
	url : "/api/get/ranks",
	model : Rank
});