var fs = require('fs'),
    manta = require('manta'),
    path = require('path'),
    MantaBlobStore = require('./');

//Create a manta client with credentials from your environment variables as described here:
// https://apidocs.joyent.com/manta/nodesdk.html#creating-a-client
var client = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'utf8'),
        keyId: process.env.MANTA_KEY_ID,
        user: process.env.MANTA_USER
    }),
    user: process.env.MANTA_USER,
    url: process.env.MANTA_URL
});

//create a manta-blob-store with the client as a parameter
var store = new MantaBlobStore({
    client: client
});

//create a write stream on the store
var ws = store.createWriteStream({
    key: 'newFolder/a/b/c/d/file.txt'
}, function() {

    //Create a read stream from the store
    var rs = store.createReadStream({
        key: 'file.txt'
    })

    //pipe the stream from manta to stdout
    rs.pipe(process.stdout)
});

//Pipe some text to the write stream
ws.end('hello world\n');
