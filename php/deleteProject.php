<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for deleting a project
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];

  
  $sql = "DELETE FROM projekt WHERE projekt.projekt_id=$projectId;";

 
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"Projekt konnte nicht geloescht werden!\");";	
	}
	else{
		echo"alert(\"Das Projekt wurde geloescht.\");";	
	}
	
?>
FRAIS.resetNavBar();

	
