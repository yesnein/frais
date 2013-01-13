<?php header('content-type: text/javascript'); ?>
/////////////////
// FRAIS 
/////////////////

// Ajax PHP script generating javscript code for adding a building to a project
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingDesc=$_POST["desc"];
  $sql = "INSERT INTO haus(haus_id,projekt_id,beschreibung) VALUES (null,".$projectId.",'".$buildingDesc."')";
  
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"Haus konnte nicht hinzugefuegt werden!\");";	
	}
	else{
		echo"alert(\"".$buildingDesc." wurde hinzugefuegt\");";	
	}
	
?>
document.getElementById("addBuildingDescInput").value="";
FRAIS.getBuildingsForDelete();


	
