const log = require('fancy-log');
const colors = require('ansi-colors');
const fs = require('fs');
const path = require('path');
const paths = require('../lib/paths');
const phpclassmap = require('./phpclassmap');
const getSymlinks = require('../lib/getSymlinks');

/**
 * Replaces package symlinks with directories that point to installed composer
 * packages
 */
async function teardown(err, progress, complete) {
  paths.vendors.forEach((vendorPath) => {
    if (fs.existsSync(vendorPath)) {
      fs.readdirSync(vendorPath).forEach((packageName) => {
        const packageLinkPath = path.join(vendorPath, packageName);
        const packageOriginalPath = `${packageLinkPath}${paths.symlinkSuffix}`;
        if (
          fs.existsSync(packageLinkPath) &&
          fs.existsSync(packageOriginalPath) &&
          fs.lstatSync(packageLinkPath).isSymbolicLink() &&
          fs.lstatSync(packageOriginalPath).isDirectory()
        ) {
          fs.unlinkSync(packageLinkPath);
          fs.renameSync(packageOriginalPath, packageLinkPath);

          if (progress) {
            progress(packageName, packageLinkPath);
          }
        }
      });
    }
  });

  await phpclassmap();

  if (complete) {
    complete();
  }
}

module.exports = async function teardownSymlinks() {
  const symlinks = getSymlinks();
  const useSymlinks = symlinks.length > 0;

  if (useSymlinks) {
    log(colors.blue('Restoring symlinks in vendor directories:'));
    return teardown(
      null,
      (packageName) => log(colors.gray('..'), packageName),
      () => log(colors.blue('Done'))
    );
  }
  return Promise.resolve();
};
