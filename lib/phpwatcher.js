'use strict';

var batch = require('gulp-batch');
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
      var buildClassMap = batch(function(events, complete) {
        gutil.log(
          gutil.colors.gray('..'),
          gutil.colors.magenta('starting dump-autoload')
        );
        phpclassmap.task().then(function() {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('finished dump-autoload')
          );
          complete();
        });
      });

      var lint = function(path) {
        phplint.stream(path);
      };

      watcher
        .on('add', function(path) { lint(path); })
        .on('change', function(path) { lint(path); })
      ;

      if (hasComposer) {
        watcher
          .on('add', function(path) { buildClassMap(path); })
          .on('change', function(path) { buildClassMap(path); })
          .on('unlink', function(path) { buildClassMap(path); })
        ;
      }

      deferred.resolve();
    });

    return deferred.promise;
  }
};
