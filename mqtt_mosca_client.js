var mqtt = require('mqtt');

var opt = {
	port:1883,
	clientId:'p_id'
};

//var client = mqtt.connect('mqtt://192.168.3.71', opt);
var client = mqtt.connect('mqtt://127.0.0.1', opt);

client.on('connect', function(){
	console.log('connect to mqtt server');
	//訂閱97頻道
	client.subscribe('p_id');
});


client.on('message', function(topic, msg){
	console.log('收到:'+topic + ', 主題:'+msg.toString());
	
	var json = JSON.parse(msg.toString());

	if(json['status'] == 'closed'){
		console.log('關機');
		client.end();
	}else if(json['status'] == 'return'){
		console.log('重新開機');
		client.end();
	}
});

client.on('close', function(){
	console.log('disconnect to mqtt server');
	//client.subscribe('PC_Remote');
});