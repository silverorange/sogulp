const log = require('fancy-log');
const colors = require('ansi-colors');
const fs = require('fs');
const path = require('path');
const paths = require('../lib/paths');
const phpclassmap = require('./phpclassmap');
const getSymlinks = require('../lib/getSymlinks');

/**
 * Replaces vendor package directories with symlinks that point to active
 * package working directories instead of installed composer packages
 */
async function setup(err, progress, complete, symlinks) {
  const packages = symlinks.split(',');
  packages.forEach((packageName) => {
    let packageFound = false;
    paths.vendors.forEach((vendorPath) => {
      if (fs.existsSync(vendorPath)) {
        const packageLinkPath = path.join(vendorPath, packageName);
        if (fs.existsSync(packageLinkPath)) {
          packageFound = true;
          if (!fs.lstatSync(packageLinkPath).isDirectory()) {
            log(colors.red(`.. ${packageName} not a directory`));
          } else {
            const packageRealPath = path.join(
              '/so',
              'packages',
              packageName,
              paths.work
            );

            if (
              fs.existsSync(packageRealPath) &&
              (!fs.existsSync(packageLinkPath) ||
                packageRealPath !== fs.realpathSync(packageLinkPath))
            ) {
              fs.renameSync(
                packageLinkPath,
                `${packageLinkPath}${paths.symlinkSuffix}`
              );
              fs.symlinkSync(packageRealPath, packageLinkPath);
              if (progress) {
                progress(packageName, packageLinkPath, packageRealPath);
              }
            }
          }
        }
      }
    });

    if (!packageFound) {
      log(colors.red(`.. ${packageName} package not found`));
    }
  });

  await phpclassmap();

  if (complete) {
    complete();
  }
}

module.exports = async function setupSymlinks() {
  const symlinks = getSymlinks();
  const useSymlinks = symlinks.length > 0;

  if (useSymlinks) {
    log(colors.blue('Updating symlinks in vendor directories:'));
    return setup(
      null,
      (packageName) => log(colors.gray('..'), packageName),
      () => log(colors.blue('Done')),
      symlinks
    );
  }

  return Promise.resolve();
};
