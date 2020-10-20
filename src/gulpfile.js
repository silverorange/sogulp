const { series, parallel, watch } = require('gulp');
const fancyLog = require('fancy-log');
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
const less = require('./tasks/less');
const log = require('./tasks/log');

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

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
exports.default = series(
  exports.setupSymlinks,
  parallel(
    series(
      log(colors.gray('..'), `starting '${colors.cyan('less')}'...`),
      less,
      writeFlags,
      log(colors.gray('..'), `finished '${colors.cyan('less')}'`)
    ),
    series(
      log(colors.gray('..'), `starting '${colors.cyan('phpclassmap')}'...`),
      phpclassmap,
      log(colors.gray('..'), `finished '${colors.cyan('phpclassmap')}'`)
    )
  ),
  log(
    colors.gray('..'),
    'ready and watching LESS and PHP files for changes...'
  ),
  (cb) => {
    const lessWatcher = watch(
      paths.less,
      {
        persistent: true,
        followSymlinks: true,
      },
      series(
        log(colors.gray('..'), colors.magenta('starting LESS build')),
        less,
        log(colors.gray('..'), colors.magenta('finished LESS build'))
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
          log(
            colors.gray('..'),
            colors.magenta('starting composer dump-autoload')
          ),
          phpclassmap,
          log(
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
        fancyLog(colors.gray('..'), 'stoping watchers for LESS and PHP...');

        // Chokidar docs say this returns a Promise but that does not seem to be
        // true.
        lessWatcher.close();
        phpWatcher.close();

        fancyLog(colors.gray('..'), 'stopped watchers for LESS and PHP.');
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
