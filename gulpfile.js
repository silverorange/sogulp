'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var q = require('q');
var minimist = require('minimist');

var symlinks = require('./lib/symlinks');
var concentrate = require('./lib/concentrate');
var flags = require('./lib/flags');
var clean = require('./lib/clean');
var phplint = require('./lib/phplint');
var phpclassmap = require('./lib/phpclassmap');
var phpwatcher = require('./lib/phpwatcher');
var less = require('./lib/less');
var lesswatcher = require('./lib/lesswatcher');

var knownOptions = {
  boolean: 'symlinks',
  default: { 'symlinks': false }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('phpclassmap', ['setup-symlinks'], phpclassmap.task);
gulp.task('phplint', ['setup-symlinks'], phplint.task);
gulp.task('clean', ['teardown-symlinks'], clean.task);
gulp.task('concentrate-internal', ['setup-symlinks'], concentrate.task);
gulp.task('build-less', ['setup-symlinks'], less.task);
gulp.task('write-flag', ['build-less'], flags.task);

gulp.task('concentrate', ['concentrate-internal'], function() {
  if (options.symlinks) {
    symlinks.task.teardown();
  }
});

gulp.task('setup-symlinks', function() {
  if (options.symlinks) {
    symlinks.task.setup();
  }
});

gulp.task('teardown-symlinks', function() {
  if (options.symlinks) {
    symlinks.task.teardown();
  }
});

function cleanShutdown() {
  gutil.log(gutil.colors.blue('BYE'));

  flags.remove();

  if (options.symlinks) {
    symlinks.task.teardown();
  }

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
