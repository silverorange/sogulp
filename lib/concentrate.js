'use strict';

var gutil = require('gulp-util');
var child_process = require('child_process');
var q = require('q');

function bufferedOutput(data, buffer, action) {
	var lines = ('' + data).match(/[^\n]+(?:\r?\n|$)/g);
	if (lines.length) {
		lines.forEach(function(line) {
			// if line ends in a newline we can display it, otherwise buffer
			// a partial line
			if (/\n$/.test(line)) {
				// if we have an active buffer, prepend it to the current line
				if (buffer.buffer.length) {
					line = buffer.buffer + line;
					buffer.buffer = '';
				}

				// strip newlines before display (gulp log adds them)
				line = line.replace(/\r?\n$/, '');

				action(line);
			} else {
				// if we got a partial line, buffer it
				buffer.buffer += line;
			}
		});
	}
}

module.exports = {
	/**
	 * Runs concentrate with all the appropriate settings
	 */
	run: function(error, err, out) {
		var deferred = q.defer();
		var proc = child_process.spawn(
			'concentrate',
			[
				'--compile',
				'--minify',
				'--combine',
				'-vvv',
				'-c',
				'pear/pearrc',
				'-d',
				'dependencies/',
				'www/'
			]
		);

		var stdoutBuffer = { buffer: '' };
		var stderrBuffer = { buffer: '' };

		if (out) {
			proc.stdout.on('data', function(data) {
				bufferedOutput(data, stdoutBuffer, function(line) {
					out(line);
				});
			});
		}

		if (err) {
			proc.stderr.on('data', function(data) {
				bufferedOutput(data, stdoutBuffer, function(line) {
					err(line);
				});
			});
		}

		proc.on('close', function(code) {
			if (out && stdoutBuffer.buffer.length) {
				out(stdoutBuffer.buffer);
			}
			if (err && stderrBuffer.buffer.length) {
				err(stderrBuffer.buffer);
			}
			if (code === 0) {
				deferred.resolve();
			} else {
				if (error) {
					error();
				}
				deferred.reject();
			}
		});

		return deferred.promise;
	},
	task: function() {
		this.run(
			null,
			function (line) {
				gutil.log(gutil.colors.cyan('[concentrate]'), line);
			},
			function (line) {
				gutil.log(gutil.colors.red('[concentrate]'), line);
			}
		);
	}
};
