<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading levels for waypoint editing in overview mode

(function(){
<?php
require_once ("config.inc.php"); 
  $project=$_POST["projectId"];
  //$building=$_POST["buildingId"];
	
  //$level_sql = "SELECT * FROM ebene WHERE projekt_id=$project ORDER BY ebene_id ASC;";
  $floor_sql = "SELECT DISTINCT stockwerk FROM ebene WHERE projekt_id=$project;";
  //$waypoints_sql="SELECT * FROM wegpunkt WHERE projekt_id=$project;";// and haus_id=$building;";
  //$floorplans_sql="SELECT grundriss_id,ebene_id,haus_id,projekt_id,AsText(geom) geom_wkt FROM grundriss WHERE projekt_id=$project;";// and haus_id=$building;";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

//get levels from database
	//$level_result = mysql_query ( $level_sql , $db);
//get floors from database
	$floor_result = mysql_query ( $floor_sql , $db);
//get way points from database	
	//$waypoints_result = mysql_query ( $waypoints_sql , $db);
//get floorplans from database
	//$floorplans_result = mysql_query ( $floorplans_sql , $db);
?>

var navBarSelectItemD= document.getElementById("navBarSelectItemD");

var navBarListE=document.createElement("ul");
	navBarListE.id="navBarListE";
	navBarListE.className="navBarList";
	
var navBarSelectItemE = document.createElement("li");
	navBarSelectItemE.id = "navBarSelectItemE";

var navBarSelectE=document.createElement("select");
	navBarSelectE.name="navBarSelectE";
	navBarSelectE.id="navBarSelectE";
	navBarSelectE.className="navBarSelect";
	navBarSelectE.size=1;
	navBarSelectE.onchange=FRAIS.chooseLayer;
	
var navBarSelectEOption0=document.createElement("option");
	navBarSelectEOption0.value=0;
var navBarSelectEOption0Text=document.createTextNode("Etage auswaehlen");
	navBarSelectEOption0.appendChild(navBarSelectEOption0Text);
	navBarSelectE.appendChild(navBarSelectEOption0);
	
	navBarSelectItemE.appendChild(navBarSelectE);
	navBarListE.appendChild(navBarSelectItemE);
	navBarSelectItemD.appendChild(navBarListE);

<?php 
	if($floor_result){
		for($i=0;$i< mysql_num_rows($floor_result);$i++){
			$layerFloor=mysql_result($floor_result,$i,"stockwerk");
			$floor_dims_sql="select min(X(PointN(ExteriorRing(envelope(g.geom)),1))) as minX, min(Y(PointN(ExteriorRing(envelope(g.geom)),1))) as minY, max(X(PointN(ExteriorRing(envelope(g.geom)),3))) as maxX, max(Y(PointN(ExteriorRing(envelope(g.geom)),3))) as maxY from ebene e, grundriss g where g.ebene_id= e.ebene_id and e.stockwerk=$layerFloor and g.projekt_id=$project;";
			$floor_dims_result = mysql_query ( $floor_dims_sql , $db);
			$minX=mysql_result($floor_dims_result,0,"minX");
			$minY=mysql_result($floor_dims_result,0,"minY");
			$maxX=mysql_result($floor_dims_result,0,"maxX");
			$maxY=mysql_result($floor_dims_result,0,"maxY");

			if( $minX && $minY  && $maxX && $maxY){
				
				$layerWidth=(int)$maxX - (int)$minX;
				$layerHeight=(int)$maxY - (int)$minY;
				
				if(($maxX/800) > ($maxY/600)){
					$layerScale = ($layerWidth/800)+0.2;
				}
				else{
					$layerScale = ($layerHeight/600)+0.2;
				}
				$fileName="../svg/level".$layerFloor.".svg";
				$file = fopen($fileName, "w+");
				$svgContent="<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?>
				<svg id=\"LayerSVG$layerFloor\" xmlns=\"http://www.w3.org/2000/svg\"
				xmlns:xlink=\"http://www.w3.org/1999/xlink\"
				xmlns:ev=\"http://www.w3.org/2001/xml-events\"
  				version=\"1.1\" baseProfile=\"full\"
  				width=\"800\" height=\"600\">
				</svg>";
				fwrite($file, $svgContent);
				fclose($file);
				
				echo"var navBarSelectEOption".($i+1)."=document.createElement(\"option\");
						navBarSelectEOption".($i+1).".value=$layerFloor;
					var navBarSelectEOption".($i+1)."Text=document.createTextNode(\"Etage $layerFloor\");
						navBarSelectEOption".($i+1).".appendChild(navBarSelectEOption".($i+1)."Text);
						navBarSelectE.appendChild(navBarSelectEOption".($i+1).");";	
				
				echo"FRAIS.layers[++FRAIS.layers_count]= new FRAIS.Layer(FRAIS.layers_count,$layerFloor,$layerFloor,\"Etage $layerFloor\",$layerScale,$layerWidth,$layerHeight,$minX-10,$minY-10);";
				echo"var layer= FRAIS.layers[FRAIS.layers_count];";
				
				$waypointsSql="SELECT w.* FROM wegpunkt w,ebene e WHERE e.ebene_id=w.ebene_id and e.stockwerk=$layerFloor and w.projekt_id=$project;";
				
				$waypointsResult= mysql_query ( $waypointsSql , $db);
				if($waypointsResult){
					for($j=0;$j< mysql_num_rows($waypointsResult);$j++){
						$wpID = mysql_result($waypointsResult,$j,"wp_id");
	    				$wpX = mysql_result($waypointsResult,$j,"x");
   						$wpY = mysql_result($waypointsResult,$j,"y");
   						$wpType = mysql_result($waypointsResult,$j,"art");
						$wpDesc = mysql_result($waypointsResult,$j,"bezeichnung");
						$wpDest = mysql_result($waypointsResult,$j,"ziel");
   						$wpLevel = mysql_result($waypointsResult,$j,"ebene_id");
   						$wpBuilding = mysql_result($waypointsResult,$j,"haus_id");
  						$wpProject = mysql_result($waypointsResult,$j,"projekt_id");
   
   						$neighbours_sql = "SELECT DISTINCT w.wp_id FROM wegpunkt w, nachbarpunkt n WHERE (w.wp_id=n.wp1_id AND n.wp2_id=$wpID) OR (w.wp_id=n.wp2_id AND n.wp1_id=$wpID);";
   						$neighbours_result = mysql_query ( $neighbours_sql , $db); 
	  				
						echo"FRAIS.wayPoints[parseInt($wpID)]=new FRAIS.WayPoint($wpX,$wpY,$wpID,\"$wpType\",\"$wpDesc\",$wpDest,$wpLevel,$wpBuilding,$wpProject,layer.id";
						if($neighbours_result){for($k=0;$k< mysql_num_rows($neighbours_result);$k++){echo ",".mysql_result($neighbours_result,$k,"wp_id");;}}
						echo");";
						echo"FRAIS.layers[layer.id].wayPoints[FRAIS.layers[layer.id].wayPointsCount++]= $wpID;";
					}
				}
				
				$floorplansSql="SELECT g.grundriss_id,g.ebene_id,g.haus_id,g.projekt_id,AsText(g.geom) geom_wkt FROM grundriss g,ebene e WHERE e.ebene_id=g.ebene_id AND e.stockwerk=$layerFloor AND g.projekt_id=$project;";
				$floorplansResult= mysql_query ( $floorplansSql , $db);
				
				if($floorplansResult){
					for($n=0;$n< mysql_num_rows($floorplansResult);$n++){
						$FPID = mysql_result($floorplansResult,$n,"grundriss_id");
   						$FPLevel = mysql_result($floorplansResult,$n,"ebene_id");
   						$FPBuilding = mysql_result($floorplansResult,$n,"haus_id");
  						$FPProject = mysql_result($floorplansResult,$n,"projekt_id");
   						$FPGeom = mysql_result($floorplansResult,$n,"geom_wkt");
		 
	  					//echo"var layer= FRAIS.getLayerByLevel($FPLevel);";
						echo"FRAIS.FPElements[parseInt($FPID)]=new FRAIS.FPElement($FPID,$FPLevel,$FPBuilding,$FPProject,layer.id,\"\",true);";
						echo"FRAIS.FPElements[parseInt($FPID)].loadFloorpointsFromWKTGeometry(\"$FPGeom\");";
						echo"FRAIS.layers[layer.id].FPElements[FRAIS.layers[layer.id].FPElementsCount++]= $FPID;";
					}
				}
			}
		}
	}

?>
	}());
	