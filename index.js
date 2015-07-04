'use strict';

var express = require('express'),
	busboy = require('connect-busboy'),
	fs = require('fs.extra'),
	app = express();

var UPLOAD_FOLDER = 'bundles/nodecg-follow/view/uploads/',
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
		nodecg.Replicant('settings', {
			defaultValue: settings,
			persistent: false
		}).on('change', function (oldVal, s) {
			var settingsString = JSON.stringify(s, null, 2);
			fs.writeFile(SETTINGS_FILE, settingsString, function (err) {
				if (err) nodecg.log.error(err);
			});
		});
	});

	// Upload
	app.post('/nodecg-follow/upload', function(req, res) {
		var fstream;

		req.pipe(req.busboy);

		req.busboy.on('file', function (fieldname, file, filename) {
			nodecg.log.info('Uploading: ' + filename);
			fstream = fs.createWriteStream(UPLOAD_FOLDER + filename);
			file.pipe(fstream);
			fstream.on('close', function() {
				res.status(200).json({
					status: 'success',
					data: filename
				});
			});
		});
	});

	nodecg.mount(app);
};
