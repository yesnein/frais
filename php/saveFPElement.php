<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for saving a floorplan element
<?php
require_once ("config.inc.php"); 
   $id=$_POST["id"];
   $type=$_POST["type"];
   $mode=$_POST["mode"];
   $levelId=$_POST["level"];
   $buildingId=$_POST["building"];
   $projectId=$_POST["project"];
   $wkt= $_POST["wkt"];
  //$mode="\"".$mode."\"";
  $wktSql="";
  if($mode==1){
  	$wktSql = "UPDATE grundriss SET grundriss.geom = GeomFromText('$wkt') WHERE grundriss.grundriss_id=$id;";
  }
  if($mode==2){
  	$wktSql = "INSERT INTO grundriss(grundriss_id,haus_id,ebene_id,projekt_id,art,geom) VALUES (null,$buildingId,$levelId,$projectId,'',GeomFromText('$wkt'));";
  }	
  //echo"alert(\"$wktSql\");";
    $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

	$wktResult = mysql_query ( $wktSql ) 
	  or die (mysql_error());
	
	if($wktResult != 1){
		echo"alert(\"Grundriss konnte nicht hinzugefuegt werden!\");";	
	}
	else{
  
  		echo"
		var mode=$mode;
		if(mode==2 && FRAIS.tempFPElement!=null){
			FRAIS.FPElements[++FRAIS.maxFPElementsId]= FRAIS.tempFPElement;
			FRAIS.activeFPElement=FRAIS.maxFPElementsId;
			FRAIS.tempFPElement=null;
		}
		
  		var type = \"$type\";
  		if(type==\"POLYGON\"){
				var firstPoint = FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[1];
				firstPoint.svgLine = FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.createElementNS(FRAIS.svgNS, \"line\");
				firstPoint.svgLine.setAttributeNS(null, \"id\", \"line\" + FRAIS.activeFPElement + \"\" + firstPoint.id);
				firstPoint.svgLine.setAttributeNS(null, \"x1\", FRAIS.displayedXCoordinate(FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].x));
				firstPoint.svgLine.setAttributeNS(null, \"y1\", FRAIS.displayedYCoordinate(FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].y));
				firstPoint.svgLine.setAttributeNS(null, \"x2\", FRAIS.displayedXCoordinate(firstPoint.x));
				firstPoint.svgLine.setAttributeNS(null, \"y2\", FRAIS.displayedYCoordinate(firstPoint.y));
				firstPoint.svgLine.setAttributeNS(null, \"stroke\", \"rgb(27,165,229)\");
				firstPoint.svgLine.setAttributeNS(null, \"stroke-width\", \"2px\");
				firstPoint.svgElem.removeEventListener(\"click\",FRAIS.finishPolygonFPElement,false);
					
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.appendChild(firstPoint.svgLine);
				FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.setAttributeNS(null,\"fill\", \"black\");
				FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.addEventListener(\"click\",FRAIS.reopenFPElement,false);
				FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.removeEventListener(\"click\",FRAIS.removeFloorPoint,false);
				//FPElement is finished
				FRAIS.FPElements[FRAIS.activeFPElement].type=\"POLYGON\";
				FRAIS.FPElements[FRAIS.activeFPElement].finished = true;
				FRAIS.FPElements[FRAIS.activeFPElement].loaded = true;
				
				for(var i=1;i<=FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount;i++){
					FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[i].svgElem.addEventListener(\"click\", FRAIS.updateFinishedFPElement, false);
				}
				
				FRAIS.drawing = false;
				FRAIS.activeFPElement = null
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener(\"click\",FRAIS.finishLinestringFPElement,false);
				
				
		}
		if(type==\"LINESTRING\"){
			FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].addToScreen();
			FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.setAttributeNS(null,\"fill\", \"black\");
			if(FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount > 1){
				FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount-1].svgElem.setAttributeNS(null,\"fill\", \"red\");
			}
			FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.addEventListener(\"click\",FRAIS.reopenFPElement,false);
			FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].svgElem.removeEventListener(\"click\",FRAIS.removeFloorPoint,false);
			//FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount-1].svgElem.removeEventListener(\"click\",FRAIS.removeFloorPoint,false);
			FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[1].svgElem.removeEventListener(\"click\",FRAIS.finishPolygonFPElement,false);
			//FPElement is finished
			FRAIS.FPElements[FRAIS.activeFPElement].type=\"LINESTRING\";
			FRAIS.FPElements[FRAIS.activeFPElement].finished = true;
			FRAIS.FPElements[FRAIS.activeFPElement].loaded = true;
			
			for(var i=1;i<=FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount;i++){
					FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[i].svgElem.addEventListener(\"click\", FRAIS.updateFinishedFPElement, false);
			}
			
			FRAIS.drawing = false;
			FRAIS.activeFPElement = null
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener(\"click\",FRAIS.finishLinestringFPElement,false);
		}
		";
	}				
  
?>