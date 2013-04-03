/////////////////
// FRAIS 
/////////////////

// Ajax PHP script generating a javascript function  that generates the text description of the shortest path
<?php
require_once ("config.inc.php");
	//Skript f�r die textliche Wegbeschreibung 
	class punkt {
		var $id;
		var $x;
		var $y;
		var $ebene;
		var $desc;
		var $typ;
		var $gebaeude;
		var $bdesc;
		
		function add_punkt($value){
			$this->id=$value->id;
			$this->x=$value->x;
			$this->y=$value->y;
			$this->ebene=$value->level_id;
			$this->ldesc = $value->level_desc;
			$this->lfloor = $value->level_floor;
			$this->desc=$value->desc;
			$this->typ=$value->type;
			$this->gebaeude=$value->building_id;
			$this->bdesc = $value->building_desc;
		}
		function add_bui_desc($value){
			$this->bdesc = $value;
		}
		function add_level_desc($value){
			$this->ldesc = $value;
		}
	}
	$text="FRAIS.createTextDescription= function(){
			if(document.getElementById(\"main\")!=null){
				var descDiv=document.createElement(\"div\");
					descDiv.style.width=\"380px\";
					descDiv.style.padding=\"20px 0px 0px 20px\";
					descDiv.style.cssFloat=\"right\";
					descDiv.style.backgroundColor=\"white\";
					descDiv.style.zIndex=\"10\";
					
				var descList=document.createElement(\"ul\");
					descList.style.textAlign=\"left\";
					descList.style.marginLeft=\"15px\";
					descList.style.fontFamily=\"Arial,sans\";
					descList.style.fontSize=\"16px\";
				var descHeader=document.createElement(\"li\");
					descHeader.style.listStyle=\"none\";
					descHeader.style.fontWeight=\"bold\";
					descHeader.style.fontSize=\"20px\";
					descHeader.style.textIndent=\"0px\";
					descHeader.appendChild(document.createTextNode(\"Wegbeschreibung\"));
				
				descList.appendChild(descHeader);
					
		";
	$point = array();
	$i=1;
	foreach($path as $value){
		$point[$i] = new punkt;
		$point[$i]->add_punkt($value);
		$i++;
	}
	/*
	$db = mysql_connect($CFG->dbhost, $CFG->dbuser, $CFG->dbpass)  
    	or die ("keine Verbindung m&ooml;glich");

	mysql_select_db ( $CFG->dbname , $db );
	
	$sql = 'SELECT beschreibung FROM haus WHERE haus_id='.$point[1]->gebaeude;
	$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());
	$erg = mysql_fetch_array($ergebnis);
	$point[1]->add_bui_desc ($erg["beschreibung"]);
	
	$sql = 'SELECT beschreibung FROM ebene WHERE ebene_id='.$point[1]->ebene;
	$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());
	$erg = mysql_fetch_array($ergebnis);
	$point[1]->add_level_desc ($erg["beschreibung"]);
	
	$sql ='SELECT beschreibung FROM haus WHERE haus_id='.$point[count($point)]->gebaeude;
	$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());
	$erg = mysql_fetch_array($ergebnis);
	
	$point[count($point)]->add_bui_desc ($erg["beschreibung"]);
	
	$sql ='SELECT beschreibung FROM ebene WHERE ebene_id='.$point[count($point)]->ebene;
	$ergebnis = mysql_query ( $sql , $db) 
	  or die (mysql_error());
	$erg = mysql_fetch_array($ergebnis);
	
	$point[count($point)]->add_level_desc ($erg["beschreibung"]);
	*/
	//echo"<ul>";
	$text.="var textStart=document.createElement(\"li\");
				textStart.appendChild(document.createTextNode(\"Ihr Weg beginnt bei ".$point[1]->desc.", ".$point[1]->ldesc.", ".$point[1]->bdesc."\"));
				
				descList.appendChild(textStart);
		";
	//echo "<li>Ihr Weg beginnt bei <b>".$point[1]->desc."</b> auf <b>Etage ".$point[1]->ebene."</b> im <b>Haus ".$point[1]->bdesc;
	//echo "</b>.</li>";
	$dist=0;
    // Berechnung der Richtungsangaben
	for ($i=2;$i<=count($point);$i++){
		$fl1 = $point[$i-1]->x * $point[$i]->y - $point[$i-1]->y * $point[$i]->x;
		$fl2 = $point[$i]->x * $point[$i+1]->y - $point[$i]->y * $point[$i+1]->x;
		$fl3 = $point[$i+1]->x * $point[$i-1]->y - $point[$i+1]->y * $point[$i-1]->x;
		$flaeche = ($fl1 + $fl2 + $fl3)/2;
        // Distanzberechnungen und Richtungsangaben
        if(($point[$i]->typ!="LF")&&($point[$i]->typ!="TR")&&($point[$i-1]->typ!="LF")&&($point[$i-1]->typ!="TR")){
        if($point[$i]->x==$point[$i-1]->x) $dist+= sqrt(($point[$i]->y-$point[$i-1]->y)*($point[$i]->y-$point[$i-1]->y));
        if($point[$i]->y==$point[$i-1]->y) $dist+= sqrt(($point[$i]->x-$point[$i-1]->x)*($point[$i]->x-$point[$i-1]->x));
        if(($point[$i]->x!=$point[$i-1]->x)&&($point[$i]->y!=$point[$i-1]->y)){
        $dist+= sqrt(pow(($point[$i]->x-$point[$i-1]->x),2) + pow(($point[$i]->y-$point[$i-1]->y),2));}
        }
        
		if(($point[$i]->typ=="LF")&&($point[$i-1]->typ!="LF")){
        
            if($point[$i]->x==$point[$i-1]->x) $dist+= sqrt(($point[$i]->y-$point[$i-1]->y)*($point[$i]->y-$point[$i-1]->y));
            if($point[$i]->y==$point[$i-1]->y) $dist+= sqrt(($point[$i]->x-$point[$i-1]->x)*($point[$i]->x-$point[$i-1]->x));
            if(($point[$i]->x!=$point[$i-1]->x)&&($point[$i]->y!=$point[$i-1]->y)){
            $dist+= sqrt(pow(($point[$i]->x-$point[$i-1]->x),2) + pow(($point[$i]->y-$point[$i-1]->y),2));}
        
        //$text = $text."<li>Gehen Sie ".(int)$dist." m gerade aus zum Fahrstuhl";
			$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m gerade aus zum Fahrstuhl\"));
				
				descList.appendChild(text$i);";
        $dist=0;
		}
        
        if(($point[$i]->typ=="TR")&&($point[$i-1]->typ!="TR")){
        
            if($point[$i]->x==$point[$i-1]->x) $dist+= sqrt(($point[$i]->y-$point[$i-1]->y)*($point[$i]->y-$point[$i-1]->y));
            if($point[$i]->y==$point[$i-1]->y) $dist+= sqrt(($point[$i]->x-$point[$i-1]->x)*($point[$i]->x-$point[$i-1]->x));
            if(($point[$i]->x!=$point[$i-1]->x)&&($point[$i]->y!=$point[$i-1]->y)){
            $dist+= sqrt(pow(($point[$i]->x-$point[$i-1]->x),2) + pow(($point[$i]->y-$point[$i-1]->y),2));}
        
        //$text = $text."<li>Gehen Sie ".(int)$dist." m gerade aus zur Treppe";
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m gerade aus zur Treppe.\"));
				
				descList.appendChild(text$i);";
        $dist=0;}
        //echo"alert(\"".abs($flaeche)."\"+\" \"+\"".(abs($fl1)/33.)."\"+\" \"+\"".(abs($fl2)/33.)."\"+\" \"+\"".(abs($fl3)/33.)."\");";
        if ($flaeche > 0 && $i!=count($point)){
            if($point[$i-1]->typ=="LF" && $point[$i]->typ!="LF"){
                //$text = $text."<li>Verlassen Sie den Fahrstuhl, und biegen Sie dann links ab.</li>";
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Verlassen Sie den Fahrstuhl, und biegen Sie dann links ab.\"));
				
				descList.appendChild(text$i);";
            }   
            if($point[$i-1]->typ=="TR" && $point[$i]->typ!="TR"){
                //$text = $text."<li>Verlassen Sie die Treppe, und biegen Sie dann links ab.</li>";
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Verlassen Sie die Treppe, und biegen Sie dann links ab.\"));
				
				descList.appendChild(text$i);";
            }
                
            if(($point[$i]->typ!="LF")&&($point[$i]->typ!="TR")&&($point[$i-1]->typ!="LF")&&($point[$i-1]->typ!="TR")){
                
                //$text = $text."<li>Gehen Sie ".(int)$dist." m gerade aus, und biegen Sie dann links ab.</li>";
				if(abs($flaeche) < abs($fl1)/50. && abs($flaeche) < abs($fl2)/50. && abs($flaeche) < abs($fl3)/50.){
					
				}else{
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m gerade aus, und biegen Sie dann links ab.\"));
				
				descList.appendChild(text$i);";
                $dist=0;
				}
            }
		} else if ($flaeche < 0 && $i!=count($point)){
            if($point[$i-1]->typ=="LF" && $point[$i]->typ!="LF"){
			//$text = $text."<li>Verlassen Sie den Fahrstuhl, und biegen Sie dann rechts ab.</li>";  
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Verlassen Sie den Fahrstuhl, und biegen Sie dann rechts ab.\"));
				
				descList.appendChild(text$i);"; 
			}
            if($point[$i-1]->typ=="TR" && $point[$i]->typ!="TR"){
            	//$text = $text."<li>Verlassen Sie die Treppe, und biegen Sie dann rechts ab.</li>";
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Verlassen Sie die Treppe, und biegen Sie dann rechts ab.\"));
				
				descList.appendChild(text$i);"; 
			}
            if(($point[$i]->typ!="LF")&&($point[$i]->typ!="TR")&&($point[$i-1]->typ!="LF")&&($point[$i-1]->typ!="TR")){
                   
		        //$text = $text."<li>Gehen Sie ".(int)$dist." m gerade aus, und biegen Sie dann rechts ab.</li>";
				if(abs($flaeche) < abs($fl1)/33. && abs($flaeche) < abs($fl2)/33. && abs($flaeche) < abs($fl3)/33.){
					
				}else{
				$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m gerade aus, und biegen Sie dann rechts ab.\"));
				
				descList.appendChild(text$i);"; 
                $dist=0;
				}
            }
        
		}
		
		//Angaben f�r den Zielpunkt
        if($i==(count($point))){ 
            if($point[$i-1]->typ=="LF"){
            if($point[$i]->x==$point[$i-1]->x) $dist+= sqrt(($point[$i]->y-$point[$i-1]->y)*($point[$i]->y-$point[$i-1]->y));
            if($point[$i]->y==$point[$i-1]->y) $dist+= sqrt(($point[$i]->x-$point[$i-1]->x)*($point[$i]->x-$point[$i-1]->x));
            if(($point[$i]->x!=$point[$i-1]->x)&&($point[$i]->y!=$point[$i-1]->y)){
            $dist+= sqrt(pow(($point[$i]->x-$point[$i-1]->x),2) + pow(($point[$i]->y-$point[$i-1]->y),2));}
            
        //$text = $text."<li>Gehen Sie ".(int)$dist." m bis zu <b>".$point[count($point)]->desc."</b> auf <b>Etage ".$point[count($point)]->ebene."</b> im <b>Haus ".$point[count($point)]->bdesc."</b>.</li>";  
            $text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m bis zu ".$point[count($point)]->desc.", ".$point[count($point)]->ldesc." , ".$point[count($point)]->bdesc.".\"));
				
				descList.appendChild(text$i);"; 
			}
            else{ 
			//$text = $text."<li>Gehen Sie ".(int)$dist." m bis zu <b>".$point[count($point)]->desc."</b> auf <b>Etage ".$point[count($point)]->ebene."</b> im <b>Haus ".$point[count($point)]->bdesc."</b>.</li>"; 
			$text.="var text$i=document.createElement(\"li\");
				text$i.appendChild(document.createTextNode(\"Gehen Sie ".(int)$dist." m bis zu ".$point[count($point)]->desc.", ".$point[count($point)]->ldesc.", ".$point[count($point)]->bdesc.".\"));
				
				descList.appendChild(text$i);"; 
			}
        }
		//Aufzugbenutzung
		if ($point[$i]->typ=="LF" && ( $point[$i-1]->typ!="LF" || $point[$i+1]->typ!="LF")){
            $dist=0;
			if ($point[$i-1]->typ!="LF"){
                //$text = $text."<li>Benutzen Sie den Fahrstuhl";
				$text.="var lift=document.createElement(\"li\");
				lift.appendChild(document.createTextNode(\"Benutzen Sie den Fahrstuhl\"));
				
				descList.appendChild(lift);"; 
			}
			if ($point[$i+1]->typ!="LF"){
				//$text = $text." bis in die ".$point[$i]->ebene.". Etage.</li>";
				$text.=" if(typeof(lift)!=\"undefined\"){
							lift.appendChild(document.createTextNode(\" bis ".$point[$i]->ldesc." .\"));
							descList.appendChild(lift); 
						 }";
			}  
		}
		//Treppenbenutzung
		if ($point[$i]->typ=="TR" && ($point[$i-1]->typ!="TR" || $point[$i+1]->typ!="TR")){
            $dist=0;
			if ($point[$i-1]->typ!="TR"){
				//$text = $text."<li>Benutzen sie die Treppe";
				$text.="var treppe=document.createElement(\"li\");
				treppe.appendChild(document.createTextNode(\"Benutzen Sie die Treppe\"));
				
				descList.appendChild(treppe);"; 
			}
			if ($point[$i+1]->typ!="TR"){
				//$text = $text." bis in die ".$point[$i]->ebene.". Etage.</li>";
				$text.=" if(typeof(treppe)!=\"undefined\"){
							treppe.appendChild(document.createTextNode(\" bis ".$point[$i]->ldesc." .\"));
							descList.appendChild(treppe); 
						 }";
			}
		}
		//echo $point[$i]->id;
		//echo $point[$i]->typ;
		//echo "<br>";
		
	}
	$text.="	descDiv.appendChild(descList);
				document.getElementById(\"main\").appendChild(descDiv);
				}
			}";
	echo $text;
    //echo "<li>Gehen Sie ".$dist." m bis zu <b>".$point[count($point)]->desc."</b> auf <b>Etage ".$point[count($point)]->ebene."</b> im <b>Haus ".$point[count($point)]->bdesc."</b>.</li>";
    //echo "</b>.</li>";
	
	
?>


	
