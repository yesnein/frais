<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading the destinations of the way search 
	(function(){
<?php
require_once ("config.inc.php");
$projectId=$_POST["projectId"];
  
  $sql = "SELECT w.* FROM wegpunkt w WHERE w.projekt_id=$projectId and w.ziel=1 ORDER BY w.bezeichnung ASC";
 
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());

?>

var navBarSelectItemA=document.getElementById("navBarSelectItemA");

//var oldNavBarList=document.getElementById("navBarList");

var navBarListB=document.createElement("ul");
	navBarListB.id="navBarListB";
	navBarListB.className="navBarList";

var navBarSelectItemB=document.createElement("li");
	navBarSelectItemB.id="navBarSelectItemB";

var navBarSelectBStart=document.createElement("select");
	navBarSelectBStart.name="navBarSelectBStart";
	navBarSelectBStart.id="navBarSelectBStart";
	navBarSelectBStart.className="navBarSelect";
	navBarSelectBStart.size=1;
	//navBarSelectB.addEventListener("change",FRAIS.loadProjectTask,false);
	
var navBarSelectBStartOption0=document.createElement("option");
	navBarSelectBStartOption0.value=0;
var navBarSelectBStartOption0Text=document.createTextNode("Startpunkt auswaehlen");

	navBarSelectBStartOption0.appendChild(navBarSelectBStartOption0Text);
	navBarSelectBStart.appendChild(navBarSelectBStartOption0);
	
var navBarSelectBDest=document.createElement("select");
	navBarSelectBDest.name="navBarSelectBDest";
	navBarSelectBDest.id="navBarSelectBDest";
	navBarSelectBDest.className="navBarSelect";
	navBarSelectBDest.size=1;
	//navBarSelectB.addEventListener("change",FRAIS.loadProjectTask,false);
	
var navBarSelectBDestOption0=document.createElement("option");
	navBarSelectBDestOption0.value=0;
var navBarSelectBDestOption0Text=document.createTextNode("Zielpunkt auswaehlen");

	navBarSelectBDestOption0.appendChild(navBarSelectBDestOption0Text);
	navBarSelectBDest.appendChild(navBarSelectBDestOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   
   echo"var navBarSelectBStartOption".($i+1)."=document.createElement(\"option\");
   			navBarSelectBStartOption".($i+1).".value=".mysql_result($ergebnis,$i,"wp_id").";
	    var navBarSelectBStartOption".($i+1)."Text=document.createTextNode(\"".mysql_result($ergebnis,$i,"bezeichnung")."\");
	    	navBarSelectBStartOption".($i+1).".appendChild(navBarSelectBStartOption".($i+1)."Text);
	
	    navBarSelectBStart.appendChild(navBarSelectBStartOption".($i+1).");";
	
   echo"var navBarSelectBDestOption".($i+1)."=document.createElement(\"option\");
   			navBarSelectBDestOption".($i+1).".value=".mysql_result($ergebnis,$i,"wp_id").";
	    var navBarSelectBDestOption".($i+1)."Text=document.createTextNode(\"".mysql_result($ergebnis,$i,"bezeichnung")."\");
	    	navBarSelectBDestOption".($i+1).".appendChild(navBarSelectBDestOption".($i+1)."Text);
	
	    navBarSelectBDest.appendChild(navBarSelectBDestOption".($i+1).");";
?>   
												
<?php }?>

	var navBarSearchButton=document.createElement("input");
		navBarSearchButton.id="navBarSearchButton";
		navBarSearchButton.type="button";
		navBarSearchButton.className="navBarSelect";
		navBarSearchButton.value="Suchen";
		navBarSearchButton.addEventListener("click",FRAIS.search,false);
	
	navBarSelectItemB.appendChild(navBarSelectBStart);
	navBarSelectItemB.appendChild(navBarSelectBDest);
	navBarSelectItemB.appendChild(navBarSearchButton);
	navBarListB.appendChild(navBarSelectItemB);
	navBarSelectItemA.appendChild(navBarListB);
	}());


	
