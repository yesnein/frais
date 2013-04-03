<?php
    //Skript für die Abbildung des Graphen und des Suchalgorithmus
	
	// Klasse "vertex" speichert die Knoten für den Graphen mit allen Eigenschaften
 
class vertex{
    // Eigenschaften aus der Datenbank
    
    var $id; // eindeutige ID jedes Knotens
    var $x;  // X-Koordinate des Knotens
    var $y;  // Y-Koordinate des Knotens
    var $type; // Art des Knotens
    var $building_id; // Gebaeude-ID des Knotens
    var $level_id;  // Ebenen-ID des Knotens
    var $target; // Ziel - wird wahrschenilich nicht gebraucht
    var $alloc; // Zuordnung
    var $desc; // Beschreibung
    var $desc2; // Beschreibung 2
    var $a_vertex=array(); // Die benachbarten Knoten des Knotens. Sind für den Suchalgorithmus zwingend notwendig.
      
    
    // Algorithmusvariablen
    
    var $pre; // Vorgaenger des Knotens
    var $dist; // Distanz des Knotens zum Startknoten
    
    
}
// Die Klasse "edge" wird eigentlich nicht gebraucht, da der Algorithmus nur mit den Knoten arbeitet.
// Könnte aber für Kantengewichte nuetzlich sein
class edge{
    var $id;
    var $vertices=array();

}    


/* Klasse "graph" speichert alle Knoten und optional auch Kanten 
   und ist die Grundvoraussetzung für den Suchalgorithmus von Dijkstra*/ 
   
class graph {
    var $vertices=array();
    var $edges=array();
    var $path=array();
       // fuegt Knoten dem Graphen hinzu
       
       function add_vertex($vertex){
       $this->vertices["$vertex->id"]=$vertex;
       }
       
       // fuegt Kante dem Graphen hinzu
       
       function add_edge($edge){
        $this->edges["$edge->id"]= $edge;
           }
        
       // prueft, ob 2 Knoten eine direkte Verbindung haben (Nachbarn sind)
       
       function connected($startknoten,$endknoten){
           $a=0;
           $b=0;
           for ($i=0;$i<count($startknoten->a_knoten);$i++)
           {if($startknoten->a_vertex[$i]->id==$endknoten->id)
             $a++;}
           for ($j=0;$j<count($endknoten->a_knoten);$i++)
           {if($startknoten->a_vertex[$i]->id==$startknoten->id)
             $b++;}
           if ($a!=0 && $b!=0)
           return true;
       }
       
       //Bestimmung der Distanz zwischen 2 Punkten (Pythagoras)
       //Nur fuer direkt benachbarte Punkte gedacht
                 
       function weight($s,$e){
           if($s->type=="AU" && $e->type=="AU"){
               return 3;
               break;}
           if($s->type=="TR" && $e->type=="TR"){
               return 4.5;
               break;}
               
           return sqrt(((($s->x)-($e->x))*(($s->x)-($e->x)))+ ((($s->y)-($e->y))*(($s->y)-($e->y))));
       }
       
       // Funktion dient nur dazu, an den Wert an einer bestimmten Position in einem assoziativen Array zu gelangen
       
       function key_name($array,$pos) {
           if ( ($pos < 0) || ( $pos >= count($array) ) )
         return "NULL";  
           reset($array);
           for($i = 0;$i < $pos; $i++) next($array);

           return key($array);
        }
        
       // Bestimmung der naechsten Knoten
       
       function next_vertex($vertex,$start){
           // Nachfolger werden als Array gespeichert
        $next=array();
               //echo "aktueller Knoten in next_vertex ist ",$vertex,"<br>";
            foreach($this->vertices[$vertex]->a_vertex as $value){
            // Der Vorgaenger des Knotens wird nicht mehr als Nachfolger aufgenommen
                    if($this->vertices[$vertex]->pre!=$value->id && $start!=$value->id){    
                    $next[$value->id]=$value;
                    }
            }
           return $next;
       }
       
       
      
       // Dijkstra Suchalgorithmus
           
       function dijkstra($start,$target){
            // Algorithmus startet nur, wenn beide Knoten im Graphen vorhanden sind
            // Es wird ersteinmal vorausgesetzt, dass es einen Weg zwischen den Punkten gibt, wenn sie im Graphen existieren
            // Als $start und $target werden die IDs der Start- und Zielpunkte angegeben
            if ((array_key_exists($start, $this->vertices))&&(array_key_exists($target, $this->vertices))){
			
        //Initialisierung
        
            // keiner der Knoten im Graphen besitzt einen Vorgaenger
            
            foreach($this->vertices as $value){     
            $this->vertices[$value->id]->pre=NULL;}
            
            // Der Vorgaenger des Startknotens ist der Startknoten selbst
            
            $this->vertices[$start]->pre=$start;
           // $this->vertices[$start]->pre_first=$start; 
            // als Warteschlange für die naechsten Knoten wird ein Array genutzt
            
            $front=array();
            
            // Distanzen aller Knoten zum Startpunkt werden auf "unendlich" gesetzt
            
            foreach($this->vertices as $value){     
            $this->vertices[$value->id]->dist=10000000;}
            $this->vertices[$start]->dist=0; // Distanz des Startknoten zu sich selbst wird auf 0 gesezt  
            
            // alle Knoten des Graphen werden in die Warteschlange eingefuegt   
            foreach($this->vertices as $value){     
            $front[$value->id]=&$value->dist;}
            
            // Array wird sortiert
            asort($front);
            
            
            // Array "path" speichert die Knoten des kuerzesten Pfades
            $path=array();
            
            
        while(count($front)>0){
            
            $current= $this->key_name($front,0); // aktueller Wert ist immer der vorderste Wert im Array "front"
            
            unset($front[$current]); 
            
            asort($front);
            
            
                // falls der Zielpunkt gefunden wurde, kann sofort abgebrochen werden
                if($current==$target){
        
                    $path[$this->vertices[$current]->id]=$this->vertices[$current];
                    break;
                    }
            //Nachfolger des aktuellen Knotens werden bestimmt
             
            $next=$this->next_vertex($current,$start);
            
            // Auswertung der Nachfolger
            
            foreach($next as $value){
             
            $d= $this->vertices[$current]->dist + $this->weight($this->vertices[$current],$this->vertices[$value->id]);     
             
              //aktueller Nachfolger wird in die Warte Schlange eingefuegt
             
             if($this->vertices[$value->id]->pre==NULL){
             $this->vertices[$value->id]->pre=$current; // Vorgaenger wird im Graphen gesetzt
             $this->vertices[$value->id]->dist=$d; // Distanz wird im Graphen gespeichert    
             $front[$value->id]=$d;} // Distanz wird in Warteschlange neu gesetzt 
             
             if($this->vertices[$value->id]->dist > $d){
                $this->vertices[$value->id]->pre= $current; // Vorgaenger wird neu gesetzt
                $this->vertices[$value->id]->dist=$d; // Distanz wird gespeichert
                $front[$value->id]=$d;  // Distanz wird in Warteschlange neu gesetzt 
                }  
             
                asort($front);
                
            }
            asort($front);
            }
            
            // Rekonstruktion des kuerzesten Pfades
        
               while(true){
               
               $path[$current]= $this->vertices[$current];
               if($current==$start) break;
               
               $current=$this->vertices[$current]->pre;    
            }  
            $path=array_reverse($path);
            return $path;
       }
   }
}


?>
