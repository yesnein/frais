<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for deleting a building from a project
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  $levelId=$_POST["levelId"];
  
  $sql = "DELETE FROM ebene WHERE ebene.haus_id=$buildingId AND ebene.projekt_id=$projectId AND ebene.ebene_id=$levelId;";

  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"Ebene konnte nicht geloescht werden!\");";	
	}
	else{
		echo"alert(\"Die Ebene wurde geloescht.\");";	
	}
	
?>
FRAIS.getLevelsForDelete();

	
