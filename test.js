var tape = require('tape'),
    tests = require('abstract-blob-store/tests'),
    MantaBlobStore = require('./'),
    manta = require('manta'),
    fs = require('fs');

var client = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'utf8'),
        keyId: process.env.MANTA_KEY_ID,
        user: process.env.MANTA_USER
    }),
    user: process.env.MANTA_USER,
    url: process.env.MANTA_URL
});

var options = {
    client: client
}

var common = {
    setup: function(t, cb) {
        //Create a manta client 
        var mantaBlobStore = new MantaBlobStore(options);

        cb(null, mantaBlobStore);
    },
    teardown: function(t, store, blob, cb) {

        if (blob) {
            store.remove(blob, cb);
        } else {
            cb();
        }
    }
}

tests(tape, common)
