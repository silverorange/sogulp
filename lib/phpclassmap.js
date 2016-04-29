'use strict';

var execFile = require('child_process').execFile;

var paths = require('./paths');

module.exports = {
	task: function() {
		var callback = function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		};

		execFile( 'composer', [ '-q', 'dump-autoload' ], callback);
	}
};
