<?PHP

$db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung möglich");

mysql_select_db ( $CFG->dbname , $db );

$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());

?>
