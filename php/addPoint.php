<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for adding a point
<?php
require_once ("config.inc.php");
  $projectId=$_POST["projectId"];
  $buildingId=$_POST["buildingId"];
  $levelId=$_POST["levelId"];
  $pointId=$_POST["pointId"];
  $pointX=$_POST["pointX"];
  $pointY=$_POST["pointY"];
  $dest=0;
  
  $pointSql = "INSERT INTO wegpunkt(wp_id,haus_id,ebene_id,projekt_id,X,Y,bezeichnung,art,ziel) VALUES ($pointId,$buildingId,$levelId,$projectId,$pointX,$pointY,'','WP',$dest);";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$pointResult = mysql_query ( $pointSql ) 
	  or die (mysql_error());
	  
	if($pointResult != 1){
		
		echo" FRAIS.maxPointId--;
		alert(\"Punkt konnte nicht hinzugefuegt werden!\");";	
	}
	else{
		
		echo "/*if (FRAIS.maxPointId == 0){
					var point_id = 1;
					FRAIS.maxPointId=point_id;
				} 
					
				else {
					var point_id = ++FRAIS.maxPointId;
				}
				*/
				
				var level=FRAIS.layers[FRAIS.activeLayer.id].level;

				FRAIS.wayPoints[FRAIS.maxPointId]= new FRAIS.WayPoint($pointX,$pointY,FRAIS.maxPointId,\"WP\",\"\",false,level,FRAIS.activeBuilding,FRAIS.activeProject,FRAIS.layers[FRAIS.activeLayer.id].id);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem = FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.createElementNS(FRAIS.svgNS,\"circle\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"id\", FRAIS.maxPointId);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"cx\", FRAIS.displayedXCoordinate($pointX));
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"cy\", FRAIS.displayedYCoordinate($pointY));
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"r\", \"4px\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"fill\", \"red\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"stroke\", \"black\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"stroke-width\", \"2px\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.setAttributeNS(null,\"style\", \"cursor:pointer\");
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.addEventListener(\"click\",FRAIS.selectPoint,false);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.addEventListener(\"click\",FRAIS.toggleNeighbour,false);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.addEventListener(\"mouseover\",FRAIS.showInfo,false);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.addEventListener(\"mousedown\",FRAIS.hideInfo,false);
				FRAIS.wayPoints[FRAIS.maxPointId].SVGElem.addEventListener(\"mouseout\",FRAIS.hideInfo,false);
				FRAIS.wayPoints[FRAIS.maxPointId].addToScreen();
				FRAIS.layers[FRAIS.activeLayer.id].wayPoints[FRAIS.layers[FRAIS.activeLayer.id].wayPointsCount++]=FRAIS.maxPointId;";
	}
	
?>	
