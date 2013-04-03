<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for adding a new project
<?php
require_once ("config.inc.php"); 
  $projectName=$_POST["name"];
  $sql = "INSERT INTO projekt(projekt_id,name) VALUES (null,'".$projectName."')";
  
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"Projekt konnte nicht erstellt werden!\");";	
	}
	else{
		echo"alert(\"Projekt ".$projectName." wurde erstellt\");";	
	}
	
?>
document.getElementById("addProjectNameInput").value="";


	
