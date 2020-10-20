const paths = require('../lib/paths');
const phplintStream = require('../lib/phplintStream');

module.exports = function phplint() {
  return phplintStream(paths.php);
};
