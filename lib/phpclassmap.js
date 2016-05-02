'use strict';

var gutil = require('gulp-util');
var execFile = require('child_process').execFile;
var paths = require('./paths');

module.exports = {
	task: function() {
		execFile(
			'composer',
			['-q', 'dump-autoload'],
			function (error, stdout, stderr) {
				if (error !== null) {
					gutil.log('exec error: ' + error);
				}
			}
		);
	}
};
