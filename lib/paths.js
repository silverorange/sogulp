'use strict';

var path = require('path');

var cwd = process.cwd();
var workDir = path.basename(cwd);
var vendorsDir = path.join(cwd, 'vendor', 'silverorange');
var packagesDir = path.join(cwd, 'www', 'packages');

module.exports = {
  cwd: cwd,
  work: workDir,
  vendors: vendorsDir,
  packages: packagesDir,
  composerLock: 'composer.lock',
  less: [
    'www/styles/*.less',
    'www/styles/*/*.less',
    'www/packages/*/styles/*.less'
  ],
  php: [
    'include/*.php',
    'include/**/*.php',
    'system/**/*.php',
    'newsletter/**/*.php',
    'www/*.php',
    'vendor/**/*.php'
  ],
  min: 'www/min',
  compiled: 'www/compiled',
  minified: 'www/min',
  compiledFlag: 'www/.concentrate-compiled',
  minifiedFlag: 'www/.concentrate-minified',
  combinedFlag: 'www/.concentrate-combined'
};
