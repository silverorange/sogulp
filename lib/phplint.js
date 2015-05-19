'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var Spawn = require('spawn');
var Stream = require('stream');

var spawn = function() {
	return Spawn({
		cmd: 'php',
		args: [ '-l' ]
	});
};

var filter = function(error, err) {
	var stream = new Stream.PassThrough({ objectMode: true });

	stream._transform = function (file, unused, done) {
		if (file.isNull()) {
			this.push(file);
			done();
			return;
		}

		if (file.isBuffer()) {
			// remove whitespace
			var contents = file.contents.toString().replace(/(^\s+|\s+$)/g, '');
			var filename = file.path.substr(file.base.length + 1);

			// exclude valid files from output
			if (!/^No syntax errors detected in -/.test(contents)) {
				// remove stdin filename
				contents = contents.replace(/in - on line/, 'on line');

				// remove unnecessary line
				contents = contents.replace(/\s+Errors parsing -$/g, '');

				if (err) {
					err(filename, contents);
				}
			}
		}

		this.push(file);
		done();
	}

	return stream;
};

module.exports = {
	task: function() {
		gulp.src(paths.php, { cwdbase:true, buffer:true })
			.pipe(spawn())
			.pipe(
				filter(
					null,
					function(filename, contents) {
						gutil.log(
							gutil.colors.red('[PHP]'),
							filename,
							'->',
							contents
						);
					}
				)
			);
	}
};
