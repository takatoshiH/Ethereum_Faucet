# Ethereum PrivateNet Faucet

Ethereumのプライベートネットワーク上の通貨を、ブラウザから誰にでも簡単に配布することができるWebアプリケーション

## Go Ethereum(Geth)でプライベートネットワークを作成する
### 前提
* EthereumのクライアントソフトであるGethが利用できる環境が整っていること

### 準備
* `git clone git@github.com:throo-blockchain/Faucet.git`
* `cd Faucet/geth`
* Gethを初期化する

`geth --datadir ./ init ./genesis.json`

### Gethを起動する
#### 初回起動時
* `geth --networkid 10 --datadir . 2>> ./node.log --rpc --rpcaddr "IPアドレス" --rpcport "8545" --rpccorsdomain "*" console`

--rpc オプションをつけてGethを起動させると、GethがHTTP-RPCサーバとして機能し、http://<IPアドレス>:8545 でアクセスすることができる。ローカル環境で動かす場合は`127.0.0.1`を指定する

* アカウントを作る。アカウントを作成した際に、アカウントのアドレスが表示されるので、メモしておく
`personal.newAccount()`

* 一度コンソールから抜ける 
`exit`

#### 2回目以降
* `geth --networkid 10 --datadir . 2>> ./node.log --rpc --rpccorsdomain "*" console --mine --minerthreads 1 --rpcapi eth,net,web3,personal --allow-insecure-unlock --unlock 0 --rpcaddr "IPアドレス" --rpcport "8545" --nodiscover`

上記のコマンドを実行すると、先ほど作成したアカウントのパスワードが求められるので入力する。


これ以降の作業についてはGethを起動させたままにしておく。

## APIサーバーの準備
Node.jsでAPIサーバーを立てる。このAPIサーバーを経由してブラウザからGethに対して、通貨の送金処理を要求する。

### データベースの準備
アドレスの管理にMysqlを利用する

#### 前提
* Mysqlが利用できる環境が整っていること

#### 手順
* Mysqlサーバーを立ち上げ、Mysqlのコンソールに入る
* 任意のユーザーで以下のコマンドを実行する
* 以下のコマンドを順に実行する

```
$ create database Faucet;
$ use faucet;
$ create table user(id int(11) AUTO_INCREMENT NOT NULL, address VARCHAR(60) NOT NULL ,last_used_at TIMESTAMP NOT NULL, PRIMARY KEY (id));
```
* `exit;`でコンソールを抜ける

### Node.jsの準備

* node: 8.16.2
* npm: 6.4.1

以下の作業はfaucet_serverディレクトリ内で行う。

* 必要となるモジュールをインストールする
 `npm install`
 
* Mysqlと接続する。faucet_server/faucet_server.jsの以下の設定を自身の環境に応じて書き換える。

```
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: "Faucet",
  });
```
 
* faucet_server/faucet_server.jsの`gethUrl`と`senderAddress`を書き換える

```
const gethUrl = "http://<IPアドレス>:8545"; //接続するEthereumClientのIPアドレスとポート番号
const senderAddress = "<作成したアカウントのアドレス>";　//作成したAccountのアドレス(通貨の送金元となる)
```
 
* サーバーを立ち上げる
`node faucet_server.js`

サーバーは立ち上げたままにしておく

## Webサーバーの準備

* src/main.jsの`apiUrl`をAPIサーバーのURLに書き換える(ローカル環境で行う場合はhttp://127.0.0.1:8080 )

```
var apiUrl = "http://<IPアドレス>:8080"; //APIサーバーのIPアドレスとポート番号
```

ブラウザで表示するHTMLファイルなどを配置するための、Webサーバーを立ち上げる。利用するWebサーバーに制約はないので、任意のソフトウェアを利用する。
今回は簡易的に[Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)というアプリを利用した方法を説明する。

* [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)を開き、アプリをinstallする
* アプリを起動させ、CHOOSE FOLDERで`src`を指定する
* http://127.0.0.1:8545を開く

## 利用方法
* [MetaMask](https://metamask.io/)などのEthereumのウォレットアプリでEthereumのアカウントを作成する
* 作成したアカウントのアドレスを中央のテキストボックスに入力し、Get Etherをクリックする
* 正しく処理が行われると、発行されたトランザクションのハッシュ値が表示され、通貨が振り込まれる

