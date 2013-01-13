<?php

  // PHP script to create a graph from the waypoints in the database
  
  require_once ("config.inc.php"); 
  //import the classes for the creation of a graph
  require_once ("graph.php");
  
  $sql = "SELECT w.wp_id,w.x,w.y,w.art,w.haus_id,w.ebene_id,w.bezeichnung,e.stockwerk,e.beschreibung as ebeschreibung, h.beschreibung as hbeschreibung FROM wegpunkt w, ebene e, haus h WHERE w.ebene_id= e.ebene_id AND w.haus_id = h.haus_id";
  
  $db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
      or die ("keine Verbindung m&ooml;glich");

  mysql_select_db ( $CFG->dbname , $db );
	
  $ergebnis= mysql_query ( $sql , $db);
  
  $searchGraph = new graph();
  
  for ($i=0; $i < mysql_num_rows($ergebnis); $i++){
        ${"p".mysql_result($ergebnis,$i,"wp_id")}= new vertex();      
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->id= mysql_result($ergebnis,$i,"wp_id");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->x= mysql_result($ergebnis,$i,"x");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->y= mysql_result($ergebnis,$i,"y");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->type= mysql_result($ergebnis,$i,"art");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->building_id= mysql_result($ergebnis,$i,"haus_id");
		${"p".mysql_result($ergebnis,$i,"wp_id")}->building_desc= mysql_result($ergebnis,$i,"hbeschreibung");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->level_id= mysql_result($ergebnis,$i,"ebene_id");
		${"p".mysql_result($ergebnis,$i,"wp_id")}->level_desc= mysql_result($ergebnis,$i,"ebeschreibung");
		${"p".mysql_result($ergebnis,$i,"wp_id")}->level_floor= mysql_result($ergebnis,$i,"stockwerk");
        ${"p".mysql_result($ergebnis,$i,"wp_id")}->desc= mysql_result($ergebnis,$i,"bezeichnung");
        //${"p".mysql_result($ergebnis,$i,"WP_ID")}->desc2= mysql_result($ergebnis,$i,"bezeichnung2");
   		
		$neighbours_sql = "SELECT DISTINCT w.wp_id FROM wegpunkt w, nachbarpunkt n WHERE (w.wp_id=n.wp1_id AND n.wp2_id=".mysql_result($ergebnis,$i,"wp_id").") OR (w.wp_id=n.wp2_id AND n.wp1_id=".mysql_result($ergebnis,$i,"wp_id").");";
   		$neighbours_result = mysql_query ( $neighbours_sql , $db); 
		if($neighbours_result){
			for ($j=0;$j < mysql_num_rows($neighbours_result); $j++){
				${"p".mysql_result($ergebnis,$i,"wp_id")}->a_vertex[$j]= &${"p".mysql_result($neighbours_result,$j,"wp_id")};
			}
		}
        
        $searchGraph->add_vertex(${"p".mysql_result($ergebnis,$i,"wp_id")}); 
      
  }
 
?>
