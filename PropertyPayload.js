const { PROPERTY_NAMESPACE, PROPERTY_FAMILY, makePropertyAddress } = require('./PropertyState.js');

class PropertyPayload
{
    constructor(buyer, seller, houseID, address)
    {
        this.buyer = buyer;
        this.seller = seller;
        this.houseID = houseID;

        this.address = address;
    }

    serialize()
    {
        return Buffer.from(this.toString());
    }

    toString()
    {
        return JSON.stringify(this);
    }

    generateAddress()
    {
        console.log("Making new address...");
        this.address = makePropertyAddress(this.toString());
        return this.address;
    }

    static deserialize(payload)
    {
        var sale = JSON.parse(payload.toString());

        if (sale.buyer === undefined)
        {
            throw "Payload error, no buyer!";
        }
        else if (sale.seller === undefined)
        {
            throw "Payload error, no seller!";
        }
        else if (sale.houseID === undefined)
        {
            throw "Payload error, no houseID!";
        }

        return new PropertyPayload(sale.buyer, sale.seller, sale.houseID, sale.address);
    }
}

module.exports = PropertyPayload;