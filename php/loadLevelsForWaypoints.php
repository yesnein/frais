<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP script for loading levels for waypoint editing

(function(){
<?php
require_once ("config.inc.php"); 
  $project=$_POST["projectId"];
  $building=$_POST["buildingId"];
	
  $level_sql = "SELECT * FROM ebene WHERE projekt_id=$project and haus_id=$building ORDER BY ebene_id ASC;";
  $waypoints_sql="SELECT * FROM wegpunkt WHERE projekt_id=$project and haus_id=$building;";
  $floorplans_sql="SELECT grundriss_id,ebene_id,haus_id,projekt_id,AsText(geom) geom_wkt FROM grundriss WHERE projekt_id=$project and haus_id=$building;";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );

//get levels from database
	$level_result = mysql_query ( $level_sql , $db);
//get way points from database	
	$waypoints_result = mysql_query ( $waypoints_sql , $db);
//get floorplans from database
	$floorplans_result = mysql_query ( $floorplans_sql , $db);
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
var navBarSelectEOption0Text=document.createTextNode("Ebene auswaehlen");
	navBarSelectEOption0.appendChild(navBarSelectEOption0Text);
	navBarSelectE.appendChild(navBarSelectEOption0);
	
	navBarSelectItemE.appendChild(navBarSelectE);
	navBarListE.appendChild(navBarSelectItemE);
	navBarSelectItemD.appendChild(navBarListE);


<?php
	if($level_result){
	for($i=0;$i< mysql_num_rows($level_result);$i++){ 
		$imagePath = mysql_result($level_result,$i,"grafik_pfad");
  		$level =mysql_result($level_result,$i,"ebene_id");
		$floor =mysql_result($level_result,$i,"stockwerk");
   		$fileName="../svg/level".$level.".svg";
		$file = fopen($fileName, "w+");
		$svgContent="<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?>
			<svg id=\"LayerSVG$level\" xmlns=\"http://www.w3.org/2000/svg\"
			xmlns:xlink=\"http://www.w3.org/1999/xlink\"
			xmlns:ev=\"http://www.w3.org/2001/xml-events\"
  			version=\"1.1\" baseProfile=\"full\"
  			width=\"800\" height=\"600\">
			<image xlink:href=\"../images/$imagePath\" id=\"FPImage$level\" x=\"0\" y=\"0\" width=\"800\" height=\"600\" preserveAspectRatio=\"xMaxYMax\" display=\"\" />
			</svg>";
		fwrite($file, $svgContent);
		fclose($file);
		
		$imageReferenceX= mysql_result($level_result,$i,"grafik_referenz_x");
		$imageReferenceY= mysql_result($level_result,$i,"grafik_referenz_y");
		$imageWidth= mysql_result($level_result,$i,"grafik_breite");
		$imageHeight= mysql_result($level_result,$i,"grafik_hoehe");
		$imageScale= mysql_result($level_result,$i,"grafik_massstab");
		
		if($imageWidth > $imageHeight){
			$levelScale = ($imageWidth*$imageScale)/800;
		}
		else{
			$levelScale = ($imageHeight*$imageScale)/600;
		}
		
		
   
echo"var navBarSelectEOption".($i+1)."=document.createElement(\"option\");
	navBarSelectEOption".($i+1).".value=".mysql_result($level_result,$i,"ebene_id").";
	var navBarSelectEOption".($i+1)."Text=document.createTextNode(\"".mysql_result($level_result,$i,"beschreibung")."\");
	navBarSelectEOption".($i+1).".appendChild(navBarSelectEOption".($i+1)."Text);
	navBarSelectE.appendChild(navBarSelectEOption".($i+1).");";	
echo"FRAIS.layers[++FRAIS.layers_count] = new FRAIS.Layer(FRAIS.layers_count,".mysql_result($level_result,$i,"ebene_id").",$floor,\"".mysql_result($level_result,$i,"beschreibung")."\",$levelScale,$imageWidth,$imageHeight,$imageReferenceX,$imageReferenceY);";
	}
	}
?>

<?php

	if($waypoints_result){
	for($i=0;$i< mysql_num_rows($waypoints_result);$i++){
		$wpID = mysql_result($waypoints_result,$i,"wp_id");
	    $wpX = mysql_result($waypoints_result,$i,"x");
   		$wpY = mysql_result($waypoints_result,$i,"y");
   		$wpType = mysql_result($waypoints_result,$i,"art");
		$wpDesc = mysql_result($waypoints_result,$i,"bezeichnung");
		$wpDest = mysql_result($waypoints_result,$i,"ziel");
		//if($wpDest==0) $wpDest=false; else $wpDest=true;
   		$wpLevel = mysql_result($waypoints_result,$i,"ebene_id");
   		$wpBuilding = mysql_result($waypoints_result,$i,"haus_id");
  		$wpProject = mysql_result($waypoints_result,$i,"projekt_id");
   
   		$neighbours_sql = "SELECT DISTINCT w.wp_id FROM wegpunkt w, nachbarpunkt n WHERE (w.wp_id=n.wp1_id AND n.wp2_id=$wpID) OR (w.wp_id=n.wp2_id AND n.wp1_id=$wpID);";
   		$neighbours_result = mysql_query ( $neighbours_sql , $db); 
	  	echo"var layer= FRAIS.getLayerByLevel($wpLevel);";
		echo"FRAIS.wayPoints[parseInt($wpID)]=new FRAIS.WayPoint($wpX,$wpY,$wpID,\"$wpType\",\"$wpDesc\",$wpDest,$wpLevel,$wpBuilding,$wpProject,layer.id";
		if($neighbours_result){for($j=0;$j< mysql_num_rows($neighbours_result);$j++){echo ",".mysql_result($neighbours_result,$j,"wp_id");;}}
		echo");";
		echo"FRAIS.layers[layer.id].wayPoints[FRAIS.layers[layer.id].wayPointsCount++]= $wpID;";
	}
	}

?>   
											
<?php 
//get the highest ID from waypoints table
	$maxID= mysql_query("SELECT MAX(wp_id) FROM wegpunkt", $db);
	if(mysql_result($maxID,0)){
		echo"FRAIS.maxPointId=".mysql_result($maxID,0);
	}
	else{
		echo"FRAIS.maxPointId=0";
		}
?>;

<?php

	if($floorplans_result){
		for($i=0;$i< mysql_num_rows($floorplans_result);$i++){
			$FPID = mysql_result($floorplans_result,$i,"grundriss_id");
   			$FPLevel = mysql_result($floorplans_result,$i,"ebene_id");
   			$FPBuilding = mysql_result($floorplans_result,$i,"haus_id");
  			$FPProject = mysql_result($floorplans_result,$i,"projekt_id");
   			$FPGeom = mysql_result($floorplans_result,$i,"geom_wkt");
		 
	  		echo"var layer= FRAIS.getLayerByLevel($FPLevel);";
			echo"FRAIS.FPElements[parseInt($FPID)]=new FRAIS.FPElement($FPID,$FPLevel,$FPBuilding,$FPProject,layer.id,\"\",true);";
			echo"FRAIS.FPElements[parseInt($FPID)].loadFloorpointsFromWKTGeometry(\"$FPGeom\");";
			echo"FRAIS.layers[layer.id].FPElements[FRAIS.layers[layer.id].FPElementsCount++]= $FPID;";
		}
	}

?>   
											
<?php 
//get the highest ID from floorplans table
	$maxFPID= mysql_query("SELECT MAX(grundriss_id) FROM grundriss", $db);
	if(mysql_result($maxFPID,0)){
		echo"FRAIS.maxFPElementsId=".mysql_result($maxFPID,0);
	}
	else{
		echo"FRAIS.maxFPElementsId=0";
		}
?>;

	FRAIS.activeBuilding=<?php echo $building ?>;
	FRAIS.activeProject=<?php echo $project ?>;
	
	}());
	