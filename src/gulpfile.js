const { series, parallel } = require('gulp');

const log = require('fancy-log');
const colors = require('ansi-colors');

const setupSymlinks = require('./tasks/setupSymlinks');
const teardownSymlinks = require('./tasks/teardownSymlinks');
const concentrate = require('./tasks/concentrate');
const writeFlags = require('./tasks/writeFlags');
const removeFlags = require('./tasks/removeFlags');
const clean = require('./tasks/clean');
const phplint = require('./tasks/phplint');
const phpclassmap = require('./tasks/phpclassmap');
const phpwatcher = require('./tasks/phpwatcher');
const less = require('./tasks/less');
const lesswatcher = require('./tasks/lesswatcher');

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
exports.writeFlags = series(exports.less, writeFlags);

async function cleanShutdown() {
  log(colors.blue('BYE'));

  await removeFlags();
  await teardownSymlinks();

  process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
exports.default = series(
  exports.writeFlags,
  async () => {
    process.on('SIGINT', cleanShutdown);
    process.on('SIGHUP', cleanShutdown);
    process.on('SIGTERM', cleanShutdown);
  },
  parallel(phpwatcher, lesswatcher)
);
