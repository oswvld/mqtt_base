
/* ------------------- CALLBACKS ------------------- */

function onConnect() {
	console.log(MESSAGGIO_CONNESSIONE_AVVENUTA);
	client.subscribe(canale);
	addEntry(clientId,1);
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

	console.log(res);

	if( res[0] == '~' ) // new message from context
	{
		switch( res[1] ){
			case '|':
				var mittente = res[2];
				var timestamp = res[3];

				if(mittente != clientId){
					// update list
					getOnlineParticipants();
				}
			break;

			case '||':
				var mittente = res[2];
				var messaggio = res[3];

				console.log('_________________');
				console.log('new message');
				console.log('from: '+mittente);
				console.log('message: '+messaggio);
			break;
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

/* ---------------------- Send presence ---------------------- */

function sendPresence() {
	var preparedMessage = null;
	preparedMessage = '~';
	preparedMessage += '^|';
	preparedMessage += '^'+clientId;
	preparedMessage += '^'+Date.now();

	var messaggio = new Paho.MQTT.Message(preparedMessage);
	messaggio.destinationName = canale;
	client.send(messaggio);
}


/* ------------------- Send textual message ------------------- */

function sendTextualMessage( message ) {

	var preparedMessage = null;
	preparedMessage = '~';
	preparedMessage += '^||';
	preparedMessage += '^'+clientId;
	preparedMessage += '^'+message;

	var messaggio = new Paho.MQTT.Message(preparedMessage);
	messaggio.destinationName = canale;
	client.send(messaggio);

}


/* ------------------- Get online participants ------------------- */

function getOnlineParticipants() {
	$.ajax({
		type: "POST",
		url: 'sqlite_calls.php',
		data: 'cmd=get_online_participants',
	}).done(function(data){
		console.log('done');
	}).fail(function(data){
		console.log('fail');
	}).always(function(){});
}

/* ------------------- Add entry ------------------- */

function addEntry(username, status) {
	$.ajax({
		type: "POST",
		url: 'sqlite_calls.php',
		data: 'cmd=add&username='+username+'&status='+status,
	}).done(function(data){
		alert('done');
		sendPresence();
	}).fail(function(data){
		alert('errore');
		console.log(data);
	}).always(function(){});
}


/* ------------------- RUNTIME ------------------- */
$(document).ready(function(){

	$('#btnInvia').on('click', function(){
		sendTextualMessage( 'this is a test' );
	});

	generaID();

});