require("file-loader?name=../index.html!../index.html");
const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

var alice;
var bob;
var carol;

window.addEventListener('load', function() {
    $("#send").click(sendCoin);
    $("#kill").click(killSplitter);
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#splitterBalance").html("N/A");
                $("#aliceBalance").html("N/A");
                $("#bobBalance").html("N/A");
                $("#carolBalance").html("N/A");
                throw new Error("No account with which to transact");
            }
            alice = accounts[0];
            bob = accounts[1];
            carol = accounts[2];
            balanceUpdater();
        })
        .catch(console.error);
});

var balanceUpdater = function() {
    Splitter.deployed()
    .then (_deployed => {
        deployed = _deployed;
        return deployed.getSplitterBalance({from: alice});
    })
    .then(function (tx) {
        $("#splitterBalance").html(tx["c"][0]);
    })
    .catch(console.error);

    web3.eth.getBalancePromise(alice)
        .then(balance => {$("#aliceBalance").html(balance.toString(10));});
    web3.eth.getBalancePromise(bob)
        .then(balance => {$("#bobBalance").html(balance.toString(10));});
    web3.eth.getBalancePromise(carol)
        .then(balance => {$("#carolBalance").html(balance.toString(10));});

}

const sendCoin = function() {
    let deployed;
    return Splitter.deployed()
        .then(_deployed => {
        	deployed = _deployed;
            var amountInEther = $("input[name='amount']").val();
            var amountInWei = web3.toWei(amountInEther, "ether");
            console.log("split " + amountInEther + " Ether start...");
            // .sendTransaction so that we get the txHash immediately.
            $("#status").html("Loading... ");
            return deployed.split( { from: alice, value: amountInEther } );
	    })
        .then(receipt => {
            if (receipt.logs.length == 0) {
                $("#status").html("ERROR: receipt logs length is zero");
            } else {
                $("#status").html("Transfer was successful");
            }
            balanceUpdater();
        })
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};

const killSplitter = function() {
    let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
            return deployed.kill({from: alice});
        })
        .then(receipt => {
            if (receipt.logs.length == 0) {
                $("#killStatus").html("ERROR: kill receipt logs length is zero");
            } else {
                $("#killStatus").html("Successfully killed");
            }
        })
        .catch(console.error);
}
