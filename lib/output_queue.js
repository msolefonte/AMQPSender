const shortid = require('shortid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {existsSync, writeFileSync} = require('fs');


class OutputQueue {
    /**
     * Given a file_path where database is allocated, initializes this one.
     *
     * If there is no database file, file is created.
     *
     * @param file_path {String} - Path of the file where database.json is allocated.
     * @throws Fail creating the file
     */
    constructor(file_path) {
        if (!existsSync(file_path)) {
            writeFileSync(file_path, '{}', {flags: 'w+'})
        }
        const adapter = new FileSync(file_path);
        this.db = low(adapter);
        this.db.defaults({"messages": []}).write();
    }

    /**
     * Pushes a message into the output queue and returns the insertion id.
     *
     * @param message - {String} - Message that it going to be pushed,
     *  it's meant to be a JSON.
     * @returns {String} - Unique identifier of the insertion.
     */
    push(message) {
        const id = shortid.generate();
        this.db.get('messages')
            .push({
                id: id,
                content: JSON.stringify(message)
            })
            .write();
        return id;
    };

    /**
     * Removes a message from the output queue where id is its unique
     * identifier.
     *
     * @param id - Unique identifier of the message
     */
    delete(id) {
        this.db.get('messages')
            .remove({id})
            .write();
    };

    /**
     * Returns the size of the output queue.
     *
     * @returns {Number} - Size of the output queue
     */
    size() {
        return this.db.get('messages').size();
    };

    /**
     * Returns the first message of the output queue or undefined.
     *
     * @returns {String} - First message of the output queue, it is
     *  meant to be a JSON.
     */
    head() {
        if (this.size() > 0) {
            return this.db.get('messages').value()[0];
        } else {
            return undefined
        }
    };
}

module.exports = OutputQueue;