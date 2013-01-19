(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 이 함수는 사용자가 이 페이지로 이동할 때마다 호출되어
        // 페이지 요소를 응용 프로그램 데이터로 채웁니다.
        ready: function (element, options) {
            // TODO: 페이지를 초기화합니다.
            if (localSettings.values["accessToken"]) {
                validateToken();
                element.querySelector("#login").style.display = "none";
            } else {
                element.querySelector("#login").addEventListener("click", loginFacebook, false);
            }

            element.querySelector("#startGame").addEventListener("click", startGame, false);

            element.querySelector("#camera").addEventListener("click", takePicture, false);
            element.querySelector("#filePicker").addEventListener("click", pickFile, false);

            this.appbar = document.getElementById("appbar").winControl;
            this.appbar.hideCommands(["back"]);
        },

        unload: function () {
            this.appbar.showCommands(["back"]);
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


    function startGame() {
        WinJS.Navigation.navigate("/pages/game/game.html");
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



    function previewImage(file) {
        var img = document.createElement("img");
        img.src = URL.createObjectURL(file, { oneTimeOnly: true });
        document.getElementById("home").appendChild(img);
    }

    function takePicture(e) {
        var captureUI = new Windows.Media.Capture.CameraCaptureUI();
        captureUI.photoSettings.allowCropping = true;
        captureUI.photoSettings.croppedSizeInPixels = { width: 480, height: 480 };

        captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (file) {
            if (file) {
                previewImage(file);
            }
        });
    }

    function pickFile(e) {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.suggestedStartLocation = Windows.Storage.KnownFolders.picturesLibrary;
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);

        openPicker.pickSingleFileAsync().then(function (file) {
            previewImage(file);
        });
    }
})();
