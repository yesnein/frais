<?PHP

$db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m�glich");

mysql_select_db ( $CFG->dbname , $db );

$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());

?>
