const batch = require('gulp-batch');
const log = require('fancy-log');
const colors = require('ansi-colors');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const paths = require('../lib/paths');
const phplintStream = require('../lib/phplintStream');
const phpclassmap = require('./phpclassmap');

module.exports = async function phpwatcher() {
  return new Promise((resolve) => {
    const hasComposer = fs.existsSync(paths.composerLock);
    const watchPaths = paths.php.slice();

    // Chokidar can't glob symlink directories properly so explicitly list
    // each directory instead.
    if (hasComposer) {
      paths.vendors.forEach((vendorPath) => {
        if (fs.existsSync(vendorPath)) {
          fs.readdirSync(vendorPath).forEach((dir) => {
            const vendorDir = path.join(vendorPath, dir);
            const stats = fs.lstatSync(vendorDir);
            if (stats.isSymbolicLink()) {
              watchPaths.push(path.join(vendorDir, '**', '*.php'));
            }
          });
        }
      });
    }

    const watcher = chokidar.watch(watchPaths, {
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
    });

    watcher.on('ready', async () => {
      const buildClassMap = batch(async (events, complete) => {
        log(colors.gray('..'), colors.magenta('starting dump-autoload'));
        await phpclassmap();
        log(colors.gray('..'), colors.magenta('finished dump-autoload'));
        complete();
      });

      watcher
        .on('add', (addedPath) => phplintStream(addedPath))
        .on('change', (changedPath) => phplintStream(changedPath));

      if (hasComposer) {
        watcher
          .on('add', (addedPath) => buildClassMap(addedPath))
          .on('change', (changedPath) => buildClassMap(changedPath))
          .on('unlink', (unlinkedPath) => buildClassMap(unlinkedPath));
      }

      resolve();
    });
  });
};
