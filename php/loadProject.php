<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading a project
	(function(){
<?php
require_once ("config.inc.php"); 
  
  $sql = "SELECT projekt_id,name FROM projekt ORDER BY projekt_id ASC";
  
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

var navBarSelectB=document.createElement("select");
	navBarSelectB.name="navBarSelectB";
	navBarSelectB.id="navBarSelectB";
	navBarSelectB.className="navBarSelect";
	navBarSelectB.size=1;
	navBarSelectB.addEventListener("change",FRAIS.loadProjectTask,false);
	
var navBarSelectBOption0=document.createElement("option");
	navBarSelectBOption0.value=0;
var navBarSelectBOption0Text=document.createTextNode("Projekt auswaehlen");

	navBarSelectBOption0.appendChild(navBarSelectBOption0Text);
	navBarSelectB.appendChild(navBarSelectBOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   $project =mysql_result($ergebnis,$i,"name");
   
   echo"var navBarSelectBOption".($i+1)."=document.createElement(\"option\");
   			navBarSelectBOption".($i+1).".value=".mysql_result($ergebnis,$i,"projekt_id").";
	    var navBarSelectBOption".($i+1)."Text=document.createTextNode(\"",$project,"\");
	    navBarSelectBOption".($i+1).".appendChild(navBarSelectBOption".($i+1)."Text);
	
	    navBarSelectB.appendChild(navBarSelectBOption".($i+1).");"
?>   
												
<?php }?>
	navBarSelectItemB.appendChild(navBarSelectB);
	navBarListB.appendChild(navBarSelectItemB);
	navBarSelectItemA.appendChild(navBarListB);
	}());
	
