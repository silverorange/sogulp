'use strict';

var batch = require('gulp-batch');
var gutil = require('gulp-util');
var chokidar = require('chokidar');
var q = require('q');

var paths = require('./paths');
var less = require('./less');

module.exports = {
  watch: function() {
    var deferred = q.defer();

    var watcher = chokidar.watch(
      paths.less,
      {
        persistent: true,
        followSymlinks: true
      }
    );

    watcher.on('ready', function() {
      var buildLess = batch(function(events, complete) {
        gutil.log(
          gutil.colors.gray('..'),
          gutil.colors.magenta('starting less build')
        );
        less.task().on('end', function() {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('finished less build')
          );
          complete();
        });
      });

      watcher
        .on('add', function(path) { buildLess(path); })
        .on('change', function(path) { buildLess(path); })
        .on('unlink', function(path) { buildLess(path); })
      ;

      deferred.resolve();
    });

    return deferred.promise;
  }
};
