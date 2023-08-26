const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(`${process.env.DB_HOST}${process.env.Mongodb_DB}`).then( () => {
    console.log("Connection Successfull...");
}).catch( (err) => {
    console.log("Connection Failed...");
});


// mongoose.connect({
//     host: process.env.DB_HOST,
//     username: "root",
//     mongodb: process.env.Mongodb_DB,
//     password: ""
// }).then( () => {
//     console.log("Connection Successfull...");
// }).catch( (err) => {
//     console.log("Connection Failed...");
// });