const changed = require('gulp-changed');
const gulp = require('gulp');
const gutil = require('gulp-util');
const less = require('gulp-less');
const path = require('path');
const rebaseUrls = require('gulp-css-url-rebase');
const rename = require('gulp-rename');
const paths = require('./paths');

module.exports = {
  /**
   * Rebuilds LESS files in the www/styles and www/packages/[*]/styles
   * directories
   */
  task: function lessTask() {
    return (
      gulp
        .src(paths.less, { cwdbase: true })

        // only consider changed files
        .pipe(changed(paths.compiled))

        // Compile less with include path set to the www dir. Less includes
        // within files will be resolved relative to "./www"
        .pipe(less({ paths: [path.join(__dirname, 'www')] }))
        .on('error', (e) => {
          gutil.log(gutil.colors.red('LESSC ERROR:'), e.message);
          // Needed so watcher tasks get notified the stream has ended.
          this.emit('end');
        })

        // Rebase relative URIs inside CSS to match new location.
        .pipe(
          rebaseUrls({
            root: 'www',
            reroot: 'www/compiled',
          })
        )

        // drop leading www dir on output path
        .pipe(
          rename((pathToRename) => {
            const renamedPath = pathToRename;
            const dir = renamedPath.dirname.split('/');
            dir.shift();
            renamedPath.dirname = dir.join('/');
            return renamedPath;
          })
        )

        // set file extension to .less instead of default .css
        .pipe(
          rename((pathToRename) => {
            const renamedPath = pathToRename;
            renamedPath.extname = '.less';
            return renamedPath;
          })
        )

        // output compiled less to the compiled dir
        .pipe(gulp.dest(paths.compiled))
    );
  },
};
