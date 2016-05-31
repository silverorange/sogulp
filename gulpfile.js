'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var q = require('q');

var vendorSymlinks = require('./lib/vendor-symlinks');
var packageSymlinks = require('./lib/package-symlinks');
var concentrate = require('./lib/concentrate');
var flags = require('./lib/flags');
var clean = require('./lib/clean');
var phplint = require('./lib/phplint');
var phpclassmap = require('./lib/phpclassmap');
var phpwatcher = require('./lib/phpwatcher');
var less = require('./lib/less');
var lesswatcher = require('./lib/lesswatcher');

gulp.task('phpclassmap', ['setup-symlinks'], phpclassmap.task);
gulp.task('phplint', ['setup-symlinks'], phplint.task);
gulp.task('setup-vendor-symlinks', vendorSymlinks.task.setup);
gulp.task('teardown-vendor-symlinks', vendorSymlinks.task.teardown);
gulp.task('setup-package-symlinks', packageSymlinks.task.setup);
gulp.task('teardown-package-symlinks', packageSymlinks.task.teardown);
gulp.task('setup-symlinks', ['setup-package-symlinks', 'setup-vendor-symlinks']);
gulp.task('teardown-symlinks', ['teardown-package-symlinks', 'teardown-vendor-symlinks']);
gulp.task('clean', ['teardown-symlinks'], clean.task);
gulp.task('concentrate-internal', ['setup-symlinks'], concentrate.task);
gulp.task('concentrate', ['concentrate-internal'], function() {
  return packageSymlinks.task.teardown();
});
gulp.task('build-less', ['setup-symlinks'], less.task);
gulp.task('write-flag', ['build-less'], flags.task);

function cleanShutdown() {
  gutil.log(gutil.colors.blue('BYE'));

  flags.remove();
  vendorSymlinks.task.teardown();
  packageSymlinks.task.teardown();

  process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
gulp.task('default', ['setup-symlinks', 'write-flag'], function () {
  process.on('SIGINT', cleanShutdown);
  process.on('SIGHUP', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);

  return q.all([
    phpwatcher.watch(),
    lesswatcher.watch()
  ]);
});
