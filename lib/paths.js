const path = require('path');

const cwd = process.cwd();
const workDir = path.basename(cwd);
const vendorsDir = path.join(cwd, 'vendor', 'silverorange');
const packagesDir = path.join(cwd, 'www', 'packages');

module.exports = {
  cwd,
  work: workDir,
  vendors: vendorsDir,
  packages: packagesDir,
  composerLock: 'composer.lock',
  less: [
    'www/styles/*.less',
    'www/styles/*/*.less',
    'www/packages/*/styles/*.less',
  ],
  php: [
    'include/*.php',
    'include/**/*.php',
    'system/**/*.php',
    'newsletter/**/*.php',
    'www/*.php',
    'www/admin/*.php',
  ],
  min: 'www/min',
  compiled: 'www/compiled',
  minified: 'www/min',
  compiledFlag: 'www/.concentrate-compiled',
  minifiedFlag: 'www/.concentrate-minified',
  combinedFlag: 'www/.concentrate-combined',
};
