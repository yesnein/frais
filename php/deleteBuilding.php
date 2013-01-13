<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for deleting a building from a project
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  
  $sql = "DELETE FROM haus WHERE haus.haus_id=$buildingId AND haus.projekt_id=$projectId;";

 
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"Das Haus konnte nicht geloescht werden!\");";	
	}
	else{
		echo"alert(\"Das Haus wurde geloescht.\");";	
	}
	
?>
FRAIS.getBuildingsForDelete();

	
