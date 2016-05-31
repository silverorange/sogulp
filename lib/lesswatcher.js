'use strict';

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

      watcher.on('all', function() {
        gutil.log(
          gutil.colors.gray('..'),
          gutil.colors.magenta('starting less build')
        );
        less.task().on('end', function() {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('finished less build')
          );
        });
      });

      deferred.resolve();
    });

    return deferred.promise;
  }
};
