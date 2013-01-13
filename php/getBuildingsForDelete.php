<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading buildings for deletetion
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

var main= document.getElementById("main");
var manageBuildingList=document.getElementById("manageBuildingList");
	if(document.getElementById("delBuildingSelectItem")!=null && document.getElementById("delBuildingHeaderItem")!=null){
		manageBuildingList.removeChild(document.getElementById("delBuildingHeaderItem"));
		manageBuildingList.removeChild(document.getElementById("delBuildingSelectItem"));
	}
	
var delBuildingList=document.createElement("ul");
	delBuildingList.id="delBuildingList";
	delBuildingList.className="mainList";

var delBuildingHeaderItem=document.createElement("li");
	delBuildingHeaderItem.id="delBuildingHeaderItem";
	delBuildingHeaderItem.className="listHeader";
	delBuildingHeaderItem.appendChild(document.createTextNode("Haus loeschen"));
	
var delBuildingSelectItem=document.createElement("li");
	delBuildingSelectItem.id="delBuildingSelectItem";
	//delBuildingSelectItem.appendChild(document.createTextNode("Haus "));
	
var delBuildingSelect=document.createElement("select");
	delBuildingSelect.id="delBuildingSelect";
	delBuildingSelect.className="mainSelect";

	
var delBuildingSelectOption0=document.createElement("option");
	delBuildingSelectOption0.value=0;

var delBuildingSelectOption0Text=document.createTextNode("Haus auswaehlen");

	delBuildingSelectOption0.appendChild(delBuildingSelectOption0Text);
	delBuildingSelect.appendChild(delBuildingSelectOption0);
	
<?php for($i=0;$i< mysql_num_rows($ergebnis);$i++){ ?>  
<?php 
   //$project =mysql_result($ergebnis,$i,"name");
   
   echo"var delBuildingSelectOption".($i+1)."=document.createElement(\"option\");
   			delBuildingSelectOption".($i+1).".value=".mysql_result($ergebnis,$i,"haus_id").";
	    var delBuildingSelectOption".($i+1)."Text=document.createTextNode(\"".mysql_result($ergebnis,$i,"beschreibung")."\");
	    	delBuildingSelectOption".($i+1).".appendChild(delBuildingSelectOption".($i+1)."Text);
	
	    	delBuildingSelect.appendChild(delBuildingSelectOption".($i+1).");"
?>   
												
<?php }?>

	delBuildingSelectItem.appendChild(delBuildingSelect);
	
var delBuildingButton=document.createElement("input");
	delBuildingButton.id="delBuildingButton";
	delBuildingButton.className="mainButton";
	delBuildingButton.type="button";
	delBuildingButton.value="Haus loeschen";
	delBuildingButton.addEventListener("click",FRAIS.deleteBuilding,false);
	delBuildingSelectItem.appendChild(delBuildingButton);
	
	manageBuildingList.appendChild(delBuildingHeaderItem);		
	manageBuildingList.appendChild(delBuildingSelectItem);

	
	
	