'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var paths = require('./paths');
var utils = require('./utils');
var flags = require('./flags');

function deleteFolderRecursive(path, progress) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath, progress);
			} else {
				if (progress) {
					progress(curPath);
				}
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

var removeCompiled = function(error, progress, complete) {
	deleteFolderRecursive(paths.minified, progress);
	if (complete) {
		complete();
	}
};

var removeMinified = function(error, progress, complete) {
	deleteFolderRecursive(paths.compiled, progress);
	if (complete) {
		complete();
	}
};

var removeCombined = function(error, progress, complete) {
	// not implemented, need to parse YAML files
	if (complete) {
		complete();
	}
};

module.exports = {
	task: function() {
		gutil.log(gutil.colors.blue('Removing minified files:'));
		removeMinified(
			null,
			function (line) {
				gutil.log(gutil.colors.gray('..'), line);
			},
			function () {
				gutil.log(gutil.colors.blue('Done'));
				gutil.log('');
			}
		);

		gutil.log(gutil.colors.blue('Removing compiled files:'));
		removeCompiled(
			null,
			function (line) {
				gutil.log(gutil.colors.gray('..'), line);
			},
			function () {
				gutil.log(gutil.colors.blue('Done'));
				gutil.log('');
			}
		);

		gutil.log(gutil.colors.blue('Removing combined files:'));
		removeCombined(
			null,
			function (line) {
				gutil.log(gutil.colors.gray('..'), line);
			},
			function () {
				gutil.log(gutil.colors.blue('Done'));
				gutil.log('');
			}
		);

		// delete flag files
		gutil.log(gutil.colors.blue('Removing flags:'));
		flags.remove(
			null,
			function () {
				gutil.log(gutil.colors.blue('Done'));
				gutil.log('');
			}
		);
	}
};

// }}}
