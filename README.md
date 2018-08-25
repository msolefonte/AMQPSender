# AMQPSender 1.1.0 library for Node.js

AMQPSender is a library that allows developers to send AMQP messages with persistence transparently.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing 
purposes. See deployment for notes on how to deploy the project on a live system.

### Dependences

AMQPSender requires the packages:
- [amqplib](https://github.com/squaremo/amqp.node) - To interact with the AMQP Server
- [lowdb](https://github.com/typicode/lowdb) - To store the messages locally
- [shortid](https://github.com/dylang/shortid) - To identify the stored messages

[Optional]
- [winston](https://github.com/winstonjs/winston) - To add a log to AMQPServer. By default there is no log


### Installing

If you already have Node.js and npm on your system you can install the library simply by downloading the distribution, 
unpack it and install in the usual fashion:

```
npm install amqp-sender
```

## Usage

The recommended way to use `amqp-sender` is to create your own sender. You can send messages and you should try to send 
pending messages periodically.

```js
const AMQPSender = require('amqp-sender');
const sender = new AMQPSender('foo', 'bar', 'foo.bar.*', './output_queue.json');

sender.send_message({
    "from": "mike",
    "to": "jessie",
    "content": "How are you?",
    "date": 1535214220074
})
    .then((message) => {
        // Message sent correctly
        console.log(message);
    })
    .catch((reason) => {
        // Fail sending the message
        console.warn(reason);
    });
```

## Running the tests

If you want to execute tests to try AMQPSender you have the folder ./tests/ which includes four tests:
 * [send_json_default.js](tests/send_json_default.js) - Example of sending a JSON to a default RabbitMQ Server
 * [send_multiple_jsons.js](tests/send_multiple_jsons.js) - Example of sending multiple JSONs
 * [using_custom_amqp.js](tests/using_custom_amqp_server.js) - Example of sending a JSON to a custom AMQP Server
 * [using_logger.js](tests/using_logger.js) - Example of sending a JSON logging using a Winston logger
 
IMPORTANT!! To test using_logger.js you have to install Winston which is not a dependence by default.

## Authors

* **Marc Solé Fonte** - *Initial work* - [WolfyLPDC](https://github.com/WolfyLPDC/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks to the authors and contributors of [amqplib](https://github.com/squaremo/amqp.node), 
[lowdb](https://github.com/typicode/lowdb) and [shortid](https://github.com/dylang/shortid) 
* Thanks to all the people that have helped or supported me during this development

## Changelog

- 1.0 - 24/08/2018 - Initial release.
- 1.1 - 27/08/2018 - Now, methods of the API send_message() and send_pending_messages() implement a Promise