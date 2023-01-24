const express = require('express');

// Yourmey
const users = require("./users");
const legendaries = require("./legendaries");

const checkAuthentication = require('./private_router');

const router = express.Router();


router.use('/users', checkAuthentication, users);
router.use('/legendaries', checkAuthentication, legendaries);


module.exports = router;