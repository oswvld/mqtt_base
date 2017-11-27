
/* ------------------- CALLBACKS ------------------- */

function onConnect() {
	console.log(MESSAGGIO_CONNESSIONE_AVVENUTA);
	client.subscribe(canale);
}

function doFail( error ) {
	console.log(MESSAGGIO_CONNESSIONE_FALLITA);
	console.log(error);
}

function onConnectionLost( responseObject ) {
	if (responseObject.errorCode !== 0) {
		console.log("onConnectionLost: "+responseObject.errorMessage);
	}
}

function onMessageArrived( receivedMessage ) {
	var unencoded_message = receivedMessage.payloadString;
	var res = unencoded_message.split('^');

	if( res[0] == '~' ) // new message
	{
		if( res[1] != clientId ) // messaggio da un'altra persone
		{

			var mittente = res[1];
			var messaggio = res[2];

			console.log('_________________');
			console.log('new message');
			console.log('from: '+mittente);
			console.log('message: '+messaggio);
		}
	}
}

function onMessageDelivered( status ) {

}

/* ------------------- Genera ID ------------------- */

var generateClientId = new Promise(
    function (resolve, reject) {
        if (clientId == null) {

        	clientId = 'mioID_' + parseInt(Math.random() * 100, 10);
            resolve(clientId);

        }
        else {

        	var reason = 'già creato';
            reject(reason); // reject

        }

    }
);

function generaID() {

	generateClientId.then(function (fulfilled) {
		console.log(fulfilled);
		$('#clientId').text(fulfilled);
		connettiClient();
    })
	.catch(function (error) {
		console.log(error.message);
	});

}

/* ------------------- Connetti ------------------- */

function connettiClient() {
	client = new Paho.MQTT.Client(host, port, clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.onMessageDelivered = onMessageDelivered;
    var options = {
    	userName: user,
    	password: psw,
    	onSuccess: onConnect,
    	onFailure: doFail,
    	useSSL: true,
    }
    client.connect(options);
}


/* ------------------- Send message ------------------- */

function sendMessage( message ) {

	var preparedMessage = null;
	preparedMessage = '~';
	preparedMessage += '^'+clientId;
	preparedMessage += '^'+message;

	var messaggio = new Paho.MQTT.Message(preparedMessage);
	messaggio.destinationName = canale;
	client.send(messaggio);

}


/* ------------------- RUNTIME ------------------- */
$(document).ready(function(){

	$('#btnInvia').on('click', function(){
		sendMessage( 'this is a test' );
	});

	generaID();

});