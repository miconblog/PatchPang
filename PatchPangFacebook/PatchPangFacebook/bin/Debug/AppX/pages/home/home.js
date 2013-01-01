(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 이 함수는 사용자가 이 페이지로 이동할 때마다 호출되어
        // 페이지 요소를 응용 프로그램 데이터로 채웁니다.
        ready: function (element, options) {
            // TODO: 페이지를 초기화합니다.
            if (localSettings.values["accessToken"]) {
                element.querySelector("#login").style.display = "none";
            } else {
                element.querySelector("#login").addEventListener("click", loginFacebook, false);
            }

            //element.querySelector("#register").addEventListener("click", registerUser, false);
            //element.querySelector("#ranking").addEventListener("click", showRanking, false);
            element.querySelector("#startGame").addEventListener("click", startGame, false);

            init();
            showRanking();
        }
    });

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
    var facebookAppID = "263493547007128";
    var facebookAppSecret = "6915896fc234c71ca5dd9c8965d0802f";
    var facebookCallbackURL = "https://www.facebook.com/connect/login_success.html";

    function loginFacebook() {

        var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=" + facebookAppID +
            "&redirect_uri=" + encodeURIComponent(facebookCallbackURL) + "&scope=read_stream&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(facebookCallbackURL);

        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
            Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
            .done(function (result) {


                var token = new RegExp(facebookCallbackURL + "#access_token=([^&]+)").exec(result.responseData)[1];
                document.getElementById("result").value = token;

                extendAccessToken(token);

                /*
                token = "https://www.facebook.com/connect/login_success.html#access_token=AAADvpV9FHJgBADFGiVZB69BvOn9P7J7lScCj5RzeSD76nLwIj3a8qHmD8pZAcA9vX973fvTZBkztHGzAstdgAk4dOY1p9rrO9YNBZCayndrNwFc2PDwx&expires_in=4402";

                var uri = new Windows.Foundation.Uri(token).queryParsed;
                console.log(url.getFirstValueByName("access_token"));
                */
                /*
                token = "https://www.facebook.com/connect/login_success.html?code=AQBY4COGxy4tJbXjCR_YvXQYhSARSgpbhtgowL_9RphqJ3wXb0I_gUSVGdcFCussy6KLJ4KeSLEcL6fC4FbYZt_0qsYe5UHekzx2o8hSZPPH551gThYX1iBWF2rMcYxiXhpIgDgywls9T0SbqhB2ChQ212nUE3HRli-z6ZqbvCqNQ0hvAmuFcHQoFSw3_QtWaOYTMpUrXG27yYLuOAjGB1SS#_=_";
                document.getElementById("result").value = token;

                var uri = new Windows.Foundation.Uri(token).queryParsed;
                for (var p in uri) {
                    console.log(p, uri[p]);
                }
                */

                //getFriends(token);
            }, function (err) {
                console.log(err);
            });

    }


    function startGame() {
        document.getElementById("game").style.display = "";
        document.getElementById("home").style.display = "none";

        game.reset();
    }

    function getAccessToken() {
        return localSettings.values["accessToken"];
    }

    function registerUser() {
        var token = getAccessToken();

        document.getElementById("result").value = token;



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


    function setRankingData(rankingList) {
        var list = new WinJS.Binding.List();

        rankingList.forEach(function (item, index) {
            item["rank"] = index + 1;
            item["backgroundImage"] = "https://graph.facebook.com/" + item.id + "/picture";
            list.push(item);
        });

        var listView = document.getElementById("rankingList").winControl;
        listView.itemTemplate = document.getElementById("itemTemplate");
        listView.itemDataSource = list.dataSource;
        listView.layout = new WinJS.UI.ListLayout();
    }

    function showRanking() {

        var data = {
            id : localSettings.values["id"],
            token : localSettings.values["accessToken"]
        };

        WinJS.xhr({
            url: "http://miconblog.com/api/get/rank/" + data.id + "/" + data.token
        }).done(function (result) {
            if (result.status === 200) {
                var response = JSON.parse(result.responseText);
                console.log(result.responseText);
                if (response.success == "OK") {
                    setRankingData(response.ranking);
                } else {

                }
            }
        }, function (err) {

        });


        /*
        var token = "https://www.facebook.com/connect/login_success.html#access_token=AAADvpV9FHJgBADFGiVZB69BvOn9P7J7lScCj5RzeSD76nLwIj3a8qHmD8pZAcA9vX973fvTZBkztHGzAstdgAk4dOY1p9rrO9YNBZCayndrNwFc2PDwx&expires_in=4402";
        console.log(new RegExp(facebookCallbackURL + "#access_token=([^&]+)").exec(token)[1]);


        WinJS.xhr({
            url: "https://graph.facebook.com/oauth/access_token?grant_type=client_id=" + facebookAppID + "&redirect_uri=" + encodeURIComponent(facebookCallbackURL) + "&client_secret=" + facebookAppSecret + "&code=" + code
        }).done(function (result) {
            if (result.status === 200) {
                debugger
                console.log(1, result.responseText);
            }
        }, function (err) {
            console.log("ERROR : ", err.responseText);
        });
        */
        /*

        var token = "https://www.facebook.com/connect/login_success.html?code=AQBY4COGxy4tJbXjCR_YvXQYhSARSgpbhtgowL_9RphqJ3wXb0I_gUSVGdcFCussy6KLJ4KeSLEcL6fC4FbYZt_0qsYe5UHekzx2o8hSZPPH551gThYX1iBWF2rMcYxiXhpIgDgywls9T0SbqhB2ChQ212nUE3HRli-z6ZqbvCqNQ0hvAmuFcHQoFSw3_QtWaOYTMpUrXG27yYLuOAjGB1SS#_=_";
        document.getElementById("result").value = token;

        var uri = new Windows.Foundation.Uri(token).queryParsed;
        

        var code = uri.getFirstValueByName("code") + "#_=_";
        */

        /*
        var startURI = new Windows.Foundation.Uri("https://graph.facebook.com/oauth/access_token?client_id=" + facebookAppID + "&redirect_uri=" + encodeURIComponent(facebookCallbackURL) + "&client_secret=" + facebookAppSecret + "&code=" + code);
        var endURI = new Windows.Foundation.Uri(facebookCallbackURL);

        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
            Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
            .done(function (result) {

                console.log(result.responseData);

                //getFriends(token);
            }, function (err) {
                console.log(err);
            });
*/
        /*
        WinJS.xhr({
            url: "https://graph.facebook.com/oauth/access_token?client_id=" + facebookAppID + "&redirect_uri=" + encodeURIComponent(facebookCallbackURL) + "&client_secret=" + facebookAppSecret + "&code=" + code
        }).done(function (result) {
            if (result.status === 200) {
                debugger
                console.log(1, result.responseText);
            }
        }, function (err) {
            console.log("ERROR : ", err.responseText);
        });
    */

        /*
        var result = "https://www.facebook.com/connect/login_success.html#access_token=AAADvpV9FHJgBAO91YwdwNkcOsKj9RZCx8ZALOVcHIXLR0oMRsEp758lp9vys1ye1ZBTuEWiXQg6bfT3uh93HqTbvzmsJHZCuBP41HJTqT16uGIRv2SiY&expires_in=5833";


        var token = new RegExp(facebookCallbackURL + "#access_token=([^&]+)").exec(result)[1];


        document.getElementById("result").value = token;
        */
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
