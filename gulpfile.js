const gulp = require('gulp');
const gutil = require('gulp-util');
const minimist = require('minimist');

const symlinks = require('./lib/symlinks');
const concentrate = require('./lib/concentrate');
const flags = require('./lib/flags');
const clean = require('./lib/clean');
const phplint = require('./lib/phplint');
const phpclassmap = require('./lib/phpclassmap');
const phpwatcher = require('./lib/phpwatcher');
const less = require('./lib/less');
const lesswatcher = require('./lib/lesswatcher');

const knownOptions = {
  string: 'symlinks',
  default: { symlinks: '' },
};

const options = minimist(process.argv.slice(2), knownOptions);

function symlinkSetupTask() {
  symlinks.task.setup(options.symlinks);
}

if (options.symlinks.length) {
  gulp.task('teardown-symlinks', symlinks.task.teardown);
  gulp.task('setup-symlinks', gulp.series('teardown-symlinks', symlinkSetupTask));
  gulp.task('phpclassmap', gulp.series('setup-symlinks', phpclassmap.task));
  gulp.task('phplint', gulp.series('setup-symlinks', phplint.task));
  gulp.task('clean', gulp.series('teardown-symlinks', clean.task));
  gulp.task('concentrate-internal', gulp.series('setup-symlinks', concentrate.task));
  gulp.task('build-less', gulp.series('setup-symlinks', less.task));
  gulp.task('concentrate', gulp.series('concentrate-internal', 'teardown-symlinks'));
} else {
  gulp.task('phpclassmap', phpclassmap.task);
  gulp.task('phplint', phplint.task);
  gulp.task('clean', clean.task);
  gulp.task('build-less', less.task);
  gulp.task('concentrate', concentrate.task);
}

gulp.task('write-flag', gulp.series('build-less', flags.task));

function cleanShutdown() {
  gutil.log(gutil.colors.blue('BYE'));

  flags.remove();

  if (options.symlinks.length) {
    symlinks.task.teardown();
  }

  process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
const dependencies = (options.symlinks.length) ?
  ['setup-symlinks', 'write-flag'] :
  ['write-flag'];

gulp.task('default', gulp.series(dependencies, () => {
  process.on('SIGINT', cleanShutdown);
  process.on('SIGHUP', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);

  return Promise.all([
    phpwatcher.watch(),
    lesswatcher.watch(),
  ]);
}));
