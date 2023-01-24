const db = require("../../db");
const Users = db.User;
const Legendary = db.Legendary;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
var ObjectId = require("mongodb").ObjectID;

exports.create = (req, res) => {
    const user = new Users({
        address: req.body.address,
        username: req.body.username,
        pernum: "",
        // avatar: req.body.avatar,
        verified: false,
        password: req.body.password,
        sponsorName: req.body.sponsorName,
        sponsorAddress: req.body.sponsorAddress,
    })

    Users.find({ address: req.body.address })
        .then((docs) => {
            // console.log("[Create user] docs = ", docs);
            if (docs.length > 0) {
                return res.send({ code: 1 });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return res.status(501).send({ success: false, message: "Cannot create the new user." });
                    }
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) {
                            return res.status(501).send({ success: false, message: "Cannot create the new user." });
                        } else {
                            user.password = hash;
                            user.save((err, docs) => {
                                if (!err){
                                    const jwtToken = jwt.sign({
                                        id: docs._id,
                                        isAdmin: (docs.address === admin_address.toLowerCase()) ? 1 : 0,
                                        ...docs
                                    }, jwt_enc_key, { expiresIn: signIn_break_timeout });
                                    return res.status(200).send({
                                        success: true,
                                        token: jwtToken,
                                        message: "Successfully create a new new user."
                                    });
                                }
                                else
                                    return res.status(501).send({ success: false, message: "Cannot create the new user." });
                            })
                        }
                    })
                })
            }
        })
        .catch((err) => {
            return res.status(501).send({ success: false, message: "Internal server error." });
        })
}

exports.info = (req, res) => {
    Users.findOne({
        // find the user whose 'address' field is equal to the 'address' field of the request body
        address: req.body.address.toLowerCase()
    }, (err, docs) => {
        if (err) {
            return res.status(500).send({ success: false, message: "Internal server error." });
        }
        if (docs === undefined || docs === null) {
            return res.status(404).send({ success: false, message: "Unregistered." });
        }
        return res.status(200).send({ success: true, user: docs });
    })
}

exports.getAllUsers = (req, res) => {
    Users.find({}, (err, docs) => {
        if (err) {
            return res.status(500).send({ success: false, message: "Internal server error." });
        }
        return res.status(200).send({ success: true, users: docs, length: docs.length });
    })
}

exports.login = (req, res) => {
    Users.findOne({
        address: {
            $regex: new RegExp(req.body.address, "i")
        }
    }, (err, docs) => {
        if (err) {
            return res.status(500).send({ success: false, message: "Internal server error." });
        }
        if (docs === undefined || docs === null) {
            return res.status(404).send({ success: false, message: "Unregistered." });
        }
        if (docs.password === undefined || docs.username !== req.body.username) {
            return res.status(404).send({ success: false, message: "Account info is not correct!" });
        } else {
            const jwtToken = jwt.sign({
                id: docs._id,
                isAdmin: (docs.address === admin_address) ? 1 : 0,
                ...docs
            }, jwt_enc_key, { expiresIn: signIn_break_timeout });
            // console.log("jwtToken:", jwtToken);
            return res.status(200).send({ success: true, token: jwtToken });
        }
    })
}

exports.simpleLogin = (req, res) => {
    Users.findOne({
        address: {
            $regex: new RegExp(req.body.address, "i")
        }
    }, (err, docs) => {
        if (err) {
            return res.status(500).send({ success: false, message: "Internal server error." });
        }
        if (docs === undefined || docs === null) {
            return res.status(404).send({ susccess: false, message: "Unregistered." });
        }
        // if (docs.password === undefined || docs.username !== req.body.username) {
        //     return res.status(404).send({ success: false, message: "Account info is not correct!" });
        // }
        else {
            const userId = docs._id;
            Legendary.findOne({
                winnerId: userId,
                isSold: 0
            }, (err, itemDocs) => {
                // console.log("SimpleLogin itemDocs=", itemDocs);
                const jwtToken = jwt.sign({
                    id: userId,
                    isAdmin: (docs.address === admin_address) ? 1 : 0,
                    ...docs,
                    item: itemDocs ? itemDocs : null
                }, jwt_enc_key, { expiresIn: signIn_break_timeout });
                // console.log("jwtToken:", jwtToken);
                return res.status(200).send({ success: true, token: jwtToken });
            })
        }
    })
}

