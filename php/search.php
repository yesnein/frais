<?php header('content-type: text/javascript'); ?>
/////////////
// FRAIS
/////////////

// Ajax PHP-script to execute a way search and generate the output
<?php

  //Create a graph for the determination of the shortest path
  require_once("searchGraph.php");
  //Get the startpoint and the endpoint from the ajax-request
  $start= $_POST["startId"];
  $dest=$_POST["destId"];
 
  //Create the path for the shortest way with the Dijkstra-algorithm
  $path=$searchGraph->dijkstra($start, $dest);
  // If a way has been found, start the output
  if(count($path)> 1){
  	//Create the path in javascript
  	echo "FRAIS.path=new Array();";
	$n=0;
  	for ($i=0;$i <count($path);$i++){
  		//Filter out waypoints that only connect two levels, eg. stairs or lifts which are only connected to stairs or lifts
		if($i < count($path)-1){
			if($path[$i]->type == "TR"){
				if($path[$i-1]->type != "TR" || $path[$i+1]->type != "TR" ){
					echo "FRAIS.path[$n]=".$path[$i]->id.";";
					$n++;
				}
			}else if($path[$i]->type == "LF"){
				if($path[$i-1]->type != "LF" || $path[$i+1]->type != "LF" ){
					echo "FRAIS.path[$n]=".$path[$i]->id.";";
					$n++;
				}
			}else{
				echo "FRAIS.path[$n]=".$path[$i]->id.";";
				$n++;
			}
		}
		else{
			if($path[$i]->type == "TR"){
				if($path[$i-1]->type != "TR"){
					echo "FRAIS.path[$n]=".$path[$i]->id.";";
					$n++;
				}
			}else if($path[$i]->type == "LF"){
				if($path[$i-1]->type != "LF"){
					echo "FRAIS.path[$n]=".$path[$i]->id.";";
					$n++;
				}
			}else{
				echo "FRAIS.path[$n]=".$path[$i]->id.";";
				$n++;
			}
		}
  	}
	//Create an SQL statement that gets all layers that belong to the shortest path
	$levelSQL="SELECT DISTINCT w.ebene_id FROM wegpunkt w WHERE w.wp_id=".$path[0]->id;
	for ($i=1; $i < count($path);$i++){
		//Filter out waypoints that only connect two levels, eg. stairs or lifts which are only connected to stairs or lifts
		if($i < count($path)-1){
			if($path[$i]->type == "TR"){
				if($path[$i-1]->type != "TR" || $path[$i+1]->type != "TR" )
					$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}else if($path[$i]->type == "LF"){
				if($path[$i-1]->type != "LF" || $path[$i+1]->type != "LF" )
					$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}else{
				$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}
		}
		else{
			if($path[$i]->type == "TR"){
				if($path[$i-1]->type != "TR")
					$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}else if($path[$i]->type == "LF"){
				if($path[$i-1]->type != "LF")
					$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}else{
				$levelSQL=$levelSQL." or w.wp_id=".$path[$i]->id;
			}
		}
	}
	$levelSQL=$levelSQL.";";
	
	//execute the sql statement for the layers of the shortest path
	$levelResult= mysql_query($levelSQL,$db);
	
	if($levelResult){
		//Create an SQL statement that get the data of the layers that belong to the shortest path
		$levels_sql = "SELECT * FROM ebene WHERE ebene_id = ".mysql_result($levelResult,0,"ebene_id");	
		$levels="(e.ebene_id=".mysql_result($levelResult,0,"ebene_id");	
		$buildings_sql="SELECT DISTINCT haus_id FROM ebene WHERE ebene_id = ".mysql_result($levelResult,0,"ebene_id");	
		for ($i=1;$i< mysql_num_rows($levelResult);$i++){
			$buildings_sql= $buildings_sql." or ebene_id = ".mysql_result($levelResult,$i,"ebene_id");
			$levels_sql= $levels_sql." or ebene_id = ".mysql_result($levelResult,$i,"ebene_id");
			$levels= $levels." or e.ebene_id = ".mysql_result($levelResult,$i,"ebene_id");
		}
		$buildings_sql=$buildings_sql." ORDER BY haus_id;";
		$levels_sql=$levels_sql." ORDER BY haus_id;";
		$levels=$levels.")";
		//Create an sql statement to get the data for the waypoints of the shortest path
		$waypoints_sql="SELECT * FROM wegpunkt w WHERE w.wp_id=".$path[0]->id;
		for ($i=1; $i < count($path);$i++){
			//Filter out waypoints that only connect two levels, eg. stairs or lifts which are only connected to stairs or lifts
			if($i < count($path)-1){
				if($path[$i]->type == "TR"){
					if($path[$i-1]->type != "TR" || $path[$i+1]->type != "TR" )
			  			$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}else if($path[$i]->type == "LF"){
					if($path[$i-1]->type != "LF" || $path[$i+1]->type != "LF" )
						$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}else{
					$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}
			}
			else{
				if($path[$i]->type == "TR"){
					if($path[$i-1]->type != "TR")
						$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}else if($path[$i]->type == "LF"){
					if($path[$i-1]->type != "LF")
						$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}else{
					$waypoints_sql=$waypoints_sql." or w.wp_id=".$path[$i]->id;
				}
			}
		}
		$waypoints_sql=$waypoints_sql.";";
		
		//Create the sql statement for the floorplans
		$floorplans_sql="SELECT grundriss_id,ebene_id,haus_id,projekt_id,AsText(geom) geom_wkt FROM grundriss WHERE ebene_id = ".mysql_result($levelResult,0,"ebene_id");
		for ($i=1;$i< mysql_num_rows($levelResult);$i++){
			$floorplans_sql= $floorplans_sql." or ebene_id = ".mysql_result($levelResult,$i,"ebene_id");
		}
		$floorplans_sql=$floorplans_sql.";";
		
		//Create the sql statement for the calculation of the display scale of the search results
		$floorDimsSQL="select min(X(PointN(ExteriorRing(envelope(g.geom)),1))) as minX, min(Y(PointN(ExteriorRing(envelope(g.geom)),1))) as minY, max(X(PointN(ExteriorRing(envelope(g.geom)),3))) as maxX, max(Y(PointN(ExteriorRing(envelope(g.geom)),3))) as maxY from ebene e, grundriss g where g.ebene_id= ".mysql_result($levelResult,0,"ebene_id");
		for ($i=1;$i< mysql_num_rows($levelResult);$i++){
			$floorDimsSQL= $floorDimsSQL." or g.ebene_id = ".mysql_result($levelResult,$i,"ebene_id");
		}
		$floorDimsSQL=$floorDimsSQL.";";
		
		$floorDimsResult = mysql_query ( $floorDimsSQL , $db);
		
		$maxFloorSQL= str_replace("*", "max(stockwerk) m", $levels_sql);
		$maxFloorResult = mysql_query ( $maxFloorSQL , $db);
		$maxFloor=mysql_result($maxFloorResult,0,"m");
		
		echo"FRAIS.displayHeight=600-".$maxFloor*30.0.";";
		
		//Calculate the display scale
		if($floorDimsResult){
			$minX=mysql_result($floorDimsResult,0,"minX");
			$minY=mysql_result($floorDimsResult,0,"minY");
			$maxX=mysql_result($floorDimsResult,0,"maxX");
			$maxY=mysql_result($floorDimsResult,0,"maxY");
			if( $minX && $minY  && $maxX && $maxY){
				
				$layerWidth=(int)$maxX - (int)$minX;
				$layerHeight=(int)$maxY - (int)$minY;
				if(($maxX/800) > ($maxY/600)){
					$layerScale = ($layerWidth)/(800-($maxFloor*30))+0.2;
				}
				else{
					$layerScale = ($layerHeight)/(600-($maxFloor*30))+0.2;
				}
			}
		}
		//execute the sql-statements
		$levels_result = mysql_query ( $levels_sql , $db);
		
		$buildings_result= mysql_query ( $buildings_sql , $db);
		
		$waypoints_result = mysql_query ( $waypoints_sql , $db);
		
		$floorplans_result = mysql_query ( $floorplans_sql , $db);
		
		if($levels_result){
			//Create the colors for the output
			echo "FRAIS.Colors=[\"red\",\"green\",\"orange\",\"blue\",\"yellow\",\"purple\",\"lightgreen\",\"fuchsia\",\"darkgrey\",\"gold\",\"dodgerblue\",\"salmon\",\"lime\",\"slategray\",\"plum\"];";
			$Colors=array("red","green","orange","blue","yellow","purple","lightgreen","fuchsia","darkgrey","gold","dodgerblue","salmon","lime","slategray","plum");
			$searchColors=array();
			echo "FRAIS.searchLayers=new Array();";
			echo "FRAIS.searchColors=new Array();";
			echo "FRAIS.searchLayers[".mysql_result($levels_result,0,"ebene_id")."]=0;";
			echo "FRAIS.searchColors[".mysql_result($levels_result,0,"ebene_id")."]=FRAIS.Colors[0];";
			$searchColors[mysql_result($levels_result,0,"ebene_id")]=$Colors[0];
			//floorNum is used to determine the number of floors to be displayed 
			$floorNum=1;
			$colorNum=1;
			for($i=1;$i< mysql_num_rows($levels_result);$i++){
				$buildings=$buildings." or haus_id=".mysql_result($levels_result,$i,"haus_id");
				if((mysql_result($levels_result,$i,"stockwerk") - mysql_result($levels_result,$i-1,"stockwerk")) > 1 
					&& (mysql_result($levels_result,$i,"haus_id") == (mysql_result($levels_result,$i-1,"haus_id")))){
					$floorNum++;
				}
				else if((mysql_result($levels_result,$i,"haus_id")) == (mysql_result($levels_result,$i-1,"haus_id"))){
					$floorNum=mysql_result($levels_result,$i,"stockwerk")-mysql_result($levels_result,$i-1,"stockwerk")+1;
				}else{
					$floorNum=mysql_result($levels_result,$i,"stockwerk");
				}
				echo "FRAIS.searchLayers[".mysql_result($levels_result,$i,"ebene_id")."]=parseInt(".$floorNum.")-1;";
				echo "FRAIS.searchColors[".mysql_result($levels_result,$i,"ebene_id")."]=FRAIS.Colors[parseInt(".$colorNum.")];";
				$searchColors[mysql_result($levels_result,$i,"ebene_id")]=$Colors[(int)$colorNum];
				$colorNum++;
				
			}
			
		}
		$buildings="";
		if($buildings_result){
			$buildings=$buildings."(h.haus_id=".mysql_result($buildings_result,0,"haus_id");
			for($i=1;$i< mysql_num_rows($buildings_result);$i++){
				$buildings=$buildings." OR h.haus_id=".mysql_result($buildings_result,$i,"haus_id");
			}
			$buildings=$buildings.")";
		}
		//get the necessary data for the legend from the database
		$legend_sql="SELECT h.beschreibung hbeschreibung, h.haus_id, e.beschreibung ebeschreibung, e.ebene_id  FROM ebene e, haus h WHERE e.haus_id=h.haus_id AND $levels AND $buildings;";
		
		$legend_result=mysql_query ( $legend_sql , $db);
		
		//Create a javascript function to create a legend for the output on the client-side
		if($legend_result){
			$legend=" FRAIS.createLegend= function(SVGDoc){
						 if(SVGDoc != null){
						 	var defs=SVGDoc.documentElement.childNodes[1];
							
							var symbol = SVGDoc.createElementNS(FRAIS.svgNS,\"symbol\");
								symbol.setAttributeNS(null, \"id\", \"legend\");
							var frame = SVGDoc.createElementNS(FRAIS.svgNS,\"rect\");
								frame.setAttributeNS(null, \"x\", \"5\");
								frame.setAttributeNS(null, \"y\", \"5\");
								frame.setAttributeNS(null, \"width\", \"200\");
								frame.setAttributeNS(null, \"height\", \"".(mysql_num_rows($legend_result)*30+50)."\");
								frame.setAttributeNS(null, \"stroke\", \"black\");
								frame.setAttributeNS(null, \"stroke-opacity\", \"0.5\");
								frame.setAttributeNS(null, \"stroke-width\", \"1px\");
								frame.setAttributeNS(null, \"fill\", \"white\");
								frame.setAttributeNS(null, \"fill-opacity\", \"0.5\");
								
								symbol.appendChild(frame);
								
							var start = SVGDoc.createElementNS(FRAIS.svgNS,\"circle\");
								start.setAttributeNS(null, \"cx\", \"20\");
								start.setAttributeNS(null, \"cy\", \"18\");
								start.setAttributeNS(null, \"r\", \"7\");
								start.setAttributeNS(null, \"stroke\", \"none\");
								start.setAttributeNS(null, \"fill\", \"".$searchColors[$path[0]->level_id]."\");
								
								symbol.appendChild(start);
								
							var startText=SVGDoc.createElementNS(FRAIS.svgNS,\"text\");
								startText.setAttributeNS(null, \"x\", \"35\");
								startText.setAttributeNS(null, \"y\", \"24\");
								startText.setAttributeNS(null, \"style\", \"font-size: 12; font-weight:normal; font-family:Arial,sans;\");
								startText.appendChild(SVGDoc.createTextNode(\"".$path[0]->desc."\"));
								
								symbol.appendChild(startText);
								
							
							var destMarker = SVGDoc.createElementNS(FRAIS.svgNS,\"marker\");
								destMarker.setAttributeNS(null, \"orient\", \"auto\");
								destMarker.setAttributeNS(null, \"id\", \"destMarker\");
								destMarker.setAttributeNS(null, \"refX\", \"0\");
								destMarker.setAttributeNS(null, \"refY\", \"0\");
								destMarker.setAttributeNS(null, \"style\",\"overflow:visible\");
							var destMarkerPath=SVGDoc.createElementNS(FRAIS.svgNS, \"path\");
								destMarkerPath.setAttributeNS(null, \"d\", \"M 0.0,0.0 L 2.5,-2.5 L 0.0,0.0 L 2.5,2.5 L 0.0,0.0 z\");
								destMarkerPath.setAttributeNS(null, \"stroke\",\"".$searchColors[$path[count($path)-1]->level_id]."\");
								destMarkerPath.setAttributeNS(null, \"stroke-width\",\"0.75px\");
								destMarkerPath.setAttributeNS(null,\"style\", \"fill-rule:evenodd;marker-start:none;fill:".$searchColors[$path[count($path)-1]->level_id]."\");
								destMarkerPath.setAttributeNS(null,\"transform\",\"scale(1.0) rotate(180)\");
			
								destMarker.appendChild(destMarkerPath);
								defs.appendChild(destMarker);
							
							var end = SVGDoc.createElementNS(FRAIS.svgNS,\"line\");
								end.setAttributeNS(null, \"x1\", \"10\");
								end.setAttributeNS(null, \"y1\", \"42\");
								end.setAttributeNS(null, \"x2\", \"30\");
								end.setAttributeNS(null, \"y2\", \"42\");
								end.setAttributeNS(null, \"stroke-width\", \"4\");
								end.setAttributeNS(null, \"stroke\", \"".$searchColors[$path[count($path)-1]->level_id]."\");
								end.setAttributeNS(null, \"style\", \"marker-end:url(#destMarker)\");
								
								
								symbol.appendChild(end)
								
							var endText=SVGDoc.createElementNS(FRAIS.svgNS,\"text\");
								endText.setAttributeNS(null, \"x\", \"35\");
								endText.setAttributeNS(null, \"y\", \"47\");
								endText.setAttributeNS(null, \"style\", \"font-size: 12; font-weight:normal; font-family:Arial,sans;\");
								endText.appendChild(SVGDoc.createTextNode(\"".$path[count($path)-1]->desc."\"));
								
								symbol.appendChild(endText);";
								
					for($i=0;$i<mysql_num_rows($legend_result);$i++){
					  	$legend.="var layerBox$i = SVGDoc.createElementNS(FRAIS.svgNS,\"rect\");
								layerBox$i.setAttributeNS(null, \"x\", \"10\");
								layerBox$i.setAttributeNS(null, \"y\", \"".(($i+1)*30+30)."\");
								layerBox$i.setAttributeNS(null, \"width\", \"20\");
								layerBox$i.setAttributeNS(null, \"height\", \"20\");
								layerBox$i.setAttributeNS(null, \"stroke\", \"".$searchColors[mysql_result($legend_result,$i,"ebene_id")]."\");
								layerBox$i.setAttributeNS(null, \"sroke-opacity\", \"0.4\");
								layerBox$i.setAttributeNS(null, \"stroke-width\", \"2px\");
								layerBox$i.setAttributeNS(null, \"fill\", \"".$searchColors[mysql_result($legend_result,$i,"ebene_id")]."\");
								layerBox$i.setAttributeNS(null, \"fill-opacity\", \"0.2\")
								
								symbol.appendChild(layerBox$i);
								
								var layerText$i = SVGDoc.createElementNS(FRAIS.svgNS,\"text\");
									layerText$i.setAttributeNS(null, \"x\", \"35\");
									layerText$i.setAttributeNS(null, \"y\", \"".(($i+1)*30+45)."\");
									layerText$i.setAttributeNS(null, \"style\", \"font-size: 12; font-weight:normal; font-family:Arial,sans;\");
									
									layerText$i.appendChild(SVGDoc.createTextNode(\"".mysql_result($legend_result,$i,"ebeschreibung")." in ".mysql_result($legend_result,$i,"hbeschreibung")."\"));
									
								symbol.appendChild(layerText$i);";
					}
			$legend.="
							
						defs.appendChild(symbol);
					}
				};";
		echo $legend;
		/*	$legend=$legend."<symbol id=\"legend\">
								<rect x=\"5\" y=\"5\" width=\"180\" height=\"".(mysql_num_rows($legend_result)*30+50)."\" stroke=\"black\" stroke-opacity=\"0.5\" stroke-width=\"1px\" fill=\"white\" fill-opacity=\"0.5\"/>
								<circle cx=\"20\" cy=\"18\" r=\"7\" stroke=\"none\" fill=\"".$searchColors[$path[0]->level_id]."\" />
								<text x=\"35\" y=\"24\" style=\"font-size: 12; font-weight:normal; font-family:Arial,sans;\">".$path[0]->desc."</text>
								<line x1=\"10\" y1=\"42\" x2=\"30\" y2=\"42\" stroke-width=\"4\" stroke=\"".$searchColors[$path[count($path)-1]->level_id]."\" style=\"marker-end:url(#Arrow)\"/>  
								<text x=\"35\" y=\"47\" style=\"font-size: 12; font-weight:normal; font-family:Arial,sans;\">".$path[count($path)-1]->desc."</text>";
			for($i=0;$i<mysql_num_rows($legend_result);$i++){
				$legend=$legend."<rect x=\"10\" y=\"".(($i+1)*30+30)."\" width=\"20\" height=\"20\" stroke=\"".$searchColors[mysql_result($legend_result,$i,"ebene_id")]."\" stroke-opacity=\"0.4\" stroke-width=\"2px\" fill=\"".$searchColors[mysql_result($legend_result,$i,"ebene_id")]."\" fill-opacity=\"0.2\"/>
								<text x=\"35\" y=\"".(($i+1)*30+45)."\" style=\"font-size: 12; font-weight:normal; font-family:Arial,sans;\">".mysql_result($legend_result,$i,"ebeschreibung")." in ".mysql_result($legend_result,$i,"hbeschreibung")."</text>";
			}
			$legend=$legend."</symbol>";
		*/
		}
		//Create the SVG of the layer
   		$fileName="../svg/level0.svg";
		$file = fopen($fileName, "w");
		$svgContent="<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?>
			<svg id=\"LayerSVG0\" xmlns=\"http://www.w3.org/2000/svg\"
			xmlns:xlink=\"http://www.w3.org/1999/xlink\"
			xmlns:ev=\"http://www.w3.org/2001/xml-events\"
  			version=\"1.1\" baseProfile=\"full\"
  			width=\"800\" height=\"600\"
			viewBox=\"0 0 800 600\" >
			
			<defs>
					<symbol id=\"treppe\" style=\"stroke:black\">
      					<rect x =\"0\" y =\"0\" width =\"20\" height =\"20\" style=\"stroke:black;stroke-width:2;fill:white\"/>
  						<polyline points=\"0,16.8 4,16.8 4,13.4 8,13.4 8,10 12,10 12,6.6 16,6.6 16,3.4 20,3.4\" style=\"stroke:black;stroke-width:2;fill:none\" />
    				</symbol>
    				
					<symbol id=\"lift\" style=\"stroke:black\">
    					<rect x =\"0\" y =\"0\" width =\"20\" height =\"20\" style=\"stroke:black;stroke-width:2;fill:white\"/>
						<line x1= \"6\" y1 =\"4\" x2= \"6\" y2 =\"16\" style=\"stroke:black;stroke-width:3.5; marker-end:url(#Arrow);\"/>
						<line x1= \"14\" y1 =\"16\" x2= \"14\" y2 =\"4\" style=\"stroke:black;stroke-width:3.5; marker-end:url(#Arrow);\"/>
					</symbol>
					
					<symbol id=\"walk\" style=\"stroke:black\">
    					<rect x =\"0\" y =\"0\" width =\"20\" height =\"20\" style=\"stroke:black;stroke-width:2;fill:white\"/>
						<circle cx=\"10\" cy=\"5\" r=\"3\" style=\"stroke:black;stroke-width:2;fill:white\" />
						<line x1=\"10\" x2=\"10\" y1=\"8\" y2=\"14\" style=\"stroke:black;stroke-width:2\" />
						<line x1=\"10\" x2=\"6\" y1=\"14\" y2=\"18\" style=\"stroke:black;stroke-width:2\" />
						<line x1=\"10\" x2=\"14\" y1=\"14\" y2=\"18\" style=\"stroke:black;stroke-width:2\" />
						<line x1=\"6\" x2=\"11\" y1=\"14\" y2=\"11\" style=\"stroke:black;stroke-width:2\" />
						<line x1=\"10\" x2=\"14\" y1=\"11\" y2=\"9\" style=\"stroke:black;stroke-width:2\" />
					</symbol>	
					
					<marker id=\"pf1\"
      					viewBox=\"0 0 10 10\" refX=\"0\" refY=\"5\"
      					markerUnits=\"strokeWidth\"
      					markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\">
      					<path d=\"M 0,0 l 10,5 l -10,5 z\" />
    				</marker>
    				<marker id=\"ci1\"
      					viewBox=\"0 0 10 10\" refX=\"5\" refY=\"5\"
      					markerWidth=\"5\" markerHeight=\"5\"
      					orient=\"auto\" >
      					<circle cx =\"5\" cy =\"5\" r =\"5\"
        				fill=\"black\" stroke=\"black\" stroke-width=\".5\" />
    				</marker>
                    <marker
                    orient=\"auto\"
                     refY=\"0.0\"
                     refX=\"0.0\"
                     id=\"Arrow\"
                     style=\"overflow:visible;\">
                     	<path d=\"M 0.0,0.0 L 1.25,-1.25 L 0.0,0.0 L 1.25,1.25 L 0.0,0.0 z \"
                      		style=\"fill-rule:evenodd;stroke:black;stroke-width:0.5;marker-start:none;fill:black;\"
                      	transform=\"scale(1.0) rotate(180)\" />
                      </marker>
			</defs>
			</svg>";
		fwrite($file, $svgContent);
		fclose($file);
		
		//Create one layer for displaying all waypoints and floorplans and one layer for displaying the zoom view
		echo"FRAIS.layers[1] = new FRAIS.Layer(1,0,0,\"\",$layerScale,$layerWidth,$layerHeight,$minX-10,$minY-10);";
		echo"FRAIS.layers[2] = new FRAIS.Layer(2,0,0,\"\",$layerScale,$layerWidth,$layerHeight,$minX-10,$minY-10);";
		
		//Create the waypoints of the shortest path 
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
	  	
			echo"FRAIS.wayPoints[parseInt($wpID)]=new FRAIS.WayPoint($wpX,$wpY,$wpID,\"$wpType\",\"$wpDesc\",$wpDest,$wpLevel,$wpBuilding,$wpProject,1";
			if($neighbours_result){for($j=0;$j< mysql_num_rows($neighbours_result);$j++){echo ",".mysql_result($neighbours_result,$j,"wp_id");;}}
			echo");";
			echo"FRAIS.layers[1].wayPoints[FRAIS.layers[1].wayPointsCount++]= $wpID;";
			echo"FRAIS.layers[2].wayPoints[FRAIS.layers[2].wayPointsCount++]= $wpID;";
		}
		//Create the floorplans
		if($floorplans_result){
			for($i=0;$i< mysql_num_rows($floorplans_result);$i++){
				$FPID = mysql_result($floorplans_result,$i,"grundriss_id");
   				$FPLevel = mysql_result($floorplans_result,$i,"ebene_id");
   				$FPBuilding = mysql_result($floorplans_result,$i,"haus_id");
  				$FPProject = mysql_result($floorplans_result,$i,"projekt_id");
   				$FPGeom = mysql_result($floorplans_result,$i,"geom_wkt");
		 
				echo"FRAIS.FPElements[parseInt($FPID)]=new FRAIS.FPElement($FPID,$FPLevel,$FPBuilding,$FPProject,1,\"\",true);";
				echo"FRAIS.FPElements[parseInt($FPID)].loadFloorpointsFromWKTGeometry(\"$FPGeom\");";
				echo"FRAIS.layers[1].FPElements[FRAIS.layers[1].FPElementsCount++]= $FPID;";
				echo"FRAIS.layers[2].FPElements[FRAIS.layers[2].FPElementsCount++]= $FPID;";
			}
		}
	}
		
	}
	//Create the text description of the search results
	require_once("createTextDescription.php");
	//Switch the layer mode to overview
	echo"FRAIS.layerMode=\"overview\";";
	//load the layer for the search results
	echo"FRAIS.layers[1].loadSearchLayer(FRAIS.layers[1]);";
	//load the layer for the zoom view of the search results
	echo"FRAIS.layers[2].loadSearchLayer(FRAIS.layers[2]);";
	//create the text description for the search results
	echo"if(typeof(FRAIS.createTextDescription)==\"function\")FRAIS.createTextDescription();";

	
	echo"$(\"main\").style.backgroundColor=\"white\";";
	
	echo"var clearer = document.createElement(\"div\");";
	echo"clearer.style.clear=\"both\";";
	echo"$(\"main\").appendChild(clearer);";
	
  }else{
  	//show that a way could not be found
  	echo"alert(\"Es konnte kein Weg gefunden werden\");";
  }
?>
