<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for updating a point
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  $levelId=$_POST["levelId"];
  $pointId=$_POST["pointId"];
  $pointX=$_POST["pointX"];
  $pointY=$_POST["pointY"];
  $pointArt=$_POST["pointArt"];
  $pointDesc=$_POST["pointDesc"];
  $pointDest=$_POST["pointDest"];
  $pointNPs=$_POST["pointNPs"];
  
  $pointSql = "UPDATE wegpunkt SET wegpunkt.X=$pointX, wegpunkt.Y=$pointY, wegpunkt.art='$pointArt',wegpunkt.bezeichnung='$pointDesc',wegpunkt.ziel=$pointDest WHERE wegpunkt.wp_id=$pointId;";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$pointResult = mysql_query ( $pointSql ) 
	  or die (mysql_error());
	  
	if($pointResult != 1){
		echo"alert(\"Punkt konnte nicht gespeichert werden!\");";	
	}
	else{
		echo"FRAIS.wayPoints[$pointId].x=$pointX;";
		echo"FRAIS.wayPoints[$pointId].y=$pointY;";
		echo"FRAIS.wayPoints[$pointId].type=\"$pointArt\";";
		echo"FRAIS.wayPoints[$pointId].desc=\"$pointDesc\";";
		echo"FRAIS.wayPoints[$pointId].dest=$pointDest;";
		echo"FRAIS.hideUpdatePoint();";
		echo"FRAIS.hideResetPointPosition();";
	}
	
  $deleteNeighboursSql= "DELETE FROM nachbarpunkt WHERE nachbarpunkt.wp1_id=$pointId OR nachbarpunkt.wp2_id=$pointId;";

  $deleteNeighboursResult = mysql_query ( $deleteNeighboursSql );
	  	
  echo"FRAIS.wayPoints[FRAIS.activePoint.id].removeAllNeighbours();";
	
  if($pointNPs!=""){
		$NPs= explode(" ",$pointNPs);
  }
  if(isset($NPs)){
  	for($i=0;$i<count($NPs);$i++){
  		$neighbourSql = "INSERT INTO nachbarpunkt(wp1_id,wp2_id) VALUES ($pointId,".$NPs[$i].");";
		
		$neighbourResult = mysql_query ( $neighbourSql ) 
	  		or die (mysql_error());
			
		if($neighbourResult != 1){
			echo"alert(\"Fehler bei Nachbarpunkten!\");";	
		}
		else{
			echo"FRAIS.wayPoints[FRAIS.activePoint.id].addNeighbour($NPs[$i]);";
			echo"FRAIS.wayPoints[$NPs[$i]].addNeighbour(FRAIS.activePoint.id);";
		}  
	}
  }
?>	