exports.checkUsername = (req, res) => {
    const { username } = req.body;
    Users.findOne({
        username
    }, (err, docs) => {
        if(err) {
            return res.status(200).send({success: false, message: "Username duplicated!"});
        } else if( docs === undefined || docs === null) {
            return res.status(200).send({success: true, message: "Available username"});
        }
        return res.status(200).send({success: false, message: "Username duplicated!"});
    })
}

exports.getDownline = (req, res) => {
    const { addresses } = req.body;
    const queryItemAry = [];
    for(let i = 0;i<addresses.length;i++) {
        queryItemAry.push({address: addresses[i]});
    }
    const query = {
        $or: queryItemAry
    }

    Users.find(query).then(async (data) => {
        return res.status(200).send({success: true, data});
    }).catch((err) => {
        return res.status(500).send({success: false, message: "Internal Server Error"});
    })
}

exports.updatePerNum = (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            success: false,
            message: "Update data cannot be empty!"
        })
    }
    Users.findByIdAndUpdate(
        req.body.id,
        {
            pernum: req.body.pernum
        }, { useFindAndModify: false }
    ).then((data) => {
        if(!data) {
            return res.status(404).send({
                success: false,
                message: "Cannot add PerNum to the user."
            });
        } else {
            return res.status(200).send({
                success:true,
                message: "Added Pernum successfully!"
            });
        }
    }).catch((err) => {
        return res.status(500).send({
            success: false,
            message: "Error updating user"
        });
    });
}

exports.updateMailAddress = (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            success: false,
            message: "Update data cannot be empty!"
        })
    }
    Users.findByIdAndUpdate(
        req.body.id,
        {
            mail: req.body.mail
        }, { useFindAndModify: false }
    ).then((data) => {
        if(!data) {
            return res.status(404).send({
                success: false,
                message: "Cannot add email info to the user."
            });
        } else {
            return res.status(200).send({
                success:true,
                message: "Added Email address successfully!"
            });
        }
    }).catch((err) => {
        return res.status(500).send({
            success: false,
            message: "Error updating user"
        });
    });
}

exports.updateYEMBalance = (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            success: false,
            message: "Update data cannot be empty!"
        })
    }
    Users.findOneAndUpdate(
        {username: req.body.username},
        {
            yem: req.body.yem
        }, { useFindAndModify: false }
    ).then((data) => {
        if(!data) {
            return res.status(404).send({
                success: false,
                message: "Cannot add yem info to the user."
            });
        } else {
            return res.status(200).send({
                success:true,
                message: "Updated YEM balance successfully!"
            });
        }
    }).catch((err) => {
        return res.status(500).send({
            success: false,
            message: "Error updating user"
        });
    });
}

exports.getNumberOfUsers = (req, res) => {
    Users.find().count().then(data => {
        return res.status(200).send({ success: true, numberOfUsers: data});
    }).catch(err => {
        return res.status(501).send({ success: false, message: "Internal Server Error!"});
    })
}

exports.getUserBalance = (req, res) => {
    const { username } = req.body;
    console.log("username = ", username);
    Users.findOne({username}, (err, doc) => {
        console.log("getUserBalance err = ", err);
        console.log("getUserBalance docs = ", doc);
        if(err)
            return res.status(200).send({ success: false, message: "Internal Server Error!"});
        if (doc === undefined || doc === null) {
            return res.status(200).send({ success: true, balance: -1})
        } else {
            return res.status(200).send({ success: true, balance: doc.yem });
        }
    })
}