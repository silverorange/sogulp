const log = require('fancy-log');
const colors = require('ansi-colors');
const childProcess = require('child_process');

function bufferedOutput(data, theBuffer, action) {
  const buffer = theBuffer;
  const lines = `${data}`.match(/[^\n]+(?:\r?\n|$)/g);
  if (lines !== null && lines.length) {
    lines.forEach((theLine) => {
      let line = theLine;

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

/**
 * Runs concentrate with all the appropriate settings
 */
function run(error, out, err) {
  return new Promise((resolve, reject) => {
    const proc = childProcess.spawn('./vendor/bin/concentrate', [
      '--compile',
      '--minify',
      '--combine',
      '-vvv',
      '-d',
      'dependencies/',
      'www/',
    ]);

    const stdoutBuffer = { buffer: '' };
    const stderrBuffer = { buffer: '' };

    if (out) {
      proc.stdout.on('data', (data) => {
        bufferedOutput(data, stdoutBuffer, (line) => out(line));
      });
    }

    if (err) {
      proc.stderr.on('data', (data) => {
        bufferedOutput(data, stderrBuffer, (line) => err(line));
      });
    }

    proc.on('error', (procError) => {
      procError(
        'Failed to run concentrate process. Make sure composer packages are ' +
          'installed'
      );
      reject();
    });

    proc.on('close', (code) => {
      if (out && stdoutBuffer.buffer.length) {
        out(stdoutBuffer.buffer);
      }
      if (err && stderrBuffer.buffer.length) {
        err(stderrBuffer.buffer);
      }
      if (code === 0) {
        resolve();
      } else {
        if (error) {
          error();
        }
        reject();
      }
    });
  });
}

module.exports = {
  task: function runConcentrateTask() {
    run(
      null,
      (line) => log(colors.cyan('[concentrate]'), line),
      (line) => log(colors.red('[concentrate]'), line)
    );
  },
};
