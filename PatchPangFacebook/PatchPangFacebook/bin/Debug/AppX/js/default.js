// 탐색 템플릿에 대한 소개는 다음 문서를 참조하십시오.
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: 이 응용 프로그램은 새로 시작되었습니다. 여기서
                // 응용 프로그램을 초기화하십시오.
            } else {
                // TODO: 이 응용 프로그램은 일시 중단되었다가 다시 활성화되었습니다.
                // 여기서 응용 프로그램 상태를 복원하십시오.
            }

            app.onsettings = function (e) {
                e.detail.applicationcommands = {
                    "about": {
                        href: "/pages/about/about.html",
                        title: "About"
                    },
                    "private": {
                        href: "/pages/private/private.html",
                        title: "Private Policy"
                    }
                }

                WinJS.UI.SettingsFlyout.populateSettings(e);
            };

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                // appbar 설정
                document.getElementById("back").addEventListener("click", function () {
                    nav.back();
                });

                document.getElementById("ranking").addEventListener("click", function () {
                    nav.navigate("/pages/ranking/ranking.html");
                });

                

                // logo
                Sound.start("intro");


                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: 이 응용 프로그램은 곧 일시 중단됩니다. 여러 일시 중단에서
        // 유지해야 하는 상태를 저장하십시오. 
        //  응용 프로그램이 일시 중단되기 전에 비동기 작업을 완료해야 하는 경우 
        // args.setPromise()를 호출하십시오.
        app.sessionState.history = nav.history;
    };

    app.start();
})();
