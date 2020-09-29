const gulp = require('gulp');
const log = require('fancy-log');
const colors = require('ansi-colors');
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
  return symlinks.task.setup(options.symlinks);
}

if (options.symlinks.length) {
  gulp.task('teardown-symlinks', symlinks.task.teardown);
  gulp.task(
    'setup-symlinks',
    gulp.series('teardown-symlinks', symlinkSetupTask)
  );
  gulp.task(
    'phpclassmap',
    gulp.series('setup-symlinks', (done) => {
      phpclassmap.task();
      done();
    })
  );
  gulp.task(
    'phplint',
    gulp.series('setup-symlinks', (done) => {
      phplint.task();
      done();
    })
  );
  gulp.task(
    'clean',
    gulp.series('teardown-symlinks', (done) => {
      clean.task();
      done();
    })
  );
  gulp.task(
    'concentrate-internal',
    gulp.series('setup-symlinks', (done) => {
      concentrate.task();
      done();
    })
  );
  gulp.task(
    'build-less',
    gulp.series('setup-symlinks', (done) => {
      less.task();
      done();
    })
  );
  gulp.task(
    'concentrate',
    gulp.series('concentrate-internal', 'teardown-symlinks')
  );
} else {
  gulp.task('phpclassmap', (done) => {
    phpclassmap.task();
    done();
  });
  gulp.task('phplint', (done) => {
    phplint.task();
    done();
  });
  gulp.task('clean', (done) => {
    clean.task();
    done();
  });
  gulp.task('build-less', (done) => {
    less.task();
    done();
  });
  gulp.task('concentrate', (done) => {
    concentrate.task();
    done();
  });
}

gulp.task('write-flag', gulp.series('build-less', flags.task));

function cleanShutdown() {
  log(colors.blue('BYE'));

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
const dependencies = options.symlinks.length
  ? gulp.series('setup-symlinks', 'write-flag')
  : 'write-flag';

gulp.task(
  'default',
  gulp.series(dependencies, () => {
    process.on('SIGINT', cleanShutdown);
    process.on('SIGHUP', cleanShutdown);
    process.on('SIGTERM', cleanShutdown);

    return Promise.all([phpwatcher.watch(), lesswatcher.watch()]);
  })
);
