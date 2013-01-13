<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading buildings for floorplan editing
<?php
require_once ("config.inc.php"); 
  $projectId=$_POST["projectId"];
  $sql = "SELECT h.haus_id,h.beschreibung FROM haus h WHERE h.projekt_id=$projectId;";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());

?>
var navBarSelectItemC= document.getElementById("navBarSelectItemC");

var navBarListD=document.createElement("ul");
	navBarListD.id="navBarListD";
	navBarListD.className="navBarList";
	
var navBarSelectItemD = document.createElement("li");
	navBarSelectItemD.id = "navBarSelectItemD";
			
var navBarSelectD = document.createElement("select");
	navBarSelectD.name = "navBarSelectD";
	navBarSelectD.id = "navBarSelectD";
	navBarSelectD.className="navBarSelect";
	navBarSelectD.size = 1;
	navBarSelectD.addEventListener("change", FRAIS.loadLevelsForFloorplans, false);
	
var navBarSelectDOption0=document.createElement("option");
	navBarSelectDOption0.value=0;

var navBarSelectDOption0Text=document.createTextNode("Haus auswaehlen");

	navBarSelectDOption0.appendChild(navBarSelectDOption0Text);
	navBarSelectD.appendChild(navBarSelectDOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   
   echo"var navBarSelectDOption".($i+1)."=document.createElement(\"option\");
   			navBarSelectDOption".($i+1).".value=".mysql_result($ergebnis,$i,"haus_id").";
	    var navBarSelectDOption".($i+1)."Text=document.createTextNode(\"".mysql_result($ergebnis,$i,"beschreibung")."\");
	    	navBarSelectDOption".($i+1).".appendChild(navBarSelectDOption".($i+1)."Text);
	
	    	navBarSelectD.appendChild(navBarSelectDOption".($i+1).");"
?>   
												
<?php }?>
	navBarSelectItemD.appendChild(navBarSelectD);
	navBarListD.appendChild(navBarSelectItemD);
	navBarSelectItemC.appendChild(navBarListD);
		