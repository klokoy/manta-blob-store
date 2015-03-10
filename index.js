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
    var fullKey = path.join(mantaPath, options.key);

    return this.client.createReadStream(fullKey);
}

MantaBlobStore.prototype.createWriteStream = function(opts, cb) {
    var self = this;

    var options = prepOpts(opts);
    var dirname = path.dirname(options.key);
    var passthrough = new PassThrough;
    var fullDirname = path.join(mantaPath, dirname);

    self.client.mkdirp(fullDirname, function(err) {

        var fullKey = path.join(mantaPath, options.key);        
        var stream = self.client.createWriteStream(fullKey);

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
    var fullKey = path.join(mantaPath, options.key);

    this.client.unlink(fullKey, cb);
}

MantaBlobStore.prototype.exists = function(opts, cb) {
    var options = prepOpts(opts);
    var fullKey = path.join(mantaPath, options.key);

    this.client.get(fullKey, function(err, value) {
        cb(null, !err);
    });
}

module.exports = MantaBlobStore;
