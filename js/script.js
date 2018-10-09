  nknWallet.configure({
    rpcAddr: 'https://newkindofwallet.com:30003',
  });

  $(function () {
    $('[data-toggle="popover"]').popover()
  });

  var walletFromJson = "";
  function loadFile() {
    var input, file, fr;
    var p = document.getElementById('pass').value;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
    }

    function receivedText(e) {
      let lines = e.target.result;
      walletFromJson = nknWallet.loadJsonWallet(lines, p);
      console.log(walletFromJson);
      getbalance();
    }
  }

  function getbalance(){
    walletFromJson.queryAssetBalance().then(function(value) {
      console.log('asset balance for this wallet is: ', value.toString());
      document.getElementById("nkn_balance").innerHTML =  value.toString() + "<span style='font-size:12;'> NKN</p>";
      document.getElementById("loadaddr").innerHTML =  walletFromJson.address;
      var z = document.getElementById("loadaddr");
      z.style.display = "inline-block";
    }).catch(function(error) {
      console.log('query balance fail: ', error)
    });
  }

  function transfer(){
    var ad = document.getElementById('addr').value;
    var amt = document.getElementById('amount').value;
    var p = document.getElementById('pass').value;
    walletFromJson.transferTo(ad, amt, p).then(function(data) {
      console.log('success: ', data);
      document.getElementById("txsuccess").classList.remove('hide');
      document.getElementById("txsuccess").classList.add('show');
      document.getElementById("txsuccess").innerHTML+= data;
    }).catch(function(error) {
      console.log('fail: ', error);
      document.getElementById("txfail").classList.remove('hide');
      document.getElementById("txfail").classList.add('show');
      document.getElementById("txfail").innerHTML+= JSON.stringify(error);
    });
    getbalance();
  }

  function createnew(){
    var p = document.getElementById('cpass').value;
    var n = document.getElementById('nknname').value;
    const wallet = nknWallet.newWallet(p);
    const walletJson = wallet.toJSON();
    walletFromJson.registerName(n, p).then(function(data) {
      console.log('name success: ', data);
      //document.getElementById("txsuccess").classList.remove('hide');
      //document.getElementById("txsuccess").classList.add('show');
      //document.getElementById("txsuccess").innerHTML+= data;
    }).catch(function(error) {
      console.log('name fail: ', error);
      //document.getElementById("txfail").classList.remove('hide');
      //document.getElementById("txfail").classList.add('show');
      //document.getElementById("txfail").innerHTML+= JSON.stringify(error);
    });
    download('NKN_wallet.dat', walletJson);
    console.log(wallet.address);
    $('#newaddr').prepend ("<span style='font-size:12;'>Your wallet has been successfully generated! Your new NKN address is:</span> <br><span id='genaddr'>"+ wallet.address + "</span>");
    var x = document.getElementById("copybtn");
    x.style.display = "inline";
  }

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
  }


  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }