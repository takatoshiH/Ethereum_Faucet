window.getEther = function () {

    var userAddress = document.getElementById("address").value;
    if (!userAddress) {
        return window.alert("アドレスを入力してください");
    }

    var apiUrl = "http://<IPアドレス>:8080";
    var query = "?userAddress=" + userAddress;
    var url = apiUrl + query;

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    document.getElementById("transactionHash").innerText = "";

    request.onreadystatechange = function () {

        if (request.readyState != 4) {
        } else if (request.status != 200) {
            document.getElementById("transactionStatus").innerText = "The transaction is rejected";
        } else {
            var result = JSON.parse(request.response); //レスポンスの処理に問題がある
            document.getElementById("transactionStatus").innerText = "Transaction Info";

            if (result.transactionHash) {
                document.getElementById("transactionHash").innerText = "TxHash:" + result.transactionHash;
            } else {
                document.getElementById("transactionHash").innerText = result.message;
            }
        }
    };

    request.send(null);

};
