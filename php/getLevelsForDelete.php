<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading levels for deletion
<?php
require_once ("config.inc.php"); 
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  $sql = "SELECT e.ebene_id,e.beschreibung FROM ebene e WHERE e.projekt_id=$projectId AND e.haus_id=$buildingId;";
  
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$ergebnis = mysql_query ( $sql ) 
	  or die (mysql_error());

?>

var main= document.getElementById("main");
var manageLevelList=document.getElementById("manageLevelList");
	if(document.getElementById("delLevelSelectItem")!=null && document.getElementById("delLevelHeaderItem")!=null){
		manageLevelList.removeChild(document.getElementById("delLevelHeaderItem"));
		manageLevelList.removeChild(document.getElementById("delLevelSelectItem"));
	}
	
var delLevelList=document.createElement("ul");
	delLevelList.id="delLevelList";
	delLevelList.className="mainList";

var delLevelHeaderItem=document.createElement("li");
	delLevelHeaderItem.id="delLevelHeaderItem";
	delLevelHeaderItem.className="listHeader";
	delLevelHeaderItem.appendChild(document.createTextNode("Ebene loeschen"));
	
var delLevelSelectItem=document.createElement("li");
	delLevelSelectItem.id="delLevelSelectItem";
	
var delLevelSelect=document.createElement("select");
	delLevelSelect.id="delLevelSelect";
	delLevelSelect.className="mainSelect";

	
var delLevelSelectOption0=document.createElement("option");
	delLevelSelectOption0.value=0;

var delLevelSelectOption0Text=document.createTextNode("Ebene auswaehlen");

	delLevelSelectOption0.appendChild(delLevelSelectOption0Text);
	delLevelSelect.appendChild(delLevelSelectOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   //$project =mysql_result($ergebnis,$i,"name");
   
   echo"var delLevelSelectOption".($i+1)."=document.createElement(\"option\");
   			delLevelSelectOption".($i+1).".value=".mysql_result($ergebnis,$i,"ebene_id").";
	    var delLevelSelectOption".($i+1)."Text=document.createTextNode(\"".mysql_result($ergebnis,$i,"beschreibung")."\");
	    	delLevelSelectOption".($i+1).".appendChild(delLevelSelectOption".($i+1)."Text);
	
	    	delLevelSelect.appendChild(delLevelSelectOption".($i+1).");"
?>   
												
<?php }?>

	delLevelSelectItem.appendChild(delLevelSelect);
	
var delLevelButton=document.createElement("input");
	delLevelButton.id="delLevelButton";
	delLevelButton.className="mainButton";
	delLevelButton.type="button";
	delLevelButton.value="Ebene loeschen";
	delLevelButton.addEventListener("click",FRAIS.deleteLevel,false);
	delLevelSelectItem.appendChild(delLevelButton);
	
	manageLevelList.appendChild(delLevelHeaderItem);		
	manageLevelList.appendChild(delLevelSelectItem);

	
	
	