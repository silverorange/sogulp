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

const useSymlinks = options.symlinks.length > 0;

gulp.task(
  'teardown-symlinks',
  useSymlinks ? symlinks.task.teardown : async () => null
);

gulp.task(
  'setup-symlinks',
  useSymlinks
    ? gulp.series('teardown-symlinks', symlinkSetupTask)
    : async () => null
);

gulp.task(
  'phpclassmap',
  gulp.series('setup-symlinks', async () => {
    await phpclassmap.task();
  })
);

gulp.task(
  'phplint',
  gulp.series('setup-symlinks', async () => {
    phplint.task();
  })
);

gulp.task(
  'clean',
  gulp.series('teardown-symlinks', async () => {
    clean.task();
  })
);

gulp.task(
  'build-less',
  gulp.series('setup-symlinks', async () => {
    less.task();
  })
);

gulp.task(
  'concentrate',
  gulp.series(
    'setup-symlinks',
    async () => {
      concentrate.task();
    },
    'teardown-symlinks'
  )
);

gulp.task(
  'write-flag',
  gulp.series('build-less', async () => {
    flags.task();
  })
);

async function cleanShutdown() {
  log(colors.blue('BYE'));

  flags.remove();

  if (useSymlinks) {
    await symlinks.task.teardown();
  }

  process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
const dependencies = useSymlinks
  ? ['setup-symlinks', 'write-flag']
  : ['write-flag'];

gulp.task(
  'default',
  gulp.series(...dependencies, () => {
    process.on('SIGINT', cleanShutdown);
    process.on('SIGHUP', cleanShutdown);
    process.on('SIGTERM', cleanShutdown);

    return Promise.all([phpwatcher.watch(), lesswatcher.watch()]);
  })
);
