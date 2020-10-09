const { series, parallel, watch } = require('gulp');

const log = require('fancy-log');
const colors = require('ansi-colors');

const paths = require('./lib/paths');
const getPhpWatchPaths = require('./lib/getPhpWatchPaths');
const phplintStream = require('./lib/phplintStream');
const setupSymlinks = require('./tasks/setupSymlinks');
const teardownSymlinks = require('./tasks/teardownSymlinks');
const concentrate = require('./tasks/concentrate');
const writeFlags = require('./tasks/writeFlags');
const removeFlags = require('./tasks/removeFlags');
const clean = require('./tasks/clean');
const phplint = require('./tasks/phplint');
const phpclassmap = require('./tasks/phpclassmap');
// const phpwatcher = require('./tasks/phpwatcher');
const less = require('./tasks/less');

exports.setupSymlinks = series(teardownSymlinks, setupSymlinks);
exports.phpclassmap = series(exports.setupSymlinks, phpclassmap);
exports.phplint = series(exports.setupSymlinks, phplint);
exports.clean = series(teardownSymlinks, clean);
exports.less = series(exports.setupSymlinks, less);
exports.concentrate = series(
  exports.setupSymlinks,
  concentrate,
  teardownSymlinks
);

function logTask(...message) {
  return async () => log(...message);
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
exports.default = series(
  exports.setupSymlinks,
  parallel(
    series(
      logTask(colors.blue('Compiling less files ...')),
      less,
      logTask(colors.blue('... done compiling less files.')),
      writeFlags
    ),
    series(
      logTask(colors.blue('Running composer dump-autoload ...')),
      phpclassmap,
      logTask(colors.blue('... done running composer dump-autoload files.'))
    )
  ),
  logTask(colors.blue('Watching LESS and PHP files for changes ...')),
  (cb) => {
    const lessWatcher = watch(
      paths.less,
      {
        persistent: true,
        followSymlinks: true,
      },
      series(
        logTask(colors.gray('..'), colors.magenta('starting LESS build')),
        less,
        logTask(colors.gray('..'), colors.magenta('finished LESS build'))
      )
    );

    getPhpWatchPaths().then((phpPaths) => {
      const phpWatcher = watch(
        phpPaths,
        {
          // Ignore composer autoload files and backup silverorange composer
          // package directories.
          ignored: [
            /^vendor\/autoload.php$/,
            /^vendor\/composer\/.*\.php$/,
            /^vendor\/silverorange\/.*\.original\/.*\.php$/,
            /^vendor\/hippo\/.*\.original\/.*\.php$/,
          ],
          persistent: true,
          followSymlinks: true,
          events: ['add', 'change', 'delete'],
        },
        series(
          logTask(
            colors.gray('..'),
            colors.magenta('starting composer dump-autoload')
          ),
          phpclassmap,
          logTask(
            colors.gray('..'),
            colors.magenta('finished composer dump-autoload')
          )
        )
      );

      // Linit only changed files. These do not get debounced or queued. See
      // https://gulpjs.com/docs/en/api/watch#chokidar-instance
      phpWatcher
        .on('add', (addedPath) => phplintStream(addedPath))
        .on('change', (changedPath) => phplintStream(changedPath));

      async function cleanShutdown() {
        log(colors.blue('Stoping watchers for LESS and PHP ...'));

        // Chokidar docs say this returns a Promise but that does not seem to be
        // true.
        lessWatcher.close();
        phpWatcher.close();

        log(colors.blue('... stopped watchers for LESS and PHP.'));
        cb();
      }

      process.on('SIGINT', cleanShutdown);
      process.on('SIGHUP', cleanShutdown);
      process.on('SIGTERM', cleanShutdown);
    });
  },
  removeFlags,
  teardownSymlinks
);
