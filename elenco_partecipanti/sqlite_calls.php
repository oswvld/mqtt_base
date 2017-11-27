<?php
   class MyDB extends SQLite3 {

      function __construct() {
         $this->open('users.db');
      }

      function add_row($username, $status){
      	$this->exec("INSERT INTO users VALUES('$username', $status)");
      }

      function update_row($username, $status){
      	$this->exec("UPDATE users SET online = $status WHERE username = '$username'");
      }

      function get_online_participants(){
      	$results = $this->query('SELECT * FROM users WHERE online = 1');
      	$results_parsed = null;
      	while ($row = $results->fetchArray()) {
      		$results_parsed[] = $row;
		}

		if( $results_parsed )
			return $results_parsed;
		else
			return false;
      }
   }

   $toReturn['esito'] = null;
   $toReturn['cod_stato'] = null;
   $toReturn['descrizione'] = null;
   $cmd = $_POST['cmd'];

   $db = new MyDB();
   if(!$db){
   		$toReturn['esito'] = 'errore';
   		$toReturn['cod_stato'] = 100;
   		$toReturn['descrizione'] = 'errore connessione db';
   		$toReturn['more'] = $db;
   		echo json_encode( $toReturn );
   		die();
   	}

   switch($cmd){
   	case 'add':
   		$username = $_POST['username'];
   		$status = $_POST['status'];
   		$db->add_row($username, $status);
   		$toReturn['esito'] = 'success';
   		$toReturn['cod_stato'] = '200';
   		$toReturn['descrizione'] = 'added entry';
   		echo json_encode( $toReturn );
   	break;

   	case 'get_online_participants':
   		$online_participants = $db->get_online_participants();
   	break;
   }

?>