const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const password = "azerty";

const salt = uid2(16);
const hash = SHA256(password + salt).toString(encBase64);
const token = uid2(16);

console.log(hash);
