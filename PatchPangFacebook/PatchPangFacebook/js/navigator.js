﻿(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Application", {
        PageControlNavigator: WinJS.Class.define(
            // PageControlNavigator용 생성자 함수를 정의합니다.
            function PageControlNavigator(element, options) {
                this._element = element || document.createElement("div");
                this._element.appendChild(this._createPageElement());
                this._clearHistory = false;

                this.home = options.home;
                this._lastViewstate = appView.value;

                nav.onnavigated = this._navigated.bind(this);
                nav.onbeforenavigate = this._beforeNavigate.bind(this);
                window.onresize = this._resized.bind(this);

                document.body.onkeyup = this._keyupHandler.bind(this);
                document.body.onkeypress = this._keypressHandler.bind(this);
                document.body.onmspointerup = this._mspointerupHandler.bind(this);

                Application.navigator = this;
            }, {
                home: "",
                /// <field domElement="true" />
                _element: null,
                _lastNavigationPromise: WinJS.Promise.as(),
                _lastViewstate: 0,

                // 현재 로드된 페이지 개체입니다.
                pageControl: {
                    get: function () { return this.pageElement && this.pageElement.winControl; }
                },

                // 현재 페이지의 루트 요소입니다.
                pageElement: {
                    get: function () { return this._element.firstElementChild; }
                },

                // 로드할 새 페이지의 컨테이너를 만듭니다.
                _createPageElement: function () {
                    var element = document.createElement("div");
                    element.style.width = "100%";
                    element.style.height = "100%";
                    return element;
                },

                // 현재 페이지에 대한 애니메이션 요소 목록을 검색합니다.
                // 페이지에서 목록을 정의하지 않으면 전체 페이지에 애니메이션 효과를 적용합니다.
                _getAnimationElements: function () {
                    if (this.pageControl && this.pageControl.getAnimationElements) {
                        return this.pageControl.getAnimationElements();
                    }
                    return this.pageElement;
                },

                // 백스페이스 키를 누를 때마다 뒤로 이동하며
                // 입력 필드로 캡처되지 않습니다.
                _keypressHandler: function (args) {
                    if (args.key === "Backspace") {
                        nav.back();
                    }
                },

                // Alt + 왼쪽 화살표 또는 Alt + 오른쪽 화살표 키 조합을 누를 때
                // 뒤로 또는 앞으로 이동합니다.
                _keyupHandler: function (args) {
                    if ((args.key === "Left" && args.altKey) || (args.key === "BrowserBack")) {
                        nav.back();
                    } else if ((args.key === "Right" && args.altKey) || (args.key === "BrowserForward")) {
                        nav.forward();
                    }
                },

                // 이 함수는 클릭에 대한 응답으로 뒤로 및 앞으로 마우스
                // 단추를 사용하여 이동합니다.
                _mspointerupHandler: function (args) {
                    if (args.button === 3) {
                        nav.back();
                    } else if (args.button === 4) {
                        nav.forward();
                    }
                },

                _beforeNavigate: function (e) {
                    if (
                        (e.detail.state && e.detail.state.isAfterGame) ||
                        e.detail.location.indexOf("game") !== -1 ||
                        e.detail.location.indexOf("home") !== -1
                        ) {
                        this._clearHistory = true;
                    }
                },

                // 이동에 응답하여 DOM에 새 페이지를 추가합니다.
                _navigated: function (args) {
                    var newElement = this._createPageElement();
                    var parentedComplete;
                    var parented = new WinJS.Promise(function (c) { parentedComplete = c; });

                    this._lastNavigationPromise.cancel();

                    if (this._clearHistory) {
                        nav.history.backStack = [];
                        nav.history.forwardStack = [];
                        this._clearHistory = false;
                    }

                    this._lastNavigationPromise = WinJS.Promise.timeout().then(function () {
                        return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);
                    }).then(function parentElement(control) {
                        var oldElement = this.pageElement;
                        if (oldElement.winControl && oldElement.winControl.unload) {
                            oldElement.winControl.unload();
                        }
                        this._element.appendChild(newElement);
                        this._element.removeChild(oldElement);
                        oldElement.innerText = "";
                        this._updateBackButton();
                        parentedComplete();
                        WinJS.UI.Animation.enterPage(this._getAnimationElements()).done();
                    }.bind(this));

                    args.detail.setPromise(this._lastNavigationPromise);
                },

                // 현재 로드된 페이지에서 크기 조정 이벤트에 응답하고 updateLayout 함수를
                // 호출합니다.
                _resized: function (args) {
                    if (this.pageControl && this.pageControl.updateLayout) {
                        this.pageControl.updateLayout.call(this.pageControl, this.pageElement, appView.value, this._lastViewstate);
                    }
                    this._lastViewstate = appView.value;
                },

                // [뒤로] 단추 상태를 업데이트합니다. 이동이 완료된 후
                // 호출됩니다.
                _updateBackButton: function () {
                    var backButton = this.pageElement.querySelector("header[role=banner] .win-backbutton");
                    if (backButton) {
                        backButton.onclick = function () { nav.back(); };

                        if (nav.canGoBack) {
                            backButton.removeAttribute("disabled");
                        } else {
                            backButton.setAttribute("disabled", "disabled");
                        }
                    }
                },
            }
        )
    });
})();
