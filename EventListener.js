// weather update client in node.js
// connects SUB socket to tcp://localhost:5556
// collects weather updates and finds avg temp in zipcode

const { Message, EventSubscription, ClientEventsSubscribeRequest, ClientEventsSubscribeResponse, EventList } = require("sawtooth-sdk/protobuf")

const { PROPERTY_NAMESPACE, PROPERTY_FAMILY, makePropertyAddress } = require('./PropertyState.js');

var zmq = require('zeromq');

// Socket to talk to server
var socket = zmq.socket('dealer');

function encodeMessage(messageType, correlationId, content)
{ 
    return Message.encode({
        messageType,
        correlationId,
        content
    }).finish();
}

var subscriptionRequest = EventSubscription.create({ "eventType": PROPERTY_FAMILY + "/" + "saleCreated" });
var clientSubscribeRequest = ClientEventsSubscribeRequest.create({ "subscriptions": [subscriptionRequest] });
var encodedRequest = encodeMessage(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST, "123", clientSubscribeRequest);

console.log(clientSubscribeRequest);

socket.connect("tcp://localhost:4004");
socket.send(encodedRequest);

// setTimeout(nextStep, 0);
socket.on("message", nextStep);

var waitingForResponse = true;

function nextStep(rawMessage)
{
    if (waitingForResponse == true)
    {
        console.log(rawMessage);
        var message = Message.decode(rawMessage);
        console.log(message);
        var responseMessage = ClientEventsSubscribeResponse.decode(message.content);
        console.log(responseMessage);
        
        if (message.messageType != Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_RESPONSE)
        {
            console.log("Bad message response");
            return;
        }

        if (responseMessage.status != ClientEventsSubscribeResponse.Status.OK)
        {
            console.log("Subscription failure!");
            return;
        }
        
        waitingForResponse = false;
        return;
    }    

    console.log(rawMessage);
    var message = Message.decode(rawMessage);
    console.log(message);

    if (message.messageType != Message.MessageType.CLIENT_EVENTS)
    {
        console.log("Non-client message arrived!");
        return;
    }

    var eventList = EventList.decode(message.content);
    console.log(eventList);
}


