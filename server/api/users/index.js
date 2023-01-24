const express = require('express');
const router = express.Router();
const users = require("./controller");

router.post("/create", users.create);
router.post("/info", users.info);
router.post("/login", users.login);
router.post("/simple_login", users.simpleLogin);
router.post("/getdownlines", users.getDownline);
router.post("/updatePerNum", users.updatePerNum);
router.post("/updateMailAddress", users.updateMailAddress);
router.post("/checkUsername", users.checkUsername);
router.get("/getNumberOfUsers", users.getNumberOfUsers);
router.get("/all", users.getAllUsers);
router.post("/getUserBalance", users.getUserBalance);
router.post("/updateYEMBalance", users.updateYEMBalance);

router.get("/test", (req, res) => {
    console.log("users/test")
    res.status(200).send("ok")
})

module.exports = router;