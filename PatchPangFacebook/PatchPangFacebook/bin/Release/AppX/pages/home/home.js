(function () {
    "use strict";

    document.getElementById("logout").addEventListener("click", function () {
        logoutFacebook();
    });

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 이 함수는 사용자가 이 페이지로 이동할 때마다 호출되어
        // 페이지 요소를 응용 프로그램 데이터로 채웁니다.
        ready: function (element, options) {
            // TODO: 페이지를 초기화합니다.
            if (localSettings.values["accessToken"]) {
                validateToken();
                showName();
            } else {
                element.querySelector("#login").addEventListener("click", loginFacebook, false);
            }

            element.querySelector("#startGame").addEventListener("click", startGame, false);
            this.appbar = document.getElementById("appbar").winControl;
            this.appbar.hideCommands(["back"]);
            this.appbar.showCommands(["logout"]);
            
        },

        unload: function () {
            this.appbar.showCommands(["back"]);
            this.appbar.hideCommands(["logout"]);
        }
    });

    function showName() {
        if (localSettings.values["id"]) {
            document.querySelector("#login").style.display = "none";
            document.getElementById("result").innerHTML =
                "<img src='https://graph.facebook.com/" + localSettings.values["id"] + "/picture' class='picture' /><br />" +
                localSettings.values["name"] + "님 환영합니다!";
        } else {
            document.getElementById("result").innerHTML = "페이스북 로그인을 해주세요";
        }
    }

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
    var facebookAppID = "575414935818797";
    var facebookAppSecret = "c33f02850e4828e23b2dee7e5eba9e3a";
    var facebookCallbackURL = "https://www.facebook.com/connect/login_success.html";

    function loginFacebook() {
        console.log(1);
        var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=" + facebookAppID +
            "&redirect_uri=" + encodeURIComponent(facebookCallbackURL) + "&scope=read_stream&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(facebookCallbackURL);

        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
            Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
            .done(function (result) {
                var reg = new RegExp(facebookCallbackURL + "#access_token=([^&]+)");

                // 취소할 경우 에러나서 수정
                if (reg.test(result.responseData)) {
                    var token = new RegExp(facebookCallbackURL + "#access_token=([^&]+)").exec(result.responseData)[1];
                    document.getElementById("result").innerHTML = "";
                    extendAccessToken(token);
                }
            }, function (err) {
                console.log(err);
            });

    }
    
    function validateToken() {
        WinJS.xhr({
            url: "https://graph.facebook.com/me?access_token=" + getAccessToken()
        }).done(function (result) {
            if (result.status === 200) {
                
            }
        }, function (err) {
            var response = JSON.parse(err.responseText);
            if (response.error.type == "OAuthException") {
                loginFacebook();
            }
        });
    }

    //TODO 로그아웃
    function logoutFacebook() {
        localSettings.values["accessToken"] = null;
        localSettings.values["id"] = null;
        document.querySelector("#login").style.display = "block";
        showName();
    }

    function startGame() {
        WinJS.Navigation.navigate("/pages/game/game.html");
    }

    function getAccessToken() {
        return localSettings.values["accessToken"];
    }
    
    function registerUser() {
        var token = getAccessToken();

        //document.getElementById("result").value = token;


        WinJS.xhr({
            url: "https://graph.facebook.com/me?access_token=" + token
        }).done(function (result) {
            if (result.status === 200) {
                var response = JSON.parse(result.responseText);
                register(response.id, response.name, token);
            }
        }, function (err) {
            console.log("ERROR", result.responseText);
        
        });
    }

    function register(id, name, token) {
        var data = JSON.stringify({
            id: id,
            name: name,
            token: token
        });

        console.log(data);
        localSettings.values["id"] = id;
        localSettings.values["name"] = name;

        showName();

        WinJS.xhr({
            type: "post",
            url: "http://miconblog.com/api/register",
            headers: { "Content-type": "application/json"},
            data: data
        }).done(function (result) {
            if (result.status === 200) {
                var response = JSON.parse(result.responseText);
                if (response.success == "OK") {


                } else {

                }
            }
        }, function (err) {

        });
    }

    function get(token) {
        WinJS.xhr({ url: "https://graph.facebook.com/me?access_token=" + token, responseType: "json" }).done(function (result) {

            if (result.status === 200) {
                console.log(result.response, result.response["id"]);
            }
        });
    }

    function getFriends() {
        WinJS.xhr({
            url: "https://graph.facebook.com/me/friends?access_token=" + token
        }).done(function (result) {
            if (result.status === 200) {
                console.log(result.response);
            }
        });
    }

    function extendAccessToken(token) {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        localSettings.values["accessToken"] = token;

        WinJS.xhr({
            url: "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=" + facebookAppID + "&client_secret=" + facebookAppSecret + "&fb_exchange_token=" + token
        }).done(function (result) {
            if (result.status === 200) {
                var queryObj = {};
                var query = result.responseText.split("&");

                for (var i=0, len=query.length; i<len; i++) {
                    var querySplit = query[i].split("=");
                    queryObj[querySplit[0]] = querySplit[1];
                }

                if (queryObj["access_token"]) {
                    localSettings.values["accessToken"] = queryObj["access_token"];
                    registerUser();
                }
            }
        }, function (err) {
            console.log("ERROR : ", err.responseText);
        });
    }
})();
