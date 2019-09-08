const { TransactionHandler } = require('sawtooth-sdk/processor/handler');

const PropertyPayload = require('./PropertyPayload.js');
const { PROPERTY_NAMESPACE, PROPERTY_FAMILY, makePropertyAddress } = require('./PropertyState.js');

var addressHistory = [];
const MAX_HISTORY = 10;

class PropertyHandler extends TransactionHandler
{
    constructor ()
    {
        super(PROPERTY_FAMILY, ['1.0'], [PROPERTY_NAMESPACE]);
    }
    
    apply (transactionProcessRequest, context)
    {
        let payload = PropertyPayload.deserialize(transactionProcessRequest.payload);
        
        context.addEvent(PROPERTY_FAMILY + "/" + "saleCreated");
        
        let header = transactionProcessRequest.header;
        let player = header.signerPublicKey;
        
        let address = payload.address;


        if (addressHistory.includes(address) == true)
        {
            let buffer = payload.serialize();
            context.setState({ [address]: buffer });//.then(() => console.log("Transaction set!")).catch((error) => console.log("Error: " + error));
            return;
        }
        else
        {
            console.log("Transaction hasn't been committed before, adding to history");

            if (addressHistory.length == MAX_HISTORY)
            {
                addressHistory.push(address);
                addressHistory.shift();
            }
            else
            {
                addressHistory.push(address);
            }

            console.log("History: " + addressHistory);
        }

        console.log("Request received: " + payload);
        let buffer = payload.serialize();

        context.setState({ [address]: buffer }).then(() => console.log("Transaction set!")).catch((error) => console.log("Error: " + error));
    }
}

module.exports = PropertyHandler