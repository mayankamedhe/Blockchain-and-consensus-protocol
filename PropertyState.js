const crypto = require("crypto");

function hash(input)
{
    return crypto.createHash('sha512').update(input).digest('hex').toLowerCase().substring(0, 64);
}

const PROPERTY_FAMILY = 'PropertySalesAgreement';
const PROPERTY_NAMESPACE = hash(PROPERTY_FAMILY).substring(0, 6);

function makePropertyAddress(input)
{
    var address = PROPERTY_NAMESPACE.toString() + hash(input); //+ timestamp.substring(timestamp.length - 10, timestamp.length);
    return address;
}

module.exports = {
    PROPERTY_NAMESPACE,
    PROPERTY_FAMILY,
    makePropertyAddress
}