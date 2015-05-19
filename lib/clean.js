'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var paths = require('./paths');
var utils = require('./utils');
var flags = require('./flags');

function deleteFolderRecursive(pathi, progress) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
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

module.exports = {
	removeCompiled: function(error, progress, complete) {
		deleteFolderRecursive(paths.minified, progress);
		if (complete) {
			complete();
		}
	},
	removeMinified: function(error, progress, complete) {
		deleteFolderRecursive(paths.compiledi, progress);
		if (complete) {
			complete();
		}
	},
	removeCombined: function(error, progress, complete) {
		// not implemented, need to parse YAML files
		if (complete) {
			complete();
		}
	},
	task:  function() {
		gutil.log(gutil.colors.blue('Removing minified files:'));
		this.removeMinified(
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
		this.removeCompiled(
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
		this.removeCombined(
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
