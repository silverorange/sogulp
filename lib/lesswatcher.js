const batch = require('gulp-batch');
const gutil = require('gulp-util');
const chokidar = require('chokidar');
const paths = require('./paths');
const less = require('./less');

module.exports = {
  watch: function watchTask() {
    return new Promise((resolve) => {
      const watcher = chokidar.watch(
        paths.less,
        {
          persistent: true,
          followSymlinks: true,
        }
      );

      watcher.on('ready', () => {
        const buildLess = batch((events, complete) => {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('starting less build')
          );
          less.task().on('end', () => {
            gutil.log(
              gutil.colors.gray('..'),
              gutil.colors.magenta('finished less build')
            );
            complete();
          });
        });

        watcher
          .on('add', (path) => buildLess(path))
          .on('change', (path) => buildLess(path))
          .on('unlink', (path) => buildLess(path))
        ;

        resolve();
      });
    });
  },
};
