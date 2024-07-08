require('dotenv').config();
const mqtt = require("mqtt");
const ping = require("ping");
const client = mqtt.connect({
    host: process.env.MqttHost,
    port: process.env.MqttPort,
    username: process.env.MqttUsername,
    password: process.env.MqttPassword,
    clientId: process.env.MqttClientId2,
    keepalive: 60,
    protocolId: 'MQTT',
    protocolVersion: 4,
    will: {
        topic: 'clinet/Offline',
        payload: process.env.MqttClientId2,
        qos: 1,
        retain: false
    }
});
console.log(process.env.MqttClientId2);
client.on("connect", () => {
    console.log("connected");
    client.publish("clinet/Online", process.env.MqttClientId2)
    client.subscribe("gateway/" + process.env.MqttClientId2)
});

client.on("message", (topic, message) => {
    // message is Buffer
    // console.log(message.toString());
    if (topic == "gateway/" + process.env.MqttClientId2) {
        console.log("client Ping");
        // client.publish("gateway/" + message, 'ini adalah pesan dari server');
        let clientGroup = JSON.parse(message.toString());
        for (let e of clientGroup.members) {
            ping.sys.probe(e.ip, function (isAlive) {
                var msg = isAlive ? 'host ' + e.ip + ' is alive' : 'host ' + e.ip + ' is dead';
                console.log(msg);
                if (isAlive) {
                    client.publish("cilent/Update/online", e.id.toString());
                } else {
                    client.publish("cilent/Update/offline", e.id.toString());
                }
            }, { timeout: 10, extra: ['-i', '2'], });
        }
    }
});
setInterval(function () {
    //code goes here that will be run every 5 seconds.    
    client.publish("clinet/Online", process.env.MqttClientId2)
}, process.env.setInterval);