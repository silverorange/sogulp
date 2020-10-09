const { series, watch } = require('gulp');

const log = require('fancy-log');
const colors = require('ansi-colors');

const paths = require('./lib/paths');
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
  logTask(colors.blue('Compiling less files ...')),
  less,
  logTask(colors.blue('Done')),
  writeFlags,
  logTask(colors.blue('Starting watchers for less and php ...')),
  (cb) => {
    const lessWatcher = watch(
      paths.less,
      {
        persistent: true,
        followSymlinks: true,
      },
      series(
        logTask(colors.gray('..'), colors.magenta('starting less build')),
        less,
        logTask(colors.gray('..'), colors.magenta('finished less build'))
      )
    );

    async function cleanShutdown() {
      log(colors.blue('Stoping watchers for less and php ...'));

      // Chokidar docs say this returns a Promise but that does not seem to be
      // true.
      lessWatcher.close();

      log(colors.blue('Stopped'));
      cb();
    }

    process.on('SIGINT', cleanShutdown);
    process.on('SIGHUP', cleanShutdown);
    process.on('SIGTERM', cleanShutdown);
  },
  removeFlags,
  teardownSymlinks
);
