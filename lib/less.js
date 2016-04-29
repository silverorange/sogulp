'use strict';

var changed = require('gulp-changed');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var path = require('path');
var rebaseUrls = require('gulp-css-url-rebase');
var rename = require('gulp-rename');
var paths = require('./paths');

module.exports = {
  /**
   * Rebuilds LESS files in the www/styles and www/packages/[*]/styles
   * directories
   */
  task: function() {
    return gulp
      .src(paths.less, { cwdbase: true })

      // only consider changed files
      .pipe(changed(paths.compiled))

      // Compile less with include path set to the www dir. Less includes
      // within files will be resolved relative to "./www"
      .pipe(less({ paths: [path.join(__dirname, 'www')] }))
      .on('error', function(e) {
        gutil.log(gutil.colors.red('LESSC ERROR:'), e.message);
      })

      // Rebase relative URIs inside CSS to match new location.
      .pipe(rebaseUrls({
        root: 'www',
        reroot: 'www/compiled'
      }))

      // drop leading www dir on output path
      .pipe(rename(function (path) {
        var dir = path.dirname.split('/');
        dir.shift();
        path.dirname = dir.join('/');
        return path;
      }))

      // set file extension to .less instead of default .css
      .pipe(rename(function (path) {
        path.extname = '.less';
        return path;
      }))

      // output compiled less to the compiled dir
      .pipe(gulp.dest(paths.compiled));
  }
};
