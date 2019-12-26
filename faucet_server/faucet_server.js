var express = require('express');
var app = express();

var Web3 = require('web3');
var web3 = new Web3();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: "Faucet",
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(8080);

connection.connect((err) => {
    if (err) {
        console.log(err);

    } else {
        console.log('connected as id ' + connection.threadId);
    }
});

app.get('/', (req, res) => {
    console.log("Requested");
    const gethUrl = "http://<IPアドレス>:8545"; //接続するEthereumClient
    const senderAddress = "<作成したアカウントのアドレス>";　//通貨の送金元のアドレス
    var userAddress = req.query.userAddress; //送金先のアドレス
    const amount = 1 * 10 ** 18;  //送金額

    try {
        web3.setProvider(new web3.providers.HttpProvider(gethUrl));
    } catch (err) {
        res.send('{"message":"Can not connect Ethereum Client"}');
        console.log(err);
        return;
    }

    connection.query("select * from user where address =" + "\"" + `${userAddress}` + "\";", (err, results) => {
        if (err) {
            console.log(err);
            return;
        }

        if (results.length != 0) {

            var last_access = results[0];
            if (checkEnoughtTime(last_access.last_used_at)) {

                try {
                    giveEther(senderAddress, userAddress, amount, res);
                    connection.query("update user set last_used_at = now() where id = " + `${last_access.id};`);
                } catch (err) {
                    console.log(err);
                    res.send(`{"message":"${err}"}`);
                }

            } else {
                res.send('{"message":"You can get ether once an hour!"}');
            }

        } else {
            try {
                giveEther(senderAddress, userAddress, amount, res);
                connection.query(`insert into user (address, last_used_at) value ("${userAddress}", now());`);
            } catch (err) {
                console.log(err);
                res.send(`{"message":"正しいアドレスを入力してください"}`);
            }
        }
    })
});

function giveEther(senderAddress, userAddress, amount, res) {
    var option = {
        from: senderAddress,
        to: userAddress,
        value: amount,
        gasPrice: 500000000000,
    };

    web3.eth.sendTransaction(option).then((value) => {
        console.log(value);
        res.send(value);
    }).catch((err) => {
        console.log(err);
    });
}

function checkEnoughtTime(last_used_at) {
    var now = new Date;
    let interval = 1;
    last_used_at.setHours(last_used_at.getHours() + interval);
    return last_used_at <= now;
}

