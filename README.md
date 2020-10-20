# silverorange Gulp Configuration

Gulp configuration for silverorange PHP websites.

## Adding to Projects

1. `yarn add --dev gulp sogulp`
2. add a `gulpfile.js` that contains:
   ```
   const tasks = require('sogulp');
   module.exports = tasks;
   ```
3. `git add package.json yarn.lock`
4. `git commit`
5. `gulp`

## Continuous builds of LESS

Recompiles LESS files automatically when they are changed. To use, do the
following:

1.  Make sure `compile=On` is set in the `[resources]` section of **site-name.ini**.
2.  Run `yarn install` to install all the packages needed for our Gulp configuration.
3.  run `gulp` in a terminal

After gulp is running, any changes you make to a LESS file will cause the file
to be recompiled. You can see any error messages in the output of the terminal
where gulp is running.

The gulp configuration also provides source-maps for compiled LESS. This means
in Firefox and Chrome you can get proper line number and file information in
the CSS inspector tool.

## Continuous Linting of PHP

The gulp log output will tell you if there is a PHP error when you save a PHP
file.

## Symlinks

If you want to work on a package, you can create symlinks to the package files
and `www/` resources using `--symlinks=packageName1,packageName2`.

Package symlinks are restored after gulp tasks are finished.

## Concentrate

The gulp file also contains a task to run
[concentrate](https://github.com/silverorange/Concentrate) for a site. After
performing the `yarn install` step you can run `gulp concentrate` and all the
compiled, combined files will be generated.
