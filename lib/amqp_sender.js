#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const OutputQueue = require('./output_queue');

function _sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

class AMQPSender {
    /**
     * This constructor requires all the basic arguments to connect to an
     * AMQP Server, to set the logger and the exchange, the queue and the
     * routing_key that are declared and bind.
     *
     * The queue_path is the path to a the JSON file where messages are
     * stored locally.
     *
     * The default connection parameters and the ones required to connect
     * to a default RabbitMQ Server in localhost for use in development.
     *
     * @param {String} exchange
     * @param {String} queue
     * @param {String} routing_key
     * @param {String} queue_path - Path of the JSON file where the
     *  messages are stored locally.
     *
     * @param {String} [url=undefined] - AMQP Server URL to connect to
     * @param {logger} [logger=undefined] - Winston logger to use
     */
    constructor(exchange, queue, routing_key, queue_path, url = undefined, logger = undefined) {
        this.exchange = exchange;
        this.queue = queue;
        this.routing_key = routing_key;

        this.output_queue = new OutputQueue(queue_path);

        this.url = url || AMQPSender.obtain_url();

        this.logger = logger;
        this.logger_enabled = typeof(logger) !== 'undefined';

        this.sending_messages = false;
    }

    /**
     * Obtains a valid AMQP url using connection parameters.
     *
     * The default connection parameters and the ones required to connect
     * to a default RabbitMQ Server in localhost for use in development.
     *
     * @param {String} [user=guest]
     * @param {String} [password=guest]
     * @param {String} [host=localhost]
     * @param {String} [port=5672]
     * @param {String} [connection_attempts=3]
     * @param {String} [heartbeat_interval=3600]
     */
    static obtain_url(user = 'guest', password = 'guest',
                      host = 'localhost', port = '5672', connection_attempts = '3',
                      heartbeat_interval = '3600') {
        return 'amqp://' + user + ':' + password + '@' + host + ':' +
            port + '/%2F?connection_attempts=' + connection_attempts +
            '&heartbeat_interval=' + heartbeat_interval;
    }

    /**
     * Sends a message to the logger if it is set.
     *
     * @param {String} level
     * @param {String} message
     * @private
     */
    _log(level, message) {
        if (this.logger_enabled) {
            this.logger.log(level, message)
        }
    }

    /**
     * Connects to an AMQP Server, sends the message and waits for an ACK. The
     * connection is closed once it is not required.
     *
     * The function waits to receive the server ACK. If the ACK is received
     * and it is valid, the message is deleted from the output queue and tries
     * to send the rest of pending messages.
     *
     * @param {Object} message - Message to send, it is going to be stringified
     * @param {String} message_id - Unique identifier of the message
     * @private
     */
    _send_message(message, message_id) {
        return new Promise((resolve, reject) => {
            this._log('info', 'Connecting to ' + this.url);

            amqp.connect(this.url, (error, connection) => {
                if (error != null) {
                    this._log('warn', 'Connection attempt failed: ' + error.code);
                    reject('Connection attempt failed: ' + error.code);
                } else {
                    this._log('info', 'Connection opened');
                    this._log('info', 'Creating a new channel');
                    connection.createConfirmChannel((error, channel) => {
                        if (error != null) {
                            this._log('error', 'Channel creation attempt failed: ' + error.code);
                            reject('Channel creation attempt failed: ' + error.code);
                        } else {
                            this._log('info', 'Channel opened');

                            this._log('info', 'Declaring exchange ' + this.exchange);
                            channel.assertExchange(this.exchange, 'direct');
                            this._log('info', 'Exchange declared');

                            channel.assertQueue(this.queue, {durable: true});
                            channel.publish(this.exchange, this.routing_key, new Buffer(message), {
                                    contentType: 'application/json'
                                },
                                (error) => {
                                    if (error == null) {
                                        this._log('info', 'Message acknowledged');
                                        this.output_queue.delete(message_id);
                                        this._log('info', 'Message deleted from output queue');
                                        resolve('Message acknowledged')
                                    } else {
                                        console.warn('Message refused');
                                        reject('Message refused or not acknowledged');
                                    }
                                    this._log('info', 'Closing connection');
                                    connection.close();
                                    this._log('info', 'Connection closed');
                                }
                            );
                            this._log('info', 'Message sent');
                        }
                    });
                }
            });
        });
    }

    /**
     * Stores the message on the output queue and tries to send it.
     *
     * If this is one is empty, message is sent. Else, messages are sent
     * in order.
     *
     * @param {String} message - Message to send, it is meant to be a JSON
     */
    send_message(message) {
        return new Promise((resolve, reject) => {
            this.output_queue.push(message);
            this._log('info', 'New message added to output queue');
            this.send_pending_messages()
                .then(() => {
                    resolve('Message sent correctly');
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    };

    /**
     * Tries to send messages from the output queue in order.
     *
     * The algorithm is to send the first one, and, if it is received
     * an ACK by the server, this one is deleted from the output queue
     * and the next one is sent.
     */
     send_pending_messages() {
        return new Promise(async (resolve, reject) => {
            while (this.sending_messages) {
                await _sleep(100);
            }
            this.sending_messages = true;
            this._log('info', 'Looking for pending messages in output queue');
            if (this.output_queue.size() > 0) {
                this._log('info', 'There are messages in output queue');
                const first_message = this.output_queue.head();
                if (typeof first_message !== 'undefined') {
                    this._send_message(first_message.content, first_message.id)
                        .then(() => {
                            this.send_pending_messages()
                                .then((val) => {
                                    resolve(val);
                                })
                                .catch((reason) => {
                                    reject(reason);
                                });
                        })
                        .catch((reason) => {
                            reject(reason);
                        });
                } else {
                    resolve('There are no messages left in the output queue');
                }
            } else {
                resolve('There are no messages left in the output queue');
            }
            this.sending_messages = false;
        })
    };
}

module.exports = AMQPSender;
