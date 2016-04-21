'use strict';

var child_process = require('child_process');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var q = require('q');

var paths = require('./paths');


/**
 * Updates package-level symlinks to point to active git repositories
 * instead of installed PEAR packages
 */
var setup = function(err, progress, complete) {
	fs.readdirSync(paths.packages).forEach(function(packageName, index) {
		var packageLinkPath = path.join(paths.packages, packageName);
		if (fs.lstatSync(packageLinkPath).isSymbolicLink()) {
			var packageRealPath = path.join(
				'/so',
				'packages',
				packageName,
				paths.work,
				'www'
			);

			if (   fs.existsSync(packageRealPath)
				&& (
					   !fs.existsSync(packageLinkPath)
					|| packageRealPath != fs.realpathSync(packageLinkPath)
				)
			) {
				fs.unlinkSync(packageLinkPath);
				fs.symlinkSync(packageRealPath, packageLinkPath);
				if (progress) {
					progress(packageName,
						packageLinkPath,
						packageRealPath
					);
				}
			}
		}
	});

	if (complete) {
		complete();
	}
};

/**
 * Updates package-level symlinks to installed PEAR packages instead of
 * active git repositories
 */
var teardown = function(err, progress, complete) {
	function getPathList(dir, cwd) {
		var pathList = [];
		fs.readdirSync(dir).forEach(function(packageName, index) {
			var packageLinkPath = path.join(dir, packageName);
			if (fs.lstatSync(packageLinkPath).isSymbolicLink()) {
				// Need to get the relative path for git checkout
				pathList.push(path.relative(cwd, packageLinkPath));
				if (progress) {
					progress(packageName, packageLinkPath);
				}
			}
		});
		return pathList;
	}

	function revert(pathList) {
		var cmd = 'git checkout -- ' + pathList.join(' ');
		var deferred = q.defer();
		child_process.exec(cmd, {}, function(code, stdout, stderr) {
			if (complete) {
				complete();
			}
			deferred.resolve();
		});
		return deferred.promise;
	}

	var pathList = getPathList(paths.packages, paths.cwd);
	var promise = revert(pathList);

	return promise;
};

module.exports = {
	teardownWithLogging: function(err, gutil) {
		gutil.log(gutil.colors.blue('Restoring symlinks for www/packages:'));
		return this.teardown(
			err,
			function (packageName, packageLinkPath, packageRealPath) {
				gutil.log(gutil.colors.gray('..'), packageName);
			},
			function () {
				gutil.log(gutil.colors.blue('Done'));
			}
		);
	},
	task: {
		setup: function() {
			gutil.log(gutil.colors.blue('Updating symlinks for www/packages:'));
			return setup(
				null,
				function (packageName, packageLinkPath, packageRealPath) {
					gutil.log(gutil.colors.gray('..'), packageName);
				},
				function () {
					gutil.log(gutil.colors.blue('Done'));
				}
			);
		},
		teardown: function() {
			gutil.log(
				gutil.colors.blue('Restoring symlinks for www/packages:')
			);
			return teardown(
				null,
				function (packageName, packageLinkPath, packageRealPath) {
					gutil.log(gutil.colors.gray('..'), packageName);
				},
				function () {
					gutil.log(gutil.colors.blue('Done'));
				}
			);
		}
	}
};
