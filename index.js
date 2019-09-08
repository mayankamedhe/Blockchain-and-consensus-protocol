const { TransactionProcessor } = require('sawtooth-sdk/processor');
const PropertyHandler = require('./PropertyHandler.js');

// Using docker for development, so the address is the container (localhost) with port 4004
const address = 'tcp://127.0.0.1:4004';
const transactionProcessor = new TransactionProcessor(address);

transactionProcessor.addHandler(new PropertyHandler());

transactionProcessor.start();