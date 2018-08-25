// Send a JSON to a default RabbitMQ Server

const AMQPSender = require('../index');

// Defining variables
const exchange = "me";
const queue = "message";
const routing_key = "hello";
const queue_path = 'output_queue.json';


const json_message = {
    "text": "sometext",
    "number": 12,
    "json": {
        "text": "moretext"
    }
};


// Defining the sender
const sender = new AMQPSender(exchange, queue, routing_key, queue_path);

// Sending the message
sender.send_message(json_message)
    .then((val) => {
        console.log(val);
    })
    .catch((reason) => {
        console.warn(reason);
    });
