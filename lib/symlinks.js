const log = require('fancy-log');
const colors = require('ansi-colors');
const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const classmapTask = require('./phpclassmap').task;

const suffix = '.original';

/**
 * Replaces vendor package directories with symlinks that point to active
 * package working directories instead of installed composer packages
 */
function setup(err, progress, complete, symlinks) {
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
              fs.renameSync(packageLinkPath, packageLinkPath + suffix);
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

  return classmapTask()
    .then(() => {
      if (complete) {
        complete();
      }
      return Promise.resolve();
    })
    .catch(() => {
      if (complete) {
        complete();
      }
      return Promise.resolve();
    });
}

/**
 * Replaces package symlinks with directories that point to installed composer
 * packages
 */
function teardown(err, progress, complete) {
  paths.vendors.forEach((vendorPath) => {
    if (fs.existsSync(vendorPath)) {
      fs.readdirSync(vendorPath).forEach((packageName) => {
        const packageLinkPath = path.join(vendorPath, packageName);
        const packageOriginalPath = packageLinkPath + suffix;
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

  return classmapTask()
    .then(() => {
      if (complete) {
        complete();
      }
      return Promise.resolve();
    })
    .catch(() => {
      if (complete) {
        complete();
      }
      return Promise.resolve();
    });
}

module.exports = {
  task: {
    setup: function setupTask(symlinks) {
      log(colors.blue('Updating symlinks in vendor directories:'));
      return setup(
        null,
        (packageName) => log(colors.gray('..'), packageName),
        () => log(colors.blue('Done')),
        symlinks
      );
    },
    teardown: function teardownTask() {
      log(colors.blue('Restoring symlinks in vendor directories:'));
      return teardown(
        null,
        (packageName) => log(colors.gray('..'), packageName),
        () => log(colors.blue('Done'))
      );
    },
  },
};
