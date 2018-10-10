  nknWallet.configure({
    rpcAddr: 'https://newkindofwallet.com:30003',
  });

  var walletFromJson = "";
  var loaded=0;
  var sendresolved=0;

  $('.alert').on('close.bs.alert', function (e) {
    e.preventDefault();
    $(this).removeClass('show');
    $(this).addClass('hide');
  });

  document.getElementById("resolvebtn").disabled = true;

  function resolvebtn(){
    var l = document.getElementById("addr").value.length;
    if (l>=8 && l<=12){
      document.getElementById("resolvebtn").disabled = false;
    }
    else{
      document.getElementById("resolvebtn").disabled = true;
      sendresolved=0;
    }
  }

  $(document).ready(function(){
    $("#nknname").keypress(function(event){
      var inputValue = event.charCode;
      if(!(inputValue >= 65 && inputValue <= 120) && (inputValue = 32 && inputValue != 0)){
        event.preventDefault();
      }
    });
  });

  $(function () {
    $('[data-toggle="popover"]').popover()
  });

  $('#nknname').tooltip({'trigger':'focus','placement':'bottom', 'title': 'Between 8-12 characters, only alphabets.'});

  function nameCheck() {
    var value = document.getElementById('nknname').value;
    if (value.length < 8 || value.length > 12) {
     return false; 
   }
   return true;
 }

 function resolveName(name) {
  return new Promise(function(resolve, reject) {
    axios.post("https://newkindofwallet.com:30003",{"jsonrpc": "2.0","method": "getaddressbyname","params": { "name": name},"id":"1"}).then(function(response){
      if (response.data.result){
        resolve(response.data.result);
      }
      else {
        reject("err");
      }
    }).catch(function(error) {
      console.log(error);
      reject(error);
    });
  });
}

function getNameaddr(){
  var name = document.getElementById('resname').value;
  resolveName(name).then((res) => {
    document.getElementById("resolvederr").innerHTML="";
    if(document.getElementById("resolvedaddr")){
     document.getElementById("resolvedaddr").innerHTML="";
   }
   document.getElementById("resolvedaddr").innerHTML=res;
   var x = document.getElementById("rescopybtn");
   x.style.display = "inline";
   console.log(res);
 },
 (err) => {
  document.getElementById("resolvederr").innerHTML="Name not found.";
  console.log("Name not found.");
});
}

function resolveSend(){
  var name = document.getElementById('addr').value;
  resolveName(name).then((res) => {
    document.getElementById("sendaddr").innerHTML="";
    if(document.getElementById("sendaddr")){
     document.getElementById("sendaddr").innerHTML="";
   }
   document.getElementById("sendaddr").innerHTML=res;
   sendresolved=1;
   console.log(sendresolved);
 },
 (err) => {
  document.getElementById("sendaddr").innerHTML="Name not found.";
  console.log("Name not found.");
  sendresolved=0;
  console.log(sendresolved);
});
}

/*function resolvename(name){
  axios.post("http://138.197.147.97:30003",{"jsonrpc": "2.0","method": "getaddressbyname","params": { "name": name},"id":"1"}).then(function(response){
//console.log(response);
if (response.data.result){
  return response.data.result;
}
else {
  return "err";
}
}).catch(function(error) {
  console.log(error);
});
}*/


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
    if(walletFromJson.address && walletFromJson!=='undefined'){
      getBalance();
    }
    else{
      document.getElementById("badpass").classList.remove('hide');
      document.getElementById("badpass").classList.add('show');
    }
  }
}

function getBalance(){
  walletFromJson.queryAssetBalance().then(function(value) {
    console.log('asset balance for this wallet is: ', value.toString());
    document.getElementById("nkn_balance").innerHTML =  value.toString() + "<span style='font-size:12;'> NKN</p>";
    document.getElementById("loadaddr").innerHTML =  walletFromJson.address;
    var z = document.getElementById("loadaddr");
    z.style.display = "inline-block";
    loaded=1;
  }).catch(function(error) {
    console.log('query balance fail: ', error)
  });
}

function transfer(){
  var ad="";
  if(sendresolved==0){
    ad = document.getElementById('addr').value;
  }
  if(sendresolved==1){
    ad = document.getElementById("sendaddr").innerHTML;
    console.log(ad);
  }
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
  getBalance();
}

function registerName(){
  if(loaded!=0){
    var p = document.getElementById('registerpass').value;
    var n = document.getElementById('registername').value;
    walletFromJson.registerName(n, p).then(function(data) {
      console.log('name registration success: ', data);
      document.getElementById("registersuccess").classList.remove('hide');
      document.getElementById("registersuccess").classList.add('show');
      document.getElementById("registersuccess").innerHTML+= data;
    }).catch(function(error) {
      console.log('name registration fail: ', error);
      document.getElementById("registerfail").classList.remove('hide');
      document.getElementById("registerfail").classList.add('show');
      document.getElementById("registerfail").innerHTML+= JSON.stringify(error);
    });
  }
  else {
    document.getElementById("registerloadwalletalert").innerHTML= "Please load your wallet first.";
  }
}

function createNew(){

  var p = document.getElementById('cpass').value;
  var n = document.getElementById('nknname').value;

  const wallet = nknWallet.newWallet(p);
  const walletJson = wallet.toJSON();

  if (n.trim() !== ""){
    if (nameCheck()){
      wallet.registerName(n, p).then(function(data) {
        console.log('name success: ', data);
        document.getElementById("namesuccess").classList.remove('hide');
        document.getElementById("namesuccess").classList.add('show');
        document.getElementById("namesuccess").innerHTML+= data;
      }).catch(function(error) {
        console.log('name fail: ', error);
        document.getElementById("namefail").classList.remove('hide');
        document.getElementById("namefail").classList.add('show');
        document.getElementById("namefail").innerHTML+= JSON.stringify(error);
      });
    }
    else{
      document.getElementById("nameinvalid").classList.remove('hide');
      document.getElementById("nameinvalid").classList.add('show');
      return;
    }
  }
  
  download('NKN_wallet.dat', walletJson);
  console.log(wallet.address);
  $('#newaddr').prepend ("<span style='font-size:12;'>Your wallet has been successfully generated! Your new NKN address is:</span> <br><span id='genaddr'>"+ wallet.address + "</span>");
  var x = document.getElementById("copybtn");
  x.style.display = "inline";
}

function deleteName(){
  if(loaded!=0){
    var p = document.getElementById('deletepass').value;
    walletFromJson.deleteName(p).then(function(data) {
      console.log('name delete success: ', data);
      document.getElementById("deletesuccess").classList.remove('hide');
      document.getElementById("deletesuccess").classList.add('show');
      document.getElementById("deletesuccess").innerHTML+= data;
    }).catch(function(error) {
      console.log('name delete fail: ', error);
      document.getElementById("deletefail").classList.remove('hide');
      document.getElementById("deletefail").classList.add('show');
      document.getElementById("deletefail").innerHTML+= JSON.stringify(error);
    });
  }

  else{
    document.getElementById("loadwalletalert").innerHTML= "Please load your wallet first.";
  }
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