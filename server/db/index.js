const dbConfig = require('./config');
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.User = require("./users.model")(mongoose);
db.Legendary = require("./legendaries.model")(mongoose);
db.Numbers = require("./numbers.model")(mongoose);



module.exports = db;