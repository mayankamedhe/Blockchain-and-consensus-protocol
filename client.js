const request = require('request')

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing');
const { protobuf } = require('sawtooth-sdk')

const PropertyPayload = require('./PropertyPayload.js');
const { PROPERTY_NAMESPACE, PROPERTY_FAMILY, makePropertyAddress } = require('./PropertyState.js');

const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
const signer = (new CryptoFactory(context)).newSigner(privateKey);

const {createHash} = require('crypto')

var buyer = process.argv[2] || "hello";
var seller = process.argv[3] || "world";
var houseID = process.argv.slice(4).join(" ") || "123";
var sale = new PropertyPayload(buyer, seller, houseID);
var address = sale.generateAddress();

console.log(sale.toString());
var payloadBytes = sale.serialize();

var transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: PROPERTY_FAMILY,
    familyVersion: '1.0',
    inputs: [ address ],
    outputs: [ address ],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
}).finish();

var transactionHeaderSignature = signer.sign(transactionHeaderBytes);

var transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
});

const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: [ transactionHeaderSignature ]
}).finish();

const batchHeaderSignature = signer.sign(batchHeaderBytes);

const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: [ transaction ]
});

const batchListBytes = protobuf.BatchList.encode({
    batches: [ batch ]
}).finish();

console.log("Sending post request...");

request.post({
    url: "http://localhost:8008/batches",
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
}, (err, response) => {
    if (err) return console.log(err)
    console.log(response.body)
})