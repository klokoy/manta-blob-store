var prefix = '/areo/stor/';

function MantaBlobStore(opts) {
    opts = opts || {};

    if (!opts.client) throw Error("manta client required");

    this.client = opts.client;
}

function prepOpts(opts) {
    if (typeof opts === 'string') opts = {
        key: opts
    };
    if (opts.name && !opts.key) opts.key = opts.name;
    return opts;
}

MantaBlobStore.prototype.createReadStream = function(opts) {
    var options = prepOpts(opts);
    return this.client.createReadStream(prefix + options.key);
}

MantaBlobStore.prototype.createWriteStream = function(opts, cb) {
    var options = prepOpts(opts);
    stream = this.client.createWriteStream(prefix + options.key);

    stream.once('close', function(res) {
        cb(null, options);
    });

    return stream;
}

MantaBlobStore.prototype.remove = function(opts, cb) {
    var options = prepOpts(opts);

    this.client.unlink(prefix + options.key, cb);
}

MantaBlobStore.prototype.exists = function(opts, cb) {
    var options = prepOpts(opts);

    this.client.get(prefix + options.key, function(err, value) {
        cb(null, !err);
    });
}

module.exports = MantaBlobStore;
