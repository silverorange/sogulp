'use strict';

var gutil = require('gulp-util');
var fs = require('fs');
var chokidar = require('chokidar');
var path = require('path');
var q = require('q');

var paths = require('./paths');
var phplint = require('./phplint');
var phpclassmap = require('./phpclassmap');

module.exports = {
  watch: function() {
    var deferred = q.defer();

    var hasComposer = fs.existsSync(paths.composerLock);
    var watchPaths = paths.php.slice();

    // Chokidar can't glob symlink directories properly so explicitly list
    // each directory instead.
    if (hasComposer) {
      fs.readdirSync(paths.vendors).forEach(function(dir) {
        dir = path.join(paths.vendors, dir);
        var stats = fs.lstatSync(dir);
        if (stats.isSymbolicLink()) {
          watchPaths.push(path.join(dir, '**', '*.php'));
        }
      });
    }

    var watcher = chokidar.watch(
      watchPaths,
      {
        // Ignore composer autoload files and backup silverorange composer
        // package directories.
        ignored: [
          /^vendor\/autoload.php$/,
          /^vendor\/composer\/.*\.php$/,
          /^vendor\/silverorange\/.*\.original\/.*\.php$/
        ],
        persistent: true,
        followSymlinks: true
      }
    );

    watcher.on('ready', function() {
      var watchAllHandler = function() {
        if (hasComposer) {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('starting dump-autoload')
          );
          phpclassmap.task().then(function() {
            gutil.log(
              gutil.colors.gray('..'),
              gutil.colors.magenta('finished dump-autoload')
            );
          });
        }
      };

      var watchChangedHandler = function(path) {
        phplint.stream(path);
      };

      watcher.on('all', function(path) { watchAllHandler(path); });
      watcher.on('add', function(path) { watchChangedHandler(path); });
      watcher.on('change', function(path) { watchChangedHandler(path); });

      deferred.resolve();
    });

    return deferred.promise;
  }
};
