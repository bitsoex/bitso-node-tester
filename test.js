const bitso = require("./BitsoAPI");
const chalk = require("chalk");
const BITSO_URL = process.env.BITSO_URL;
const BITSO_API_KEY = process.env.BITSO_API_KEY;
const BITSO_API_SECRET = process.env.BITSO_API_SECRET;

const bitsoAPI = new bitso(
    BITSO_API_KEY,
    BITSO_API_SECRET,
    BITSO_URL,
    "/api/v3"
);

function displayError(Exception) {
    console.log(chalk.red("[FAILED]"));
    if (Exception.response !== undefined) {
        console.log(
            chalk.red(
                `${Exception.response.status} : ${
                    Exception.response.statusText
                } ${JSON.stringify(Exception.response.data)}`
            )
        );
    } else {
        console.log(Exception);
    }
}
function checkIfSuccessful(test, data) {
    if (data !== undefined && data.success) {
        console.log(chalk.green(`${test} TEST ✓`));
    } else {
        console.log(chalk.red(`${test} TEST X`));
        console.log(chalk.red(JSON.stringify(data)));
    }
    return data.success;
}
async function testBalances() {
    preTestingMessage("BALANCES");
    try {
        let response = await bitsoAPI.getBalances();
        if (checkIfSuccessful("BALANCES", response)) return response.payload;
    } catch (Exception) {
        displayError(Exception);
    }
}
async function testWithdrawals(currency, amount, address) {
    preTestingMessage("WITHDRAWALS", currency, amount, address);
    try {
        let response = await bitsoAPI.withdrawCrypto(currency, amount, address);
        if (checkIfSuccessful("WITHDRAWALS", response)) return response.payload;
    } catch (Exception) {
        displayError(Exception);
    }
}
async function testOrders(book, side, amount, type) {
    preTestingMessage("ORDERS", book, side, amount, type);
    try {
        let response = await bitsoAPI.placeOrder(book, side, amount, type);
        if (checkIfSuccessful("ORDERS", response)) return response.payload;
    } catch (Exception) {
        displayError(Exception);
    }
}
async function testAvailableBooks() {
    preTestingMessage("AVAILABLE BOOKS");
    try {
        let response = await bitsoAPI.getAvailableBooks();
        if (checkIfSuccessful("AVAILABLE BOOKS", response))
            return response.payload;
    } catch (Exception) {
        displayError(Exception);
    }
}

async function testTicker(book) {
    preTestingMessage("TICKER", book);
    try {
        let response = await bitsoAPI.getCurrentTicker(book);
        if (checkIfSuccessful("TICKER", response)) return response.payload;
    } catch (Exception) {
        displayError(Exception);
    }
}

function preTestingMessage(test, ...rest) {
    console.log(chalk.blue(`TESTING ${test} ENDPOINT`));
    console.log(chalk.blue(`USING PARAMETERS: ${rest}`));
}

// Simply tests the functions no actual integrity checks
async function basicTesting() {
    console.log(chalk.white("INITIALIZING BASIC TESTING"));
    await testAvailableBooks();
    await testTicker("btc_mxn");
    await testOrders("eth_mxn", "buy", "1.0", "market");
    await testOrders("eth_mxn", "sell", "1.0", "market");
    await testWithdrawals("btc", "0.001", "15YB8xZ4GhHCHRZXvgmSFAzEiDosbkDyoo");
    await testBalances();
}

basicTesting();
