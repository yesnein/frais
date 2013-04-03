<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
// @author yesnein / yesnein.com
/////////////

// Ajax PHP script for loading  routing information systems
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
	var navBar=document.getElementById("navBar");

	var navBarListA=document.createElement("ul");
		navBarListA.id="navBarListA";
		navBarListA.className="navBarList";

	var navBarSelectItemA=document.createElement("li");
		navBarSelectItemA.id="navBarSelectItemA";

	var navBarSelectA=document.createElement("select");
		navBarSelectA.name="navBarSelectA";
		navBarSelectA.id="navBarSelectA";
		navBarSelectA.className="navBarSelect";
		navBarSelectA.size=1;
		navBarSelectA.addEventListener("change",FRAIS.loadDestinations,false);
	
	var navBarSelectAOption0=document.createElement("option");
		navBarSelectAOption0.value=0;
	var navBarSelectAOption0Text=document.createTextNode("System auswaehlen");

		navBarSelectAOption0.appendChild(navBarSelectAOption0Text);
		navBarSelectA.appendChild(navBarSelectAOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   $project =mysql_result($ergebnis,$i,"name");
   
   echo"var navBarSelectAOption".($i+1)."=document.createElement(\"option\");
   			navBarSelectAOption".($i+1).".value=".mysql_result($ergebnis,$i,"projekt_id").";
	    var navBarSelectAOption".($i+1)."Text=document.createTextNode(\"",$project,"\");
	    	navBarSelectAOption".($i+1).".appendChild(navBarSelectAOption".($i+1)."Text);
	
	    	navBarSelectA.appendChild(navBarSelectAOption".($i+1).");"
?>   
												
<?php }?>
	navBarSelectItemA.appendChild(navBarSelectA);
	navBarListA.appendChild(navBarSelectItemA);
	navBar.appendChild(navBarListA);
	
	
	}());
