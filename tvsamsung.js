var moment = require('moment');
moment.lang('fr');

exports.action = function(data, callback, cfg, SARAH){

  var config = cfg.modules.tvsamsung;
  if (!config.tvip){
    console.log("La configuration du plugin Samsung TV est introuvable");
    return;
  }

  var chr = function(asciiNum){
    return String.fromCharCode (asciiNum);
  }
	
  var tvappstring = "sarah.UE55C8000.iapp.samsung";
  var appstring = "sarah..iapp.samsung";
  var remotename = "SARAH";

  //Function to send Key command
  var sendKey = function(skey, socket, appstring){
    var skeyBuff  = new Buffer(skey).toString('base64');
    var msgPart3    = chr(0x00) 
                    + chr(0x00)
                    + chr(0x00)
                    + strBuff(skeyBuff);

    var footPart3   = chr(0x00) 
                    + strBuff(appstring) 
                    + strBuff(msgPart3);

    socket.write(footPart3);
    
	console.log('TRoISIEME PARTIE DU MESSAGE: ' + msgPart3);
	console.log('TRoISIEME PARTIE DU MESSAGE: ' + footPart3);
  }
  
  var strBuff = function(param){
	var len = param.length;
    return chr(len) + chr(0x00) + param; 
  }
  
  var net = require('net');
  var socket = new net.Socket();
  
  // Add a 'data' event handler for the client socket
  // data is what the server sent to this socket
  socket.on('data', function(data) {
    console.log('DATA: ' + data);
  });
  socket.on('error', function(exception) {
    console.log('EXCEPTION: ');
	console.log(exception);
  });
  
  // Add a 'close' event handler for the client socket
  socket.on('close', function() {
    console.log('Connection closed');
  });
  
  socket.connect(55000, config.tvip, function() {
    console.log('CONNECTED TO: ' + config.tvip + ':' + 55000);
    
    var ipencoded  = new Buffer(config.tvip).toString('base64');
    //var macencoded = new Buffer("dc-71-44-2a-76-4f").toString('base64'); // 00-0c-29-3e-b1-4f
      var macencoded = new Buffer("0").toString('base64');
    var rnencoded = new Buffer(remotename).toString('base64');
    
    // Sending Part 1
    var msgPart1    = chr(0x64)
                    + chr(0x00)
                    + chr(ipencoded.length)
                    + chr(0x00)
                    + ipencoded
                    + chr(macencoded.length) 
                    + chr(0x00)
                    + macencoded
                    + chr(rnencoded.length)
                    + chr(0x00)
                    + rnencoded;
	//var msgPart1  = chr(0x64)+chr(0x00)+strBuff(ipencoded)+strBuff(macencoded)+strBuff(rnencoded);
	
    var footPart1   = chr(0x00)
                    + strBuff(appstring)
                    + strBuff(msgPart1);
      
    socket.write(footPart1);

	console.log('PREMIERE PARTIE DU MESSAGE: ' + msgPart1);
	console.log('PREMIERE PARTIE DU MESSAGE: ' + footPart1);
    
    
    // Sending Part 2
    var msgPart2    = chr(0xc8)
                    + chr(0x00);
                  
    var footPart2   = chr(0x00) 
                    + strBuff(appstring)
                    + strBuff(msgPart2);
                  
    socket.write(footPart2);
	console.log('DEUXIEME PARTIE DU MESSAGE: ' + msgPart2);
	console.log('DEUXIEME PARTIE DU MESSAGE: ' + footPart2);
       
    // Sending keys
	
    sendKey("KEY_VOLUP", socket, tvappstring);
	//console.log(data.key);
	//callback({ 'tts' : "Voilà qui est fait" })
      
    // Close the client socket completely
    socket.destroy();
  });
  
  callback({'tts': "Paramètres invalides"});
}