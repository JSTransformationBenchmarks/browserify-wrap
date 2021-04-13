"use strict";

const fs_readFilePromise = require('util').promisify(require('fs').readFile);

const fs = require('fs');

const Transform = require('stream').Transform;

const wrapper = function (b, opts) {
  b.on("bundle", function (stream) {
    var prefixed = true;
    if (opts.prefix) prefixed = false;

    var transform = function (buf, enc, next) {
      if (!prefixed) this.push(opts.prefix);
      prefixed = true;
      this.push(buf);
      next();
    };

    var flush = function () {
      if (opts.suffix) this.push(opts.suffix);
      this.push(null);
    };

    b.pipeline.get("wrap").unshift(new Transform({
      transform,
      flush
    }));
  });
};

wrapper.concat = async function (files, sep) {
  var body = files.map(async path => await fs_readFilePromise(path, 'utf-8')).join(sep || '');
  return body;
};

module.exports = wrapper;