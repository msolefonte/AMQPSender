// Send a JSON message using a Winston logger
// IMPORTANT!! You need to install winston to execute this example.

const AMQPSender = require('amqp-sender');
const { createLogger, format, transports } = require('winston');

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

// Defining the logger
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console({
            level: 'info',
            colorize: true
        })
    ]
});


// Defining the sender setting the logger
const sender = new AMQPSender(exchange, queue, routing_key, queue_path, undefined, logger);

// Sending the message
sender.send_message(json_message);