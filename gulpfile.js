const gulp = require('gulp');
const gutil = require('gulp-util');
const q = require('q');
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
  gulp.task('setup-symlinks', symlinkSetupTask);
  gulp.task('teardown-symlinks', symlinks.task.teardown);
  gulp.task('phpclassmap', ['setup-symlinks'], phpclassmap.task);
  gulp.task('phplint', ['setup-symlinks'], phplint.task);
  gulp.task('clean', ['teardown-symlinks'], clean.task);
  gulp.task('concentrate-internal', ['setup-symlinks'], concentrate.task);
  gulp.task('build-less', ['setup-symlinks'], less.task);
  gulp.task(
    'concentrate',
    ['concentrate-internal'],
    () => symlinks.task.teardown()
  );
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

gulp.task('default', dependencies, () => {
  process.on('SIGINT', cleanShutdown);
  process.on('SIGHUP', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);

  return q.all([
    phpwatcher.watch(),
    lesswatcher.watch(),
  ]);
});
