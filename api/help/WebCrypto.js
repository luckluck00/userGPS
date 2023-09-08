 const crypto = require('crypto');

exports.HashType = {
  MD5: 'MD5',
  SHA1: 'SHA1',
  SHA256: 'SHA256',
  SHA512: 'SHA512',
};

exports.getHash = (hashType, text) => {
  let hashValue = new ArrayBuffer(32);
  try {
    const md = crypto.createHash(hashType);
    md.update(text);
    hashValue = md.digest('hex');
  } catch (e) {

  }
  return hashValue;
};

exports.generateUUID = () => {
  return crypto.randomUUID().replaceAll('-', '');
};