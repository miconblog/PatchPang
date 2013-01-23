// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define("/pages/ranking/ranking.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.appbar = document.getElementById("appbar").winControl;
            this.appbar.hide();
            this.showRanking();
            var elButtonReplay = document.getElementById("button_replay");
            var elButtonHome = document.getElementById("button_home");

            if (!options || !options.isAfterGame) {
                document.getElementById("afterGame").style.display = "none";
            } else {
                elButtonReplay.addEventListener("click", function () {
                    WinJS.Navigation.navigate("/pages/game/game.html");
                });

                elButtonHome.addEventListener("click", function () {
                    WinJS.Navigation.navigate("/pages/home/home.html");
                });
            }
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        },

        setRankingData: function (rankingList) {
            // 페이지 나가고 xhr complete 발생하면 취소
            if (!document.getElementById("rankingList")) {
                return false;
            }

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
        },

        showRanking: function () {
            var data = {
                id: localSettings.values["id"],
                token: localSettings.values["accessToken"]
            };

            WinJS.xhr({
                url: "http://miconblog.com/api/get/rank/" + data.id + "/" + data.token
            }).done(function (result) {
                if (result.status === 200) {
                    var response = JSON.parse(result.responseText);
                    console.log(result.responseText);

                    if (response.success == "OK") {
                        this.setRankingData(response.ranking);
                    } else {

                    }
                }
            }.bind(this), function (err) {

            });
        }
    });
})();
