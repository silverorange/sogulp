const gutil = require('gulp-util');
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const suffix = '.original';

/**
 * Replaces vendor package directories with symlinks that point to active
 * package working directories instead of installed composer packages
 */
function setup(err, progress, complete) {
  if (fs.existsSync(paths.vendors)) {
    fs.readdirSync(paths.vendors).forEach((packageName) => {
      const packageLinkPath = path.join(paths.vendors, packageName);
      if (fs.lstatSync(packageLinkPath).isDirectory()) {
        const packageRealPath = path.join(
          '/so',
          'packages',
          packageName,
          paths.work
        );

        if (fs.existsSync(packageRealPath) &&
          (
               !fs.existsSync(packageLinkPath) ||
               packageRealPath !== fs.realpathSync(packageLinkPath)
          )
        ) {
          fs.renameSync(packageLinkPath, packageLinkPath + suffix);
          fs.symlinkSync(packageRealPath, packageLinkPath);
          if (progress) {
            progress(
              packageName,
              packageLinkPath,
              packageRealPath
            );
          }
        }
      }
    });
  }

  if (complete) {
    complete();
  }
}

/**
 * Replaces package symlinks with directories that point to installed composer
 * packages
 */
function teardown(err, progress, complete) {
  if (fs.existsSync(paths.vendors)) {
    fs.readdirSync(paths.vendors).forEach((packageName) => {
      const packageLinkPath = path.join(paths.vendors, packageName);
      const packageOriginalPath = packageLinkPath + suffix;
      if (fs.existsSync(packageLinkPath) &&
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

  if (complete) {
    complete();
  }
}

module.exports = {
  task: {
    setup: function setupTask() {
      gutil.log(
        gutil.colors.blue('Updating symlinks in vendor/silverorange:')
      );
      return setup(
        null,
        (packageName) => gutil.log(gutil.colors.gray('..'), packageName),
        () => gutil.log(gutil.colors.blue('Done'))
      );
    },
    teardown: function teardownTask() {
      gutil.log(
        gutil.colors.blue('Restoring symlinks in vendor/silverorange:')
      );
      return teardown(
        null,
        (packageName) => gutil.log(gutil.colors.gray('..'), packageName),
        () => gutil.log(gutil.colors.blue('Done'))
      );
    },
  },
};