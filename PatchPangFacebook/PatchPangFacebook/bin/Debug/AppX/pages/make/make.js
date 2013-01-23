// 페이지 컨트롤 템플릿에 대한 소개는 다음 문서를 참조하십시오.
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define("/pages/make/make.html", {
        // 이 함수는 사용자가 이 페이지로 이동할 때마다 호출되어
        // 페이지 요소를 응용 프로그램 데이터로 채웁니다.
        ready: function (element, options) {
            // TODO: 페이지를 초기화합니다.
            //element.querySelector("#camera").addEventListener("click", takePicture, false);
            //element.querySelector("#filePicker").addEventListener("click", pickFile, false);
            //element.querySelector("#initCapture").addEventListener("click", initCapture, false);
            //element.querySelector("#capture").addEventListener("click", capture, false);
            this.canvasList = [];
            this.elContainer = document.getElementById("block_container");;
            this.elContainer.addEventListener("click", function (e) {
                var target = e.srcElement;
                var index = target.getAttribute("data-index");
                var ctx = target.getContext("2d");
                var callback = function (file) {
                    var url = getFileURL(file);
                    collie.ImageManager.remove("temp");
                    collie.ImageManager.add({
                        temp: url
                    }, function () {
                        var img = collie.ImageManager.getImage("temp");

                        ctx.clearRect(0, 0, target.width, target.height);
                        ctx.drawImage(collie.ImageManager.getImage("b" + (index % 7)), 0, 0);
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(60, 60, 45, 0, Math.PI * 2, false);
                        ctx.clip();
                        ctx.drawImage(collie.ImageManager.getImage("temp"), 0, 0, img.width, img.height, 60 - 45, 60 - 45, target.width - (60 - 45), target.height - (60 - 45));
                        ctx.restore();
                    });
                };

                Windows.Devices.Enumeration.DeviceInformation.findAllAsync(Windows.Devices.Enumeration.DeviceClass.videoCapture).done(function (devices) {
                    if (devices.length > 0) {
                        takePicture(callback);
                    } else {
                        pickFile(callback);
                    }
                });
            });

            document.getElementById("appbar").winControl.hide();

            document.getElementById("button_make").addEventListener("click", function () {
                var canvas = document.createElement("canvas");
                canvas.width = 120 * 7;
                canvas.height = 120 * 2;
                var ctx = canvas.getContext("2d");

                for (var i = 0; i < this.canvasList.length; i++) {
                    ctx.drawImage(this.canvasList[i], i % 7 * 120, Math.floor(i / 7) * 120);
                }

                var data = canvas.toDataURL('image/png');
                var localFolder = Windows.Storage.ApplicationData.current.localFolder;
                var encodeData = data.replace("data:image/png;base64,", "");
                var decode = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(encodeData);

                console.log(1);

                // mySample.txt의 이름으로 파일을 생성하고 동일한 이름이 있을 경우, 덮어쓴다.
                localFolder.createFileAsync("myblock.png", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    // writeTextAsync메소들 통해 파일에 텍스트를 쓴다.
                    Windows.Storage.FileIO.writeBufferAsync(file, decode);
                    this.loadFromImage("myblock.png");
                }.bind(this), function (err) {
                    console.log(err);
                });
            }.bind(this));

            document.getElementById("button_reset").addEventListener("click", function () {
                var localFolder = Windows.Storage.ApplicationData.current.localFolder;

                localFolder.getFileAsync("myblock.png").done(function (file) {
                    file.deleteAsync().done(function () {
                        localSettings.values["myBlock"] = null;
                        collie.ImageManager.remove("animal");
                        collie.ImageManager.add({
                            animal: "/images/ani.png"
                        });

                        WinJS.Navigation.navigate("/pages/home/home.html");
                    });
                }, function (err) {
                    return;
                });
            }.bind(this));

            collie.ImageManager.add({
                b0: "/images/b00.png",
                b1: "/images/b01.png",
                b2: "/images/b02.png",
                b3: "/images/b03.png",
                b4: "/images/b04.png",
                b5: "/images/b05.png",
                b6: "/images/b06.png",
                character_normal: "/images/character_normal.png",
                character_select: "/images/character_select.png"
            }, function () {
                this.initCanvas();
            }.bind(this));
        },

        unload: function () {
            // TODO: 이 페이지에서 벗어나는 탐색에 응답합니다.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: viewState의 변경 내용에 응답합니다.
        },

        initCanvas: function () {
            for (var i = 0; i < 14; i++) {
                var canvas = document.createElement("canvas");
                this.canvasList.push(canvas);
                canvas.width = 120;
                canvas.height = 120;
                canvas.className = "canvas";
                canvas.setAttribute("data-index", i);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(collie.ImageManager.getImage("b" + (i % 7)), 0, 0);
                ctx.drawImage(collie.ImageManager.getImage(Math.floor(i / 7) === 0 ? "character_normal" : "character_select"), 0, 0);
                this.elContainer.appendChild(canvas);
            }
        },

        loadFromImage: function (path) {
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
            localFolder.getFileAsync(path).done(function (file) {
                localSettings.values["myBlock"] = URL.createObjectURL(file);

                collie.ImageManager.remove("animal");
                collie.ImageManager.add({
                    animal: URL.createObjectURL(file)
                });

                WinJS.Navigation.navigate("/pages/home/home.html");
            });
        }
    });

    function getFileURL(file) {
        return URL.createObjectURL(file, { oneTimeOnly: true });
    }

    function previewImage(file) {
        var img = document.createElement("img");
        img.src = URL.createObjectURL(file, { oneTimeOnly: true });
        img.width = "120";
        img.height = "120";
        document.getElementById("home").appendChild(img);
    }

    function takePicture(callback) {
        var captureUI = new Windows.Media.Capture.CameraCaptureUI();
        captureUI.photoSettings.allowCropping = true;
        captureUI.photoSettings.croppedSizeInPixels = { width: 480, height: 480 };

        captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (file) {
            if (file) {
                callback(file);
            }
        });
    }

    function pickFile(callback) {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.suggestedStartLocation = Windows.Storage.KnownFolders.picturesLibrary;
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);

        openPicker.pickSingleFileAsync().then(function (file) {
            callback(file);
        });
    }

    var oMediaCapture;

    function initCaptureSettings() {
        var oCaptureInitSettings = null;
        oCaptureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
        oCaptureInitSettings.audioDeviceId = "";
        oCaptureInitSettings.videoDeviceId = "";
        oCaptureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.video;
        oCaptureInitSettings.photoCaptureSource = Windows.Media.Capture.PhotoCaptureSource.videoPreview;

        return oCaptureInitSettings;
    }

    function initCapture(event) {
        oMediaCapture = new Windows.Media.Capture.MediaCapture();

        oMediaCapture.initializeAsync(initCaptureSettings()).done(function (result) {
            var video = document.getElementById("previewVideo");
            video.src = URL.createObjectURL(oMediaCapture, { oneTimeOnly: true });
            video.play();
        });
    }

    function capture(e) {
        Windows.Storage.KnownFolders.picturesLibrary.createFileAsync("photo.png", Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (newFile) {
            var photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createPng();
            oMediaCapture.capturePhotoToStorageFileAsync(photoProperties, newFile).done(function (result) {
                previewImage(newFile);
            });
        });
    }
})();
