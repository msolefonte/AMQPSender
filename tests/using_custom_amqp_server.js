// Send a JSON to a custom AMQP Server

const AMQPSender = require('../index');

// Defining variables
const exchange = "1";
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

// Defining the custom AMQP Connection
const user = 'user';
const password = 'password';
const host = '192.168.1.50';
const port = '5672';
const connection_attempts = '5';
const heartbeat_interval = '5400';

// Defining the AMQP Server URL
const amqp_server = AMQPSender.obtain_url(user, password, host, port,
    connection_attempts, heartbeat_interval);


// Defining the sender
const sender = new AMQPSender(exchange, queue, routing_key, queue_path, amqp_server);

// Sending the message
// This is going to fail because the defined server does not exists and the sender
// it's going to try to reconnect eternally.

// Be careful about defining incorrect AMQP Servers
sender.send_message(json_message)
    .then(() => {
        console.log('YO');
    })
    .catch((reason) => {
        console.warn(reason)
    });

