'use strict';

var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');

var paths = require('./paths');
var suffix = '.original';

/**
 * Replaces vendor package directories with symlinks that point to active
 * package working directories instead of installed composer packages
 */
var setup = function(err, progress, complete) {
  fs.readdirSync(paths.vendors).forEach(function(packageName) {
    var packageLinkPath = path.join(paths.vendors, packageName);
    if (fs.lstatSync(packageLinkPath).isDirectory()) {
      var packageRealPath = path.join(
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

  if (complete) {
    complete();
  }
};

/**
 * Replaces package symlinks with directories that point to installed composer
 * packages
 */
var teardown = function(err, progress, complete) {
  fs.readdirSync(paths.vendors).forEach(function(packageName) {
    var packageLinkPath = path.join(paths.vendors, packageName);
    var packageOriginalPath = packageLinkPath + suffix;
    if (fs.existsSync(packageLinkPath) &&
      fs.existsSync(packageOriginalPath) &&
      fs.lstatSync(packageLinkPath).isSymbolicLink() &&
      fs.lstatSync(packageOriginalPath).isDirectory()) {

      fs.unlinkSync(packageLinkPath);
      fs.renameSync(packageOriginalPath, packageLinkPath);

      if (progress) {
        progress(packageName, packageLinkPath);
      }
    }
  });

  if (complete) {
    complete();
  }
};

module.exports = {
  task: {
    setup: function() {
      gutil.log(
        gutil.colors.blue('Updating symlinks in vendor/silverorange:')
      );
      return setup(
        null,
        function (packageName) {
          gutil.log(gutil.colors.gray('..'), packageName);
        },
        function () {
          gutil.log(gutil.colors.blue('Done'));
        }
      );
    },
    teardown: function() {
      gutil.log(
        gutil.colors.blue('Restoring symlinks in vendor/silverorange:')
      );
      return teardown(
        null,
        function (packageName) {
          gutil.log(gutil.colors.gray('..'), packageName);
        },
        function () {
          gutil.log(gutil.colors.blue('Done'));
        }
      );
    }
  }
};
