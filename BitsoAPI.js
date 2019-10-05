const crypto = require("crypto");
const https = require("axios");
const buildQueryString = require('build-query-string');

class BitsoAPI {
    constructor(BITSO_API_KEY, BITSO_API_SECRET, BASE_URL, URL_PREFIX="") {
     this.BITSO_API_KEY = BITSO_API_KEY;
     this.BITSO_API_SECRET = BITSO_API_SECRET;
     this.BASE_URL = BASE_URL;
     this.URL_PREFIX = URL_PREFIX;
    }
    async getBalances() {
        return this.privateRequest("GET", "/balance");
    }
    async withdrawCrypto(currency, amount, address, max_fee=null, destination_tag=null) {
        const withdrawalPayload = {
            currency,
            amount,
            address,
            max_fee,
            destination_tag
        }
        return this.privateRequest("POST", "/crypto_withdrawal", withdrawalPayload);
    }

    async placeOrder(book, side, amount, type) {
        const orderPayload = {
            book,
            side,
            type,
            major: amount
        }
        return this.privateRequest("POST", "/orders", orderPayload);
    }
    async placeSellOrder(book, amount, type="market") {
        return this.placeOrder(book, "sell", amount, type);
    }
    /*
    */
    async placeBuyOrder(book, amount, type="market") {
        return this.placeOrder(book, "buy", amount, type);
    }

    async privateRequest(method, url, payload="", params = null){
        let options = {};
        options.method = method;
        options.url = this.URL_PREFIX+url;
        options.headers = {
            "Content-Type": "application/json"
        };
        options.baseURL = this.BASE_URL;
        if (method == "GET" && params !== null) {
            option.url += buildQueryString(params);
        }
        let nonce = new Date().getTime();
        let stringified_payload = "";
        if (payload !== "") {
            stringified_payload = JSON.stringify(payload)
            options.data = payload;
        }
        let hmac = crypto.createHmac("sha256", this.BITSO_API_SECRET);
        hmac.update(
            `${nonce}${options.method}${options.url}${stringified_payload}`
        );
        let hexed_signature = hmac.digest("hex");
        hmac.end();
        let authorization = `Bitso ${this.BITSO_API_KEY}:${nonce}:${hexed_signature}`;
        options.headers.Authorization = authorization;
        let req = await https.request(options);
        if (req.data) return req.data;
        else return (ctx.body = "ERROR");
    }
    async publicRequest(method, url, params){
        options.method = method;
        options.url = this.URL_PREFIX+url;
        options.baseURL = this.BASE_URL;
        if (method == "GET" && params !== null) {
            option.url += buildQueryString(params);
        }
        let req = await https.request(options);
        if (req.data) return req.data;
        else return (ctx.body = "ERROR");
    }
}
module.exports = BitsoAPI;