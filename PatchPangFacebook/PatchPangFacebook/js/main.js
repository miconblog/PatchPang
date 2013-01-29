var USER = {};

function updateUserInfo(response) {
	
	USER.token = response.authResponse.accessToken;
	FB.api('/me', function(response) {
		document.getElementById('user-info').innerHTML = '<img src="https://graph.facebook.com/'
		+ response.id + '/picture">' + response.name;
		
		USER.id = response.id;
		USER.name = response.name;
		
		addUser();
	});
}
function handleStatusChange(response) {
	document.body.className = response.authResponse ? 'connected'
			: 'not_connected';
	if (response.authResponse) {
		console.log(response);
		$("#control").show();
		updateUserInfo(response);
	}
}

function loginUser() {
	FB.login(function(response) {
	}, {
		scope : 'email'
	});
}


function getUserFriends() {
	FB.api('/me/friends?fields=name,picture', function(response) {
		console.log('Got friends: ', response);

		if (!response.error) {
			var markup = '';

			var friends = response.data;

			for ( var i = 0; i < friends.length; i++) {
				var friend = friends[i];

				markup += '<img src="' + friend.picture.data.url + '"> '
						+ friend.name + '<br>';
			}

			document.getElementById('user-friends').innerHTML = markup;
		}
	});
}

/**
 * 로그인 하자마자 시작!!
 */
function addUser(){
	$.ajax({
		type : 'post',
		url : '/api/register',
		data: USER
	}).done(function(res){
		var html = [], str;
		
		if( res.success ){
			console.log(res.data);
		}else{
			console.log(res.error);
		}
	});
	
};

/**
 * 랭킹 정보 얻어오기
 */
function getRank(){
	$.ajax({
		url : '/api/get/rank/' + USER.id + "/" + USER.token
	}).done(function(res){
		var html = [], str;
		
		if( res.success ){
			console.log(res.success);
			html.push("<ol>");
			_.each(res.ranking, function(user){
				html.push('<li><img src="https://graph.facebook.com/'+ user.id + '/picture">' + user.name + ' <span>'+  user.hiscore +'</span></li>');
			});
			html.push("</ol>");
			$("#user-rank").html(html.join(""));
		}else{
			console.log(res.error);
		}
	});
	
};

/**
 * 게임 시작!!
 */
function startGame(){
	$("#home").hide();
	$("#game").show();
	game.reset();
};



window.fbAsyncInit = function() {
	FB.init({
		appId : '575414935818797', // App ID
		channelUrl : '//miconblog.com/apps/channel.html', // Channel File
		status : true, // check login status
		cookie : true, // enable cookies to allow the server to access the
						// session
		xfbml : true
	// parse XFBML
	});

	FB.Event.subscribe('auth.statusChange', handleStatusChange);
};

// Load the SDK Asynchronously
(function(d) {
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement('script');
	js.id = id;
	js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));