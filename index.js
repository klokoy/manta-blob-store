var path = require('path'),
    PassThrough = require('stream').PassThrough

var mantaPath;

function MantaBlobStore(opts) {
    opts = opts || {};

    if (!opts.client) throw Error("manta client required");
    this.client = opts.client;

    if (opts.path) {
        mantaPath = opts.path;
    } else {
        //defaults to root path for the manta user
        mantaPath = '/' + this.client.user + '/stor/';
    }
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
    return this.client.createReadStream(mantaPath + options.key);
}

MantaBlobStore.prototype.createWriteStream = function(opts, cb) {
    var self = this;

    var options = prepOpts(opts);
    var dirname = path.dirname(options.key);
    var passthrough = new PassThrough;

    self.client.mkdirp(mantaPath + dirname, function(err) {

        var stream = self.client.createWriteStream(mantaPath + options.key);

        passthrough
            .pipe(stream);

        stream.once('close', function(res) {
            cb(null, options);
        });

    });

    return passthrough;
}

MantaBlobStore.prototype.remove = function(opts, cb) {
    var options = prepOpts(opts);

    this.client.unlink(mantaPath + options.key, cb);
}

MantaBlobStore.prototype.exists = function(opts, cb) {
    var options = prepOpts(opts);

    this.client.get(mantaPath + options.key, function(err, value) {
        cb(null, !err);
    });
}

module.exports = MantaBlobStore;
