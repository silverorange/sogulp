'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');

var vendorSymlinks = require('./lib/vendor-symlinks');
var packageSymlinks = require('./lib/package-symlinks');
var concentrate = require('./lib/concentrate');
var paths = require('./lib/paths');
var flags = require('./lib/flags');
var clean = require('./lib/clean');
var phplint = require('./lib/phplint');
var phpclassmap = require('./lib/phpclassmap');
var less = require('./lib/less');

var hasComposer = (fs.existsSync(paths.composerLock));

gulp.task('setup-package-symlinks', packageSymlinks.task.setup);
gulp.task('teardown-package-symlinks', packageSymlinks.task.teardown);

if (hasComposer) {
  gulp.task('phpclassmap', ['setup-symlinks'], phpclassmap.task);
  gulp.task('setup-vendor-symlinks', vendorSymlinks.task.setup);
  gulp.task('teardown-vendor-symlinks', vendorSymlinks.task.teardown);
  gulp.task('setup-symlinks', ['setup-package-symlinks', 'setup-vendor-symlinks']);
  gulp.task('teardown-symlinks', ['teardown-package-symlinks', 'teardown-vendor-symlinks']);
} else {
  gulp.task('setup-symlinks', ['setup-package-symlinks']);
  gulp.task('teardown-symlinks', ['teardown-package-symlinks']);
}

gulp.task('phplint', ['setup-symlinks'], phplint.task);
gulp.task('clean', ['teardown-symlinks'], clean.task);
gulp.task('concentrate-internal', ['setup-package-symlinks'], concentrate.task);
gulp.task('concentrate', ['concentrate-internal'], function() {
  return packageSymlinks.task.teardown();
});
gulp.task('build-less', ['setup-symlinks'], less.task);
gulp.task('write-flag', ['build-less'], flags.task);

function cleanShutdown() {
  gutil.log(gutil.colors.blue('BYE'));

  flags.remove();
  if (hasComposer) {
    vendorSymlinks.task.teardown();
  }
  packageSymlinks.task.teardown();

  process.exit();
}

/**
 * Watches LESS and JS files for changes and recompiles/minifies/bundles
 * them.
 */
gulp.task('default', ['setup-symlinks', 'write-flag'], function () {
  process.on('SIGINT', cleanShutdown);
  process.on('SIGHUP', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);

  gulp.watch(paths.less, ['build-less']);

  var dependencies = (hasComposer) ? ['phpclassmap'] : [];
  gulp.watch(paths.php, dependencies)
    .on('change', function(event) {
      if (/^(changed|renamed|added)$/.test(event.type)) {
        return phplint.stream(event.path);
      }
    });
});
