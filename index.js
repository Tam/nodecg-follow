'use strict';

var express = require('express'),
	busboy = require('connect-busboy'),
	fs = require('fs.extra'),
	app = express();

var VIDEO_FOLDER = 'bundles/nodecg-follow/view/video/',
	AUDIO_FOLDER = 'bundles/nodecg-follow/view/audio/',
	SETTINGS_FILE = 'bundles/nodecg-follow/settings.json';

var settings;

module.exports = function(nodecg) {

	app.use(busboy()); // For file uploading

	/**
	 * Settings
	 */
	// Read
	fs.readFile(SETTINGS_FILE, 'utf8', function (err, data) {
		settings = JSON.parse(data);

		// Declare
		nodecg.declareSyncedVar({
			name: 'settings',
			initialVal: settings,
			setter: function (s) {
				// Save
				var settingsString = JSON.stringify(s, null, 2);
				fs.writeFile(SETTINGS_FILE, settingsString, function (err) {
					if (err) nodecg.log.error(err);
				});
			}
		});
	});

	nodecg.mount(app);
};
