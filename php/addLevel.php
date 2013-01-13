<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for adding a level to a building of a project
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  $levelDesc=$_POST["levelDesc"];
  $imagePath=$_POST["imagePath"];
  $imageWidth=$_POST["imageWidth"];
  $imageHeight=$_POST["imageHeight"];
  $imageRefX=$_POST["imageRefX"];
  $imageRefY=$_POST["imageRefY"];
  $imageScale=$_POST["imageScale"];
 
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );
	 
  $maxBuildingFloorSQL="SELECT max(stockwerk) FROM ebene e WHERE e.haus_id= $buildingId and e.projekt_id= $projectId; ";
  
  $maxBuildingFloorResult= mysql_query( $maxBuildingFloorSQL, $db );
  	if(mysql_result($maxBuildingFloorResult,0)){
		$maxBuildingFloor= (int)mysql_result($maxBuildingFloorResult,0) +1;
	}
	else{
		$maxBuildingFloor=1;
		}
  
  $sql = "INSERT INTO ebene(ebene_id,haus_id,projekt_id,stockwerk,beschreibung,grafik_pfad,grafik_breite,grafik_hoehe,grafik_massstab,grafik_referenz_x,grafik_referenz_y) 
  VALUES (null,$buildingId,$projectId,$maxBuildingFloor,'$levelDesc','$imagePath',$imageWidth,$imageHeight,$imageScale,$imageRefX,$imageRefY);";
  
  $ergebnis = mysql_query ( $sql ) or die (mysql_error());
	
	if($ergebnis != 1){
		echo"alert(\"$levelDesc konnte nicht hinzugefuegt werden!\");";	
	}
	else{
		echo"alert(\"".$levelDesc." wurde hinzugefuegt\");";	
	}
	
?>
document.getElementById("addLevelDescInput").value="";
FRAIS.getLevelsForDelete();

	
