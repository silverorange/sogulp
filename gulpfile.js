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
  default: { 'symlinks': true }
};

var options = minimist(process.argv.slice(2), knownOptions);

if (options.symlinks) {
  gulp.task('setup-symlinks', symlinks.task.setup);
  gulp.task('teardown-symlinks', symlinks.task.teardown);
  gulp.task('phpclassmap', ['setup-symlinks'], phpclassmap.task);
  gulp.task('phplint', ['setup-symlinks'], phplint.task);
  gulp.task('clean', ['teardown-symlinks'], clean.task);
  gulp.task('concentrate-internal', ['setup-symlinks'], concentrate.task);
  gulp.task('build-less', ['setup-symlinks'], less.task);
  gulp.task('concentrate', ['concentrate-internal'], function() {
    symlinks.task.teardown();
  });
} else {
  gulp.task('phpclassmap', phpclassmap.task);
  gulp.task('phplint', phplint.task);
  gulp.task('clean', clean.task);
  gulp.task('build-less', less.task);
  gulp.task('concentrate', concentrate.task);
}

gulp.task('write-flag', ['build-less'], flags.task);

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
var dependencies = (options.symlinks) ?
  ['setup-symlinks', 'write-flag'] :
  ['write-flag'];

gulp.task('default', dependencies, function () {
  process.on('SIGINT', cleanShutdown);
  process.on('SIGHUP', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);

  return q.all([
    phpwatcher.watch(),
    lesswatcher.watch()
  ]);
});
