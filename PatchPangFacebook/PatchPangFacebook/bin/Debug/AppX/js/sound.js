(function () {
    var _bgPlayer = new jukebox.Player({
		resources: [
			'/sound/bg_slow.mp3'
		],
		spritemap: {
			"bg": {
				"start": 0.00,
				"end": 60.00,
				loop: false
			}
		}
    });

    var _bgFastPlayer = new jukebox.Player({
        resources: [
			'/sound/bg_fast.mp3'
        ],
        spritemap: {
            "bg": {
                "start": 45.00,
                "end": 60.00,
                loop: false
            }
        }
    });

    _bgPlayer.setVolume(0.3);
    _bgFastPlayer.setVolume(0.3);

    var _player = new jukebox.Player({
        resources: [
            '/sound/patchpang.mp3',
        ],
        spritemap: {
            left30: {
                "start": 1.8,
                "end": 3.0
            },
            end: {
                "start": 4.4,
                "end": 5.2
            },
            great: {
                "start": 6.4,
                "end": 7.9
            },
            effect1: {
                "start": 9.0,
                "end": 9.4
            },
            hurryup: {
                "start": 10.7,
                "end": 12.1
            },
            effect2: {
                "start": 13.3,
                "end": 13.9
            },
            start: {
                "start": 15.0,
                "end": 15.9
            },
            effect5: {
                "start": 17.0,
                "end": 17.5
            },
            effect4: {
                "start": 18.7,
                "end": 19.2
            },
            effect3: {
                "start": 20.2,
                "end": 20.7
            },
            effect6: {
                "start": 21.7,
                "end": 22.7
            },
            intro: {
                "start": 24,
                "end": 25.3
            },
            patchpatch: {
                "start": 26.6,
                "end": 27.3
            },
            hint: {
                "start": 28.5,
                "end": 29.7
            }
        }
    });

    WinJS.Namespace.define("Sound", {
        startBG: function () {
            _bgPlayer.play("bg");
        },

        startFastBG: function () {
            _bgPlayer.stop();
            _bgFastPlayer.play("bg");
        },

        stopBG: function () {
            _bgPlayer.stop();
            _bgFastPlayer.stop();
        },

        start: function (name) {
            _player.play(name);
        },

        stop: function () {
            _player.stop();
        }
    });
})();