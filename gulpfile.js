'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var symlinks = require('./lib/symlinks');
var concentrate = require('./lib/concentrate');
var paths = require('./lib/paths');
var flags = require('./lib/flags');
var clean = require('./lib/clean');
var phplint = require('./lib/phplint');
var phpclassmap = require('./lib/phpclassmap');
var less = require('./lib/less');

gulp.task('phplint', phplint.task);
gulp.task('phpclassmap', phpclassmap.task);
gulp.task('setup-symlinks', symlinks.task.setup);
gulp.task('teardown-symlinks', symlinks.task.teardown);
gulp.task('clean', [ 'teardown-symlinks' ], clean.task);
gulp.task('concentrate-internal', [ 'setup-symlinks' ], concentrate.task);
gulp.task('concentrate', [ 'concentrate-internal' ], function() {
	return symlinks.task.teardown();
});
gulp.task('build-less', [ 'write-flag' ], less.task);
gulp.task('write-flag', flags.task);

function cleanShutdown() {
	gutil.log(gutil.colors.blue('BYE'));

	flags.remove();
	symlinks.task.teardown();

	process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
gulp.task('watch', [ 'setup-symlinks' ], function () {
	process.on('SIGINT', cleanShutdown);
	process.on('SIGHUP', cleanShutdown);
	process.on('SIGTERM', cleanShutdown);

	gulp.watch(paths.less, [ 'build-less' ]);
	gulp.watch(paths.php, [ 'phplint', 'phpclassmap' ]);
});

gulp.task('default', [ 'build-less', 'phplint', 'watch' ]);
