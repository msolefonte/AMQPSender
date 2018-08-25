// Send multiple JSON to a default RabbitMQ Server

const AMQPSender = require('../index');

// Defining variables
const exchange = "hello";
const queue = "message";
const routing_key = "hello";
const queue_path = 'output_queue.json';


// Defining the sender
const sender = new AMQPSender(exchange, queue, routing_key, queue_path);

// Sending 10 messages
const times = 10;
for(let i=0; i < times; i++) {
    sender.send_message(
        {
            "text": "sometext",
            "number": i,
            "json": {
                "text": "moretext"
            }
        }
    )
        .then((val) => {
            console.log(val);
        })
        .catch((reason) => {
            console.warn(reason)
        });
}
