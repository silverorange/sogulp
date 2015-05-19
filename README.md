so Gulp
=======
Gulp configuration for silverorange websites.

Continuous builds of LESS
-------------------------
Recompiles LESS files automatically when they are changed. To use, do the
following:

 1. Make sure `compile=On` is set in the `[resources]` section of **site-name.ini**.
 2. Run `npm install` to install all the packages needed for our Gulp configuration.
 3. run `gulp` in a terminal

After gulp is running, any changes you make to a LESS file will cause the file
to be recompiled. You can see any error messages in the output of the terminal
where gulp is running.

The gulp configuration also provides source-maps for compiled LESS. This means
in Firefox and Chrome you can get proper line number and file information in
the CSS inspector tool.

Continuous Linting of PHP
-------------------------
The gulp log output will tell you if there is a PHP error when you save a PHP
file.

Symlinks
--------
The gulp watch task and other gulp tasks automatically set the `www/package/*`
symlinks to point to local personal git repositories. If you do not have a
repo checked out for a package, the symlink for that package is not updated.

Symlink updating is required for gulp tasks because all the tasks run on
the local filesystem and not in an Apache context. This means if the PEAR
packages are not yet installed, `lessc` and `concentrate` can not find
required files in packages. Additionally, if you are trying to test changes to
a package, updated symlinks are required so the commands find the correct
files.

Symlink handling is automatic and symlinks are restored after gulp
tasks are finished.

Concentrate
-----------
The gulp file also contains a task to run *concentrate* for a site. After
performing the `npm install` step you can run `gulp concentrate` and all the
compiled, combined files will be generated.
