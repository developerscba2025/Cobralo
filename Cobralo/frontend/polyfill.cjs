const crypto = require('crypto');
if (!crypto.hash) {
  crypto.hash = function(algorithm, data, encoding) {
    return crypto.createHash(algorithm).update(data).digest(encoding);
  };
}
