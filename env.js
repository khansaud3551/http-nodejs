const jwt_enc_key = "THIS IS THE AUTH TOKEN ENCTYPTION KEY: YOURMEY";
const admin_address = "0x7dB5cb3d1945B6B2afdf93a6aA48f3698D87f254";
const signIn_break_timeout = 24 * 60 * 60; //24*60*60 equals with 24 hours
const upload_path = "/public/uploads/";
const mainnet_http_RPC = "https://polygon-mainnet.g.alchemy.com/v2/yVcv2MTQpFLvVclugH6QPGKPBsFAZrDg";
const testnet_http_RPC = "https://speedy-nodes-nyc.moralis.io/20cea78632b2835b730fdcf4/polygon/mainnet";

const yourmeyFactoryABI = require("./AffiliateSystemFactory.json");
const yourmeyFactoryAddress = "0x1610661ae407774D7AAb60A45A166B60C85Ec47C";

module.exports = {
    jwt_enc_key,
    admin_address,
    signIn_break_timeout,
    upload_path,
    mainnet_http_RPC,
    testnet_http_RPC,
    yourmeyFactoryABI,
    yourmeyFactoryAddress,
};