
var mosca = require('mosca');

var settings = {
  port: 1884
  //backend: ascoltatore
};
//紀錄有上線的power
var onlinePower = new Object();
var server = new mosca.Server(settings);
server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
		
	var value = client.id.split("#");
	console.log('Value.length:' + value.length);
	if(value.length > 1){
		
		var m_id = value[0];
		var p_id = value[1];
		
		var onlinePId = new Array();
		
		if(onlinePower[m_id]){
		onlinePId =  onlinePower[m_id];
		console.log(onlinePId);
		onlinePId.push(p_id);
		onlinePower[m_id] = onlinePId;	
		}
		else{
			onlinePId.push(p_id);
			onlinePower[m_id] = onlinePId;	
		}
	}
	
	//debug print
	var keysArr = Object.keys(onlinePower)
	for(var i = 0; i < keysArr.length; i++){
		var aa = new Array();
		aa = onlinePower[keysArr[i]];
		for(var j = 0; j < aa.length; j++){
			console.log('onlinePower['+keysArr[i]+']:' + aa[j]);
		}
	}	
});

server.on('clientDisconnected', function(client) {
    console.log('client Disconnected', client.id);
	
	var value = client.id.split("#");
	console.log('Value.length:' + value.length);
	if(value.length > 1){
		
		var m_id = 'phone_m_id#'+value[0];
		var p_id = value[1];
		
		var msg = {
                topic: m_id,
                payload: p_id,
                qos: 0,
                retain: false,
				data:'aaaa'
            };
            server.publish(msg, function () {
                console.log('repeat!  aaa' + msg.topic + ', ' + msg.payload);
            });
		
		var onlinePId = new Array();
		
		if(onlinePower[m_id]){
		onlinePId =  onlinePower[m_id];
		console.log(onlinePId);
		
		var index = onlinePId.indexOf(p_id);
		
		if(index > -1){
			onlinePId.splice(index, 1);
		}
		
		onlinePower[m_id] = onlinePId;	
		}
		else{
			var index = onlinePId.indexOf(p_id);
		
			if(index > -1){
				onlinePId.splice(index, 1);
			}			
			onlinePower[m_id] = onlinePId;	
		}
	}
	//debug print
	var keysArr = Object.keys(onlinePower)
	for(var i = 0; i < keysArr.length; i++){
		var aa = new Array();
		aa = onlinePower[keysArr[i]];
		for(var j = 0; j < aa.length; j++){
			console.log('onlinePower['+keysArr[i]+']:' + aa[j]);
		}
	}
	
});
// fired when a message is received
server.on('published', function(packet, client) {
  console.log('---------------------------------');
  //console.log('client:', client);
  console.log('topic:', packet.topic);
  console.log('payload:', packet.payload.toString());

  //var jsonStr = JSON.stringify(packet.payload);
  var json;// = JSON.parse(packet.payload);

	try {
		json = JSON.parse(packet.payload);

		console.log('JSON:',json);
		//console.log('JSON.clientId:',json.clientId);
		//console.log('JSON.topic:',json.topic);
		console.log('JSON.p_id:',json.p_id);
		console.log('JSON.status:',json.status);
		console.log('JSON.m_id:',json.m_id);
		
		if(packet.topic == 'PC_Remote'){
			console.log('catch PC Remote');
			
			var msg = {
                topic: json.p_id,
                payload: packet.payload,
                qos: 0,
                retain: false
            };
            server.publish(msg, function () {
                console.log('repeat!  aaa');
            });
			
		} 
		else if(packet.topic == 'Phone'){
			console.log('catch Phone');
			
			var msg = {
						topic: json.m_id,
						payload: onlinePower[json.m_id],
						qos: 0,
						retain: false
					};
					
				    server.publish(msg, function () {
						console.log('repeat!  connect status');
					});
			
		}else{
			
		}
		  console.log('---------------------------------');

	} catch (e) {
		console.log("not JSON");
	}
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
  console.log('process.env.PORT:' + process.env.PORT);
  console.log('process.env.OPENSHIFT_NODEJS_PORT:' + process.env.OPENSHIFT_NODEJS_PORT);
  console.log('process.env.IP:' + process.env.IP);
  console.log('process.env.OPENSHIFT_NODEJS_IP:' + process.env.OPENSHIFT_NODEJS_IP);
}