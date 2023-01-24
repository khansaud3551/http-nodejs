const db = require("../../db");
const Legendary = db.Legendary;
const auctionListData = require("./auctionListData.json");
const mongoose = require("mongoose");
const updateData = require("./updateData.json");
var ObjectId = require("mongodb").ObjectID;

exports.createList = (req, res) => {
  auctionListData.map((auctionItem, index) => {
    const params = {
      name: auctionItem.name,
      dataURL: auctionItem.dataURL,
      description: auctionItem.description,
      tokenId: auctionItem.tokenId,
      isVisible: 1,
    };
    const res = _updateItem(params);
    console.log(`res[${index}] = `, JSON.stringify(res));
  });
  console.log("Created End");
  return res.status(200).send("Created End");
};

exports.updateItem = (req, res) => {
  updateData.map((newItem, index) => {
    const params = newItem;
    _updateItem(params);
  });
  return res.status(200).send("Item updated successfully");
};

const _updateItem = (params) => {
  const item = new Legendary({ ...params });
  Legendary.find({ tokenId: params.tokenId })
    .then(async (docs) => {
      if (docs.length === 0) {
        // create new item
        await item.save();
        console.log("create new item, tokenId=", params.tokenId);
      } else {
        if (!mongoose.Types.ObjectId.isValid(docs[0]._id))
          return { success: false, msg: `No task with id :${docs[0]._id}` };
        // update item
        Legendary.findByIdAndUpdate(
          mongoose.Types.ObjectId(docs[0].id.trim()),
          {
            ...params,
          },
          { useFindAndModify: false }
        )
          .then((data) => {
            // console.log("update item, tokenId=", params.tokenId, "data=", data);
            if (!data) return { success: false };
            return { success: true };
          })
          .catch((err) => {
            // console.log("update item, tokenId=", params.tokenId, "err=", err);
            return { success: false };
          });
      }
      return {
        success: true,
      };
    })
    .catch((err) => {
      return {
        success: false,
        error: err,
      };
    });
};

exports.startAuction = (req, res) => {
  let tokenId = req.body.tokenId;
  const auctionStarted = Math.floor(new Date().getTime() / 1000);
  const auctionPeriod = req.body.auctionPeriod;
  const params = {
    auctionStarted: auctionStarted,
    auctionPeriod: auctionPeriod,
  };

  Legendary.findOneAndUpdate(
    { tokenId
    },
    {
      $set: params,
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      return res.status(200).send({ success: true, data: "Auction started successfully" });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.getList = (req, res) => {
  let query = {};
  Legendary.find(query)
    .sort({ auctionStarted: -1, tokenId: 1 })
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.getItemByTokenID = (req, res) => {
  let tokenId = req.params.tokenId;
  Legendary.findOne({
    tokenId: tokenId,
  })
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.inactive = (req, res) => {
  let query = { auctionStarted: { $eq: 0 } };
  Legendary.find(query)
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.setBid = (req, res) => {
  let itemId = req.body.itemId;
  let userId = req.body.userId;
  let username = req.body.username;
  let price = req.body.price;
  Legendary.findById(itemId)
    .then((data) => {
      let bids = data.bids;
      if ((data.auctionStarted + data.auctionPeriod) * 1000 >= Date.now()) {
        if (bids.length === 0 || bids[bids.length - 1].price < price) {
          bids.push({
            user_id: ObjectId(userId),
            username: username,
            price: price,
            Time: Date.now(),
          });
          Legendary.findByIdAndUpdate(itemId, {
            bids: bids,
            price: price,
            lastPrice: price,
          })
            .then((new_data) => {
              return res.send({ code: 0, data: new_data });
            })
            .catch(() => {
              return res.send({ code: 2, data: [], message: "Update error!" });
            });
        } else {
          return res.send({
            code: 2,
            data: [],
            message: "Price must be higher than prev bid's",
          });
        }
      } else {
        return res.send({ code: 2, data: [], message: "Auction ended!" });
      }
    })
    .catch((error) => {
      return res.send({ code: 1, data: [], message: "find error" });
    });
};

exports.getHotBids = (req, res) => {
  let limit = req.body.limit ? Number(req.body.limit) : 3;
  Legendary.aggregate([
    {
      $unwind: "$bids",
    },
    {
      $group: { _id: "$_id", maxValue: { $max: "$bids.price" } },
    },
    { $sort: { maxValue: -1 } },
    {
      $lookup: {
        from: "legendaries",
        localField: "_id",
        foreignField: "_id",
        as: "info",
      },
    },
  ])
    .limit(limit)
    .then((data) => {
      return res.send({ code: 0, list: data });
    })
    .catch((error) => {
      return res.send({ code: 1, list: [] });
    });
};
