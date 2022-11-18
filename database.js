const mongoose = require('mongoose');
require('dotenv/config');

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        // Database
        mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'pelo-DB'

        })
        .then(() => {
            console.log('Database is Connection is ready...')
        }).catch((err)=> {
            console.log(err)
        })
    }

}

module.exports = new Database()