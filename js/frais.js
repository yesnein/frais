/**
 * @author Max Noja
 * @date 04.03.2010
 */
/*
window.onload = function(){
	wrapper = $("wrapper");
		
	var now = new Date()
	if(now.getFullYear() <= 2010) {
		$('#copyright_year').text("" + 2010);
	}
	else{
		$('#copyright_year').text("" + 2010 + " \u2013 " + now.getFullYear());
	}
	//wrapper.style.left = Math.round((window.innerWidth - 800)/2.)+"px";

}
window.onresize = function(){
	wrapper = $("wrapper");
	//wrapper.style.left = Math.round((window.innerWidth - 800)/2.)+"px";
}
*/
/////////////
// Facility Routing and Information System - FRAIS 
/////////////

// FRAIS Object containing all classes, methods and globals 
var FRAIS={};

//Namespaces for SVG
FRAIS.svgNS = "http://www.w3.org/2000/svg";
FRAIS.xlinkNS = "http://www.w3.org/1999/xlink";

//Global layer variables
FRAIS.layerMode=null; //determines how the layer elements are loaded to the SVG
FRAIS.layers_count=0; //number of layers in FRAIS
FRAIS.layers = []; //array for holding all FRAIS.Layer-objects

//Global variables for the search result
FRAIS.searchLayers=null; 
FRAIS.searchColors=null;
FRAIS.displayWidth=800;
FRAIS.displayHeight=600;
FRAIS.path=null;

// Global floorplan variables
FRAIS.FPElementsCount=0; //number of floorplan elements in FRAIS
FRAIS.FPElements=[]; // array for holding all FRAIS.FPElement-objects
FRAIS.tempFPElement=null; // temporary FPElement used to hold an newly drawn floorplan element

// Global waypoint variables
FRAIS.wayPoints = []; // array for holding all FRAIS.WayPoint-objects
FRAIS.wayPointTypes=["WP","TR","LF"]; // Possible waypoint types used for determining the transition picture when displaying search results 

//Global editor variables
FRAIS.displayed_layers=0; //number of displayed layers

//Global variables for active elements in editor
FRAIS.activePoint={id:null, isSet:false}; //Should be changed to a boolean some time
FRAIS.activeLayer={id:null, isSet:false}; //Should be changed to a boolean some time
FRAIS.activeBuilding=null;
FRAIS.activeProject=null;
FRAIS.activeFPElement=null;
FRAIS.selectedFloorPoint=null;

//Boolean indicating that a floorplan element gets drawn
FRAIS.drawing=false;

//Global variables for the highest ID of the waypoints and floorplan elements
FRAIS.maxPointId=0;
FRAIS.maxFPElementsId=0;

//Layer-Class 
FRAIS.Layer= function(id,level,floor,desc,scale,width,height,refX,refY){
	
	var that=this; //reference to the own object

	this.id=id; //the id from the database
	this.level=level; //the level from the database
	this.desc=desc; //the description from the database
	this.scale=scale; //the scale of the floorplan image
	this.width=width; //width of the floorplan image
	this.height=height; //height of the floorplan image
	this.refX=refX; // reference x-coordinate of the floorplan image
	this.refY=refY; // reference y-coordinate of the floorplan image
	this.layer_position=0; //position of the layer in the editor stack
	this.wayPoints= new Array(); //array for holding the IDs of the waypoints belonging the layer
	this.wayPointsCount=0; //number of waypoints in the layer
	this.FPElements= new Array();//array for holding the IDs of the waypoints belonging the layer
	this.FPElementsCount=0;//number of waypoints in the layer
	
	this.displayed=false; //boolean if the layer is displayed in the editor
	
	//DIV-element for the layer
	this.elem=document.createElement("div");
	this.elem.id="display_layer" + id;
	this.elem.className = "display_layer";
	this.elem.style.position = "absolute";
	this.elem.style.opacity=1;
	this.elem.style.display="none";
	this.elem.style.backgroundColor = "rgb("+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+")";
	//this.elem.addEventListener("click",function(){setActiveLayer(id)},false);
	
	//Label of the layer with the description from the database placed at the upper edge of the DIV-element 
	this.label=document.createElement("div");
	this.label.id="label"+id;
	this.label.style.position = "absolute";
	this.label.style.right = "0px";
	this.label.style.top = "-22px";
	
	this.label.style.height="20px";
	this.label.style.color="black";
	this.label.style.padding="0px 5px 0px 5px";
	this.label.style.backgroundColor="rgb("+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+")";
	this.label.style.borderTop="2px solid "+"rgb("+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+")";
	this.label.style.borderLeft="2px solid "+"rgb("+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+","+(255-FRAIS.layers_count*15)+")";
	this.label.style.fontFamily="Arial,Helvetica,sans";
	this.label.style.fontWeight="bold";
	this.label.style.fontSize="small";
	
	this.label_text=document.createTextNode(this.desc);
	this.label.appendChild(this.label_text);
	this.elem.appendChild(that.label);
	
	//Object-HTML-element for holding the SVG of the layer
	this.SVGObject = document.createElement("object");
	this.SVGObject.id = "SVGObject"+this.id;
	this.SVGObject.type="image/svg+xml";
	this.SVGObject.data = "svg/level"+this.level+".svg";
	this.SVGObject.width="800px";
	this.SVGObject.height="600px";
	this.elem.appendChild(this.SVGObject);
	
	//List-item with button for loading the layer into the editor
	this.layer_loader_item = document.createElement("li");
	this.layer_loader_item.id = "layer_loader_item"+this.level;
	this.layer_loader_item.style.display="none";
	
	this.layer_loader = document.createElement("input");
	this.layer_loader.id = "layer_loader"+this.level;
	this.layer_loader.className = "layer_loader";
	this.layer_loader.type = "button";
	this.layer_loader.value = "Ebene laden";
	this.layer_loader.addEventListener("click",function(){that.loadLayer(that)},false);
	
	this.layer_loader_item.appendChild(this.layer_loader);

	if($("navBarListE")!=null)
		$("navBarListE").appendChild(this.layer_loader_item);
	
	//List-item with button for displaying the waypoints of the layer
	this.point_loader_item = document.createElement("li");
	this.point_loader_item.id = "point_loader_item"+this.level;
	this.point_loader_item.style.display="none";
	
	this.point_loader = document.createElement("input");
	this.point_loader.id = "point_loader"+this.level;
	this.point_loader.className = "point_loader";
	this.point_loader.type = "button";
	this.point_loader.value = "Wegpunkte anzeigen";
	this.point_loader.onclick=function(){this.loadPoints(that)};
	
	this.point_loader_item.appendChild(this.point_loader);
	
	if($("navBarListE")!=null)
		$("navBarListE").appendChild(this.point_loader_item);
	
	//List-item with button for displaying the floorplan image of the layer
	this.fp_loader_item = document.createElement("li");
	this.fp_loader_item.id = "fp_loader_item"+this.level;
	this.fp_loader_item.style.display="none";
	
	this.fp_loader = document.createElement("input");
	this.fp_loader.id = "fp_loader"+this.level;
	this.fp_loader.className = "point_loader";
	this.fp_loader.type = "button";
	this.fp_loader.value = "Grundrissgrafik ausblenden";
	this.fp_loader.onclick=function(){FRAIS.toggleFPImage(that)};
	
	this.fp_loader_item.appendChild(this.fp_loader);
	
	if($("navBarListE")!=null)
		$("navBarListE").appendChild(this.fp_loader_item);
	
	$("main").appendChild(this.elem);
	//Variable for the DOM-element of the SVG document of the layer
	this.SVGDoc=null;
	//Variable for the floorplan image of the layer
	this.FPImage=null;
}
//Method of Layer-class to add the DIV element of the layer to the html-document
FRAIS.Layer.prototype.addToScreen= function(that){
	that.layer_position=++displayed_layers
	that.elem.style.left=(80 + that.layer_position*20)+"px";
	that.elem.style.top=(80 + that.layer_position*20)+"px";
	that.elem.style.zIndex = that.layer_position*10;
	that.elem.style.backgroundColor = "rgb("+(255-that.layer_position*15)+","+(255-that.layer_position*15)+","+(255-that.layer_position*15)+")";
	//that.label.style.zIndex = that.layer_position*10;
	//that.SVGObject.style.zIndex = that.layer_position*10;

	document.body.appendChild(that.elem);
	
	that.loadPoints(that);
	
	that.layer_loader.value="Ebene entfernen";
	
	//removing addToScreen function
	that.layer_loader.removeEventListener("click",arguments.callee.caller,false);
	
	that.layer_loader.addEventListener("click",function(){that.unloadLayer(that)}, false);
	
	setActiveLayer(that.id);
	
}
//Method of Layer-class to check if a waypoint is in a layer
FRAIS.Layer.prototype.containsPoint= function(pointId){
	for(var i=0;i< this.wayPoints.length;i++){
		if(this.wayPoints[i] == pointId)
			return true;
	}
	return false;
}

//Method of Layer-class to load the waypoints of a layer to the SVG 
FRAIS.Layer.prototype.loadPoints = function(that){
	
	for(i=0;i <that.wayPoints.length;i++){
		if(FRAIS.wayPoints[that.wayPoints[i]].SVGElem==null && that.SVGDoc != null){
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem = that.SVGDoc.createElementNS(FRAIS.svgNS,"circle");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"id", FRAIS.wayPoints[that.wayPoints[i]].id);
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"cx", FRAIS.displayedXCoordinate(FRAIS.wayPoints[that.wayPoints[i]].x));
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"cy", FRAIS.displayedYCoordinate(FRAIS.wayPoints[that.wayPoints[i]].y));
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"r", "4px");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"fill", "red");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"stroke", "black");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"stroke-width", "2px");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"style", "cursor:pointer");
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.addEventListener("click",FRAIS.selectPoint,false);
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.addEventListener("click",FRAIS.toggleNeighbour,false);
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.addEventListener("mouseover",FRAIS.showInfo,false);
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.addEventListener("mousedown",FRAIS.hideInfo,false);
			FRAIS.wayPoints[that.wayPoints[i]].SVGElem.addEventListener("mouseout",FRAIS.hideInfo,false);
		}
		if(FRAIS.activePoint.isSet){
			for(var j=0;j< FRAIS.wayPoints[FRAIS.activePoint.id].NPs.length;j++){
				if(FRAIS.wayPoints[that.wayPoints[i]].id==FRAIS.wayPoints[FRAIS.activePoint.id].NPs[j]){
					FRAIS.wayPoints[that.wayPoints[i]].SVGElem.setAttributeNS(null,"stroke", "orange");
					break;
				}
			}
		}
		that.SVGDoc.documentElement.appendChild(FRAIS.wayPoints[that.wayPoints[i]].SVGElem);
	}
	
	that.point_loader.value = "Wegpunkte ausblenden"
	that.point_loader.onclick=null;
	that.point_loader.onclick=function(){that.unloadPoints(that)};
	that.points_loaded=true;
}
//Method of Layer-class to unload (remove) the waypoints of a layer from the SVG 
FRAIS.Layer.prototype.unloadPoints= function(that){
	if(FRAIS.activePoint.isSet){
		FRAIS.deactivatePoint();
	}
	for(i=0;i <that.wayPoints.length;i++){
		that.SVGDoc.documentElement.removeChild(FRAIS.wayPoints[that.wayPoints[i]].SVGElem);
	}

	that.point_loader.value="Wegpunkte anzeigen"
	that.point_loader.onclick=null;
	that.point_loader.onclick=function(){that.loadPoints(that)};
	that.points_loaded=false;
	
}
//Method of Layer-class to load the floorplan elements of a layer uneditable to the SVG 
FRAIS.Layer.prototype.loadFlatFPElements = function(that){
	
	for (var i = 0; i < that.FPElements.length; i++) {
		if (FRAIS.FPElements[that.FPElements[i]].SVGElem == null && that.SVGDoc != null && FRAIS.FPElements[that.FPElements[i]].floorPoints.length > 0){
			
			if(FRAIS.FPElements[that.FPElements[i]].type=="POLYGON")
				FRAIS.FPElements[that.FPElements[i]].SVGElem = that.SVGDoc.createElementNS(FRAIS.svgNS, "polygon");
			if(FRAIS.FPElements[that.FPElements[i]].type=="LINESTRING")
				FRAIS.FPElements[that.FPElements[i]].SVGElem = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
			
			var coordinates="";
			
			for(var j=1; j < FRAIS.FPElements[that.FPElements[i]].floorPoints.length;j++){
			
				if(j > 1)
					coordinates+=" "+FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x)+","+FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y);
				else
					coordinates+=FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x)+","+FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y);
			}
			FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "points", coordinates);
			FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "fill", "none");
			FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "stroke", "rgb(27,165,229)");
			FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "stroke-width", "3px");
			FRAIS.FPElements[that.FPElements[i]].addToScreen();
		}
	}
}
//Method of Layer-class to load the results of a search to the SVG 
FRAIS.Layer.prototype.loadSearchResults = function(that){
	//Check if we have everything we need to display the results. Most things have been done in search.php
	if (that.SVGDoc !=null && FRAIS.path != null && FRAIS.searchLayers != null && FRAIS.searchColors != null) {
		//value to shift the layers of a building in the output
		var shift=30;
		//Create the flooplan elements
		for (var i = 0; i < that.FPElements.length; i++) {
			
			if (that.SVGDoc != null && FRAIS.FPElements[that.FPElements[i]].floorPoints.length > 0) {
		
				if (FRAIS.FPElements[that.FPElements[i]].type == "POLYGON") 
					FRAIS.FPElements[that.FPElements[i]].SVGElem = that.SVGDoc.createElementNS(FRAIS.svgNS, "polygon");
				if (FRAIS.FPElements[that.FPElements[i]].type == "LINESTRING") 
					FRAIS.FPElements[that.FPElements[i]].SVGElem = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
				
				var coordinates = "";
				
				for (var j = 1; j < FRAIS.FPElements[that.FPElements[i]].floorPoints.length; j++) {
				
					if (j > 1) 
						coordinates += " " + (FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x) + (FRAIS.searchLayers[FRAIS.FPElements[that.FPElements[i]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y) + (FRAIS.searchLayers[FRAIS.FPElements[that.FPElements[i]].level] * shift));
					else 
						coordinates += (FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x) + (FRAIS.searchLayers[FRAIS.FPElements[that.FPElements[i]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y) + (FRAIS.searchLayers[FRAIS.FPElements[that.FPElements[i]].level] * shift));
				}
				
				FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "points", coordinates);
				FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "fill", FRAIS.searchColors[FRAIS.FPElements[that.FPElements[i]].level]);
				if (FRAIS.FPElements[that.FPElements[i]].type == "POLYGON") 
					FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "fill-opacity", 0.2);
				else
					FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "fill-opacity", 0.0);
				FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "stroke", FRAIS.searchColors[FRAIS.FPElements[that.FPElements[i]].level]);
				FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "stroke-opacity", 0.4);
				FRAIS.FPElements[that.FPElements[i]].SVGElem.setAttributeNS(null, "stroke-width", "3px");
				//FRAIS.FPElements[that.FPElements[i]].addToScreen();
				
				that.SVGDoc.documentElement.appendChild(FRAIS.FPElements[that.FPElements[i]].SVGElem);
			}
	
		}
		//Creating the start point
		var startPoint=that.SVGDoc.createElementNS(FRAIS.svgNS, "circle");
			startPoint.setAttributeNS(null, "cx", (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[0]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[0]].level] * shift)));
			startPoint.setAttributeNS(null, "cy", (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[0]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[0]].level] * shift)));
			startPoint.setAttributeNS(null, "r", "7px");
			startPoint.setAttributeNS(null, "fill", FRAIS.searchColors[FRAIS.wayPoints[FRAIS.path[0]].level]);
			that.SVGDoc.documentElement.appendChild(startPoint);
		
		//Creating the marker for the destination point	
		var defs=that.SVGDoc.documentElement.childNodes[1];
		
		var endMarker=that.SVGDoc.createElementNS(FRAIS.svgNS, "marker");
			endMarker.setAttributeNS(null, "orient", "auto");
			endMarker.setAttributeNS(null, "id", "endMarker");
			endMarker.setAttributeNS(null, "refX", "0");
			endMarker.setAttributeNS(null, "refY", "0");
			endMarker.setAttributeNS(null, "style","overflow:visible");
		var endMarkerPath=that.SVGDoc.createElementNS(FRAIS.svgNS, "path");
			endMarkerPath.setAttributeNS(null, "d", "M 0.0,0.0 L 2.5,-2.5 L 0.0,0.0 L 2.5,2.5 L 0.0,0.0 z");
			endMarkerPath.setAttributeNS(null, "stroke",FRAIS.searchColors[FRAIS.wayPoints[FRAIS.path[FRAIS.path.length-1]].level]);
			endMarkerPath.setAttributeNS(null, "stroke-width","1px");
			endMarkerPath.setAttributeNS(null,"style", "fill-rule:evenodd;marker-start:none;fill:"+FRAIS.searchColors[FRAIS.wayPoints[FRAIS.path[FRAIS.path.length-1]].level]);
			endMarkerPath.setAttributeNS(null,"transform","scale(1.0) rotate(180)");
			
			endMarker.appendChild(endMarkerPath);
			defs.appendChild(endMarker);
		
		// Splitting the search path for the layers	
		var paths=new Array(); //separate paths for the layers
		var connectors= new Array(); //array for dashed connector lines between the layers
		var currentLevel= FRAIS.wayPoints[FRAIS.path[0]].level;
		var k=0;
		var m=0;
		//Beginning the first path
		paths[k] = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
		var path_coords = "" + (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[0]].x) + 
							(FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[0]].level] * shift)) + 
							"," + (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[0]].y) + 
							(FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[0]].level] * shift));
			
		
		for (var i=1;i < FRAIS.path.length;i++){

			if (FRAIS.wayPoints[FRAIS.path[i]].level == currentLevel) {
			
				path_coords += " " + (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift));
				
				//Create the last path
				if (i == (FRAIS.path.length - 1)) {
					paths[k].setAttributeNS(null, "points", path_coords);
					paths[k].setAttributeNS(null, "fill", "none");
					paths[k].setAttributeNS(null, "stroke", FRAIS.searchColors[currentLevel]);
					paths[k].setAttributeNS(null, "stroke-width", "4px");
					
					if(path_coords.split(" ").length > 1)
						paths[k].setAttributeNS(null, "marker-end","url(#endMarker)");
					else{
						connectors[m].setAttributeNS(null, "marker-end","url(#endMarker)");
					}	
					that.SVGDoc.documentElement.appendChild(paths[k]);
				}		
	 		
			}
			else {
				//Handling the case that the last path has only 1 point
				if (i == (FRAIS.path.length - 1)) {
					//Creating the previous path 
					paths[k].setAttributeNS(null, "points", path_coords);
					paths[k].setAttributeNS(null, "fill", "none");
					paths[k].setAttributeNS(null, "stroke", FRAIS.searchColors[currentLevel]);
					paths[k].setAttributeNS(null, "stroke-width", "4px");
					that.SVGDoc.documentElement.appendChild(paths[k]);
					//Creating the last path 
					k++;
					paths[k] = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
					//the coordinates for the part of the waypath 
					var path_coords = "" +
					(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) +
					(FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
					"," +
					(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) +
					(FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift));
					
					paths[k].setAttributeNS(null, "points", path_coords);
					paths[k].setAttributeNS(null, "fill", "none");
					paths[k].setAttributeNS(null, "stroke", FRAIS.searchColors[currentLevel]);
					paths[k].setAttributeNS(null, "stroke-width", "4px");
					
					that.SVGDoc.documentElement.appendChild(paths[k]);
					//Create the dashed connector line
					connectors[m] = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
					var connect_coords = "" + (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i-1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i-1]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i-1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i-1]].level] * shift)) +
					" " +
					(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
					"," +
					(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift));
					connectors[m].setAttributeNS(null, "points", connect_coords);
					connectors[m].setAttributeNS(null, "fill", "none");
					connectors[m].setAttributeNS(null, "stroke", "black");
					connectors[m].setAttributeNS(null, "stroke-width", "4px");
					connectors[m].setAttributeNS(null, "stroke-dasharray", "4");
					
					if(path_coords.split(" ").length > 1)
						paths[k].setAttributeNS(null, "marker-end","url(#endMarker)");
					else{
						connectors[connectors.length-1].setAttributeNS(null, "marker-end","url(#endMarker)");
					}	
					that.SVGDoc.documentElement.appendChild(connectors[m]);
					m++;
					//determine the icon for the layer transition, e.g. stairs or lift 
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "TR") {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#treppe");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "LF") {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#lift");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "WP" ) {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#walk");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
				}
				else {
					paths[k].setAttributeNS(null, "points", path_coords);
					paths[k].setAttributeNS(null, "fill", "none");
					paths[k].setAttributeNS(null, "stroke", FRAIS.searchColors[currentLevel]);
					paths[k].setAttributeNS(null, "stroke-width", "4px");
				
					that.SVGDoc.documentElement.appendChild(paths[k]);
					currentLevel = FRAIS.wayPoints[FRAIS.path[i]].level;
					k++;
					
					if (i != FRAIS.path.length - 1) {
						connectors[m] = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
						var connect_coords = "" + (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						" " +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift)) +
						"," +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift));
						connectors[m].setAttributeNS(null, "points", connect_coords);
						connectors[m].setAttributeNS(null, "fill", "none");
						connectors[m].setAttributeNS(null, "stroke", "black");
						connectors[m].setAttributeNS(null, "stroke-width", "4px");
						connectors[m].setAttributeNS(null, "stroke-dasharray", "4");
						that.SVGDoc.documentElement.appendChild(connectors[m]);
						m++;
					}
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "TR") {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#treppe");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "LF") {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#lift");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
					if (FRAIS.wayPoints[FRAIS.path[i]].type == "WP" && i != FRAIS.path.length - 1) {
						var stairs = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
						stairs.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#walk");
						var posX = ((FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						var posY = ((FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) +
						(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i - 1]].level] * shift))) /
						2;
						stairs.setAttributeNS(null, "transform", "translate(" + (posX - 10) + "," + (posY - 10) + ")");
						that.SVGDoc.documentElement.appendChild(stairs);
					}
					
					paths[k] = that.SVGDoc.createElementNS(FRAIS.svgNS, "polyline");
					var path_coords = "" + (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[i]].x) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift)) + "," + (FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[i]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[i]].level] * shift));
				}
			}
		}
		
	//Create the zoomview box below the overview output
	if (that.id ==2) {
		var viewBox = (FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.path[FRAIS.path.length - 1]].x)) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[FRAIS.path.length - 1]].level] * shift) - 100 + " " +
		(FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.path[FRAIS.path.length - 1]].y) + (FRAIS.searchLayers[FRAIS.wayPoints[FRAIS.path[FRAIS.path.length - 1]].level] * shift) - 75) +
		" 400 300";
		
		that.SVGDoc.documentElement.setAttributeNS(null, "viewBox", viewBox);
		//that.elem.style.left=(0 + (that.layer_position-1)*20)+"px";
		//that.elem.style.top=(0 + that.layer_position*0)+"px";
		that.elem.style.borderTop="20px solid white";
		//that.elem.style.marginLeft="20px";
		that.elem.style.backgroundColor="rgb(240,240,240)";
		that.elem.style.position="static";
		that.elem.style.cssFloat="left";
		that.elem.style.width = "400px";
		that.elem.style.height = "300px";
		that.elem.style.overflow = "hidden";
	}
	//Create the legend for the map
	if (typeof(FRAIS.createLegend) == "function") {
			FRAIS.createLegend(that.SVGDoc);
			var legend = that.SVGDoc.createElementNS(FRAIS.svgNS, "use");
			legend.setAttributeNS(FRAIS.xlinkNS, "xlink:href", "#legend");
			legend.setAttributeNS(null, "x", "0");
			legend.setAttributeNS(null, "y", "0");
			that.SVGDoc.documentElement.appendChild(legend);
	}
	
	}

}

//Global function to toggle the display of the floorplan image of a layer
FRAIS.toggleFPImage = function(that){
	if(that.SVGDoc!=null && that.FPImage!=null){
		var display=that.FPImage.getAttributeNS(null,"display");
		if(display==""){
			that.FPImage.setAttributeNS(null,"display","none");
			that.fp_loader.value="Grundrissgrafik anzeigen"
		}
		if(display=="none"){
			that.FPImage.setAttributeNS(null,"display","");
			that.fp_loader.value="Grundrissgrafik ausblenden"
		}
	}
	
}
//Method of the Layer-class to load the floorplan elements of a layer to the SVG 
FRAIS.Layer.prototype.loadFPElements = function(that){
	for (var i = 0; i < that.FPElements.length; i++) {
		for(var j=1; j < FRAIS.FPElements[that.FPElements[i]].floorPoints.length;j++){
			if (FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem == null && that.SVGDoc != null) {
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem = that.SVGDoc.createElementNS(FRAIS.svgNS, "circle");
				if (FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id < 10) {
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "id", "fp" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].FPElement + "0" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id);
				}
				else {
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "id", "fp" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].FPElement + "" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id);
				}
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "cx", FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x));
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "cy", FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y));
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "r", "4px");
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "fill", "red");
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "stroke", "black");
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "stroke-width", "2px");
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.setAttributeNS(null, "style", "cursor:pointer");
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("mouseover", FRAIS.selectFloorPoint, false);
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("mouseover", FRAIS.showFloorPointInfo, false);
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("mouseout", FRAIS.deselectFloorPoint, false);
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("mouseout", FRAIS.hideFloorPointInfo, false);
				
				if (FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id == 1) {
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("click", FRAIS.finishPolygonFPElement, false);
				}
				
				if (FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id > 1) {
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine = that.SVGDoc.createElementNS(FRAIS.svgNS, "line");
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "id", "line" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].FPElement + "" + FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id);
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "x1", FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id - 1].x));
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "y1", FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[FRAIS.FPElements[that.FPElements[i]].floorPoints[j].id - 1].y));
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "x2", FRAIS.displayedXCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].x));
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "y2", FRAIS.displayedYCoordinate(FRAIS.FPElements[that.FPElements[i]].floorPoints[j].y));
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "stroke", "rgb(27,165,229)");
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine.setAttributeNS(null, "stroke-width", "2px");
					
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
				}
				else {
					FRAIS.FPElements[that.FPElements[i]].floorPoints[j].svgLine = null;
				}
				//load the to the SVG
				FRAIS.FPElements[that.FPElements[i]].floorPoints[j].addToScreen();
			}	
		}
		//close the elements
		FRAIS.finishLoadedFPElement(FRAIS.FPElements[that.FPElements[i]].id);
	}
}
//Method of the Layer-class that shows the buttons to load the layer to the editor
FRAIS.Layer.prototype.addLayer=function(that){
	
	for(var i=1;i <= FRAIS.layers_count;i++){
		FRAIS.layers[i].layer_loader_item.style.display = "none";
		FRAIS.layers[i].point_loader_item.style.display = "none";
		FRAIS.layers[i].fp_loader_item.style.display = "none";
	}
	
	FRAIS.layers[that.id].layer_loader_item.style.display="";
	//layers[that.id].point_loader_item.style.display="";

}

//Method of the Layer-class to load the layer into the editor
FRAIS.Layer.prototype.loadLayer= function(that){

	if(FRAIS.layerMode=="waypoints")
	that.point_loader_item.style.display="";
	if(FRAIS.layerMode !="overview")that.fp_loader_item.style.display="";
	that.layer_position=++FRAIS.displayed_layers;
	that.elem.style.left=(0 + (that.layer_position-1)*20)+"px";
	that.elem.style.top=(0 + (that.layer_position-1)*20)+"px";
	that.elem.style.zIndex = that.layer_position*10;
	that.elem.style.backgroundColor = "rgb("+(255-that.layer_position*15)+","+(255-that.layer_position*15)+","+(255-that.layer_position*15)+")";
	that.label.style.backgroundColor = "rgb("+(255-that.layer_position*15)+","+(255-that.layer_position*15)+","+(255-that.layer_position*15)+")";
	that.layer_loader.value = "Ebene entfernen";
			
	//removing loadLayer function
	that.layer_loader.removeEventListener("click", arguments.callee.caller, false);
	that.layer_loader.addEventListener("click", function(){that.unloadLayer(that)}, false);
	that.displayed = true;
	
	that.elem.style.display="";
	if (that.SVGDoc == null) {

		var SVGtimer=setInterval(function(){
			
			if (typeof($("SVGObject" + that.id).getSVGDocument) == "function") {
				
				if ($("SVGObject" + that.id) != null && $("SVGObject" + that.id).getSVGDocument()!=null) {
					
					//while (that.SVGDoc == null) {
					that.SVGDoc = $("SVGObject" + that.id).getSVGDocument();
					//}
					if (that.SVGDoc != null) {	
						clearInterval(SVGtimer);		
						if (that.FPImage == null) {
							that.FPImage = that.SVGDoc.getElementById("FPImage" + that.level);
							if (that.FPImage != null)
								that.FPImage.addEventListener("click",function(e){e.preventDefault();},false);
						}	
						that.SVGDoc.documentElement.addEventListener("click", function(){FRAIS.setActiveLayer(that.id)}, false);
			
						FRAIS.setActiveLayer(that.id);
			
						if (FRAIS.layerMode == "floorplan") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.addFPElement, false);
							that.loadFPElements(that);
						}
			
						if (FRAIS.layerMode == "waypoints") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.addPoint, false);
							that.loadFlatFPElements(that);
							that.loadPoints(that);
						}
						if (FRAIS.layerMode == "overview") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
							that.loadFlatFPElements(that);
							that.loadPoints(that);
						}
			
					}
				}
			}
			else if (typeof($("SVGObject" + that.id).contentDocument) == "function") {
				
				if ($("SVGObject" + that.id) != null && $("SVGObject" + that.id).contentDocument!=null) {
					
					//while (that.SVGDoc == null) {
					that.SVGDoc = that.SVGObject.contentDocument;
					//}
					if (that.SVGDoc != null) {	
						clearInterval(SVGtimer);		
						if (that.FPImage == null) {
							that.FPImage = that.SVGDoc.getElementById("FPImage" + that.level);
							if (that.FPImage != null)
								that.FPImage.addEventListener("click",function(e){e.preventDefault();},false);
						}	
						that.SVGDoc.documentElement.addEventListener("click", function(){FRAIS.setActiveLayer(that.id)}, false);
			
						FRAIS.setActiveLayer(that.id);
			
						if (FRAIS.layerMode == "floorplan") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.addFPElement, false);
							that.loadFPElements(that);
						}
			
						if (FRAIS.layerMode == "waypoints") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.addPoint, false);
							that.loadFlatFPElements(that);
							that.loadPoints(that);
						}
						if (FRAIS.layerMode == "overview") {
							that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
							that.loadFlatFPElements(that);
							that.loadPoints(that);
						}
			
					}
				}
			}
			
		}, 100);
	}
	else{
			that.SVGDoc.documentElement.addEventListener("click", function(){FRAIS.setActiveLayer(that.id)}, false);
			
			FRAIS.setActiveLayer(that.id);
			
			if (FRAIS.layerMode == "floorplan") {
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.addFPElement, false);
			}
			
			if (FRAIS.layerMode == "waypoints") {
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.addPoint, false);
				that.loadFlatFPElements(that);
				that.loadPoints(that);
			}	
			
			if (FRAIS.layerMode == "overview") {
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
				that.loadFlatFPElements(that);
				that.loadPoints(that);
			}
	}
}
//Method of the Layer-class to unload the layer from the editor
FRAIS.Layer.prototype.unloadLayer= function(that){

	that.elem.style.display="none";
	that.displayed = false;
	that.point_loader_item.style.display="none";
	that.fp_loader_item.style.display="none";
	if(that.id !=FRAIS.activeLayer.id){
		that.layer_loader_item.style.display="none";
		that.point_loader_item.style.display="none";
		that.fp_loader_item.style.display="none";
	}
	if(FRAIS.activePoint.isSet && that.containsPoint(FRAIS.activePoint.id)){
		FRAIS.deactivatePoint();
	}
	that.layer_loader.value="Ebene laden";
	that.layer_loader.removeEventListener("click",arguments.callee.caller,false);
	that.layer_loader.addEventListener("click",function(){that.loadLayer(that)}, false);

	for(var i= that.layer_position+1;i <= FRAIS.displayed_layers;i++){
		var thisLayer=FRAIS.getLayerByPosition(i);
			thisLayer.layer_position--;
			thisLayer.elem.style.left=(0 + (thisLayer.layer_position-1)*20)+"px";
			thisLayer.elem.style.top=(0 + (thisLayer.layer_position-1)*20)+"px";
			thisLayer.elem.style.zIndex = thisLayer.layer_position*10;
			thisLayer.elem.style.backgroundColor = "rgb("+(255-thisLayer.layer_position*15)+","+(255-thisLayer.layer_position*15)+","+(255-thisLayer.layer_position*15)+")";
			thisLayer.label.style.backgroundColor = "rgb("+(255-thisLayer.layer_position*15)+","+(255-thisLayer.layer_position*15)+","+(255-thisLayer.layer_position*15)+")";
	}
	that.layer_position=0;
	FRAIS.displayed_layers--;
	if(FRAIS.displayed_layers >= 1)
		FRAIS.setActiveLayer(FRAIS.getLayerByPosition(FRAIS.displayed_layers).id);
}
//Method of the Layer-class to load the layer for search results
FRAIS.Layer.prototype.loadSearchLayer= function(that){
	
	FRAIS.activeLayer.id=1;
	if(FRAIS.layerMode=="waypoints")
	that.point_loader_item.style.display="";
	if(FRAIS.layerMode !="overview")that.fp_loader_item.style.display="";
	that.layer_position=1;//++FRAIS.displayed_layers;
	//that.elem.style.left=(0 + (that.layer_position-1)*20)+"px";
	//that.elem.style.top=(0 + that.layer_position*0)+"px";
	that.elem.style.position="static";
	that.elem.style.zIndex = that.layer_position*10;
	that.elem.style.backgroundColor = "rgb("+(255-that.layer_position*15)+","+(255-that.layer_position*15)+","+(255-that.layer_position*15)+")";
	that.label.style.backgroundColor = "rgb("+(255-that.layer_position*15)+","+(255-that.layer_position*15)+","+(255-that.layer_position*15)+")";
	that.label.style.display="none";
	
	
	//that.layer_loader.value = "Ebene entfernen";
			
	//removing loadLayer function
	//that.layer_loader.removeEventListener("click", arguments.callee.caller, false);
	//that.layer_loader.addEventListener("click", function(){that.unloadLayer(that)}, false);
	that.displayed = true;
	
	that.elem.style.display="";
	
	
	if (that.SVGDoc == null) {
		

		var SVGtimer=setInterval(function(){
			
			if (typeof($("SVGObject" + that.id).getSVGDocument) == "function") {
				
				if ($("SVGObject" + that.id) != null && $("SVGObject" + that.id).getSVGDocument()!=null) {
					
					//while (that.SVGDoc == null) {
						that.SVGDoc = $("SVGObject" + that.id).getSVGDocument();
					//}
					if (that.SVGDoc != null) {	
						clearInterval(SVGtimer);			
						if (FRAIS.layerMode == "overview") {
							that.loadSearchResults(that);
						}
					}
				}
			}
			else if (typeof($("SVGObject" + that.id).contentDocument) == "function") {
				
				if ($("SVGObject" + that.id) != null && $("SVGObject" + that.id).contentDocument!=null) {
					
					//while (that.SVGDoc == null) {
						that.SVGDoc = that.SVGObject.contentDocument;
					//}
					
					if (that.SVGDoc != null) {	
						clearInterval(SVGtimer);			
						if (FRAIS.layerMode == "overview") {
							that.loadSearchResults(that);
						}
					}
				}
			}
			
		}, 100);
	}
	else{
			//that.SVGDoc.documentElement.addEventListener("click", function(){FRAIS.setActiveLayer(that.id)}, false);
			
			//FRAIS.setActiveLayer(that.id);
			
			if (FRAIS.layerMode == "floorplan") {
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.addFPElement, false);
			}
			
			if (FRAIS.layerMode == "waypoints") {
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
				that.SVGDoc.documentElement.addEventListener("click", FRAIS.addPoint, false);
				that.loadFlatFPElements(that);
				that.loadPoints(that);
			}	
			
			if (FRAIS.layerMode == "overview") {
				//that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
				//that.SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
				that.loadSearchResults(that);
				//that.loadPoints(that);
			}
	}
	
}


/*FRAIS.levelCheck= function(layers,level){
	for(var i=1;i < layers.length; i++){
		if(layers[i].level == level)
			return true;
	}
	return false;
}
*/
//Function to get a layer by its position in the editor stack
FRAIS.getLayerByPosition= function(pos){
	for(var i=1;i<=FRAIS.layers_count;i++){
		if(pos==FRAIS.layers[i].layer_position)
			return FRAIS.layers[i]
	}
	return null
}
//Function to make a layer active (editable etc.) and bring it to the front of the editor stack
FRAIS.setActiveLayer= function(layer_id){
	if (FRAIS.activeLayer.id != layer_id && FRAIS.drawing==false) {
		var shift = "";
		if (FRAIS.activeLayer.isSet) {
			if (FRAIS.activeLayer.id < layer_id) 
				shift = "after"
			else 
				shift = "before"
			
			FRAIS.unsetActiveLayer();
		}
		FRAIS.activeLayer.id = layer_id;
		FRAIS.activeLayer.isSet = true;
		$("navBarSelectE").value = FRAIS.layers[FRAIS.activeLayer.id].level;
		FRAIS.layers[FRAIS.activeLayer.id].layer_loader_item.style.display = "";
		if(FRAIS.layerMode!="overview")FRAIS.layers[FRAIS.activeLayer.id].fp_loader_item.style.display = "";
		if(FRAIS.layerMode=="waypoints")
			FRAIS.layers[FRAIS.activeLayer.id].point_loader_item.style.display = "";
		FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("click", FRAIS.deactivatePoint, false);
		FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("click", FRAIS.deactivatePoint, false);
		
		FRAIS.layers[FRAIS.activeLayer.id].elem.style.borderTop = "2px solid rgb(27,165,229)";
		FRAIS.layers[FRAIS.activeLayer.id].label.style.borderTop="2px solid rgb(27,165,229)";
		FRAIS.layers[FRAIS.activeLayer.id].label.style.borderLeft="2px solid rgb(27,165,229)";
		FRAIS.layers[FRAIS.activeLayer.id].elem.style.zIndex = FRAIS.displayed_layers * 10;
		
		if ($("pointInfo") != null && FRAIS.layers[FRAIS.activeLayer.id].containsPoint(FRAIS.activePoint.id)) {
			$("pointInfo").style.borderTop = "2px solid rgb(27,165,229)";
			$("pointInfo").style.zIndex = FRAIS.displayed_layers * 10;
		}
		
		if (shift == "after") {
			var j = 0
			//layers after active layer
			for (var i = FRAIS.layers[FRAIS.activeLayer.id].layer_position + 1; i <= FRAIS.displayed_layers; i++) {
			
				if (FRAIS.getLayerByPosition(i) != null) {
					FRAIS.getLayerByPosition(i).elem.style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - ((FRAIS.layers[FRAIS.activeLayer.id].layer_position + j) * 10);
					if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
						$("pointInfo").style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - ((FRAIS.layers[FRAIS.activeLayer.id].layer_position + j) * 10);
					j++;
				}
			}
			//layers before active layer
			j = 1;
			for (var i = FRAIS.layers[FRAIS.activeLayer.id].layer_position - 1; i >= 1; i--) {
			
				if (FRAIS.getLayerByPosition(i) != null) {
					FRAIS.getLayerByPosition(i).elem.style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - (j * 10);
					if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
						$("pointInfo").style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - (j * 10);
					j++;
				}
			}
		}
		else 
			if (shift == "before") {
				var j = 1;
				for (var i = FRAIS.layers[FRAIS.activeLayer.id].layer_position + 1; i <= FRAIS.displayed_layers; i++) {
				
					if (FRAIS.getLayerByPosition(i) != null) {
						FRAIS.getLayerByPosition(i).elem.style.zIndex = (FRAIS.displayed_layers - j) * 10;
						if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
							$("pointInfo").style.zIndex = (FRAIS.displayed_layers - j) * 10;
						j++
					}
				}
				for (var i = FRAIS.layers[FRAIS.activeLayer.id].layer_position - 1; i >= 1; i--) {
				
					if (FRAIS.getLayerByPosition(i) != null) {
						FRAIS.getLayerByPosition(i).elem.style.zIndex = i * 10;
						if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
							$("pointInfo").style.zIndex = i * 10;
					}
				}
			}
			else {
				for (var i = FRAIS.displayed_layers; i > FRAIS.layers[FRAIS.activeLayer.id].layer_position + 1; i--) {
				
					if (FRAIS.getLayerByPosition(i) != null) {
						FRAIS.getLayerByPosition(i).elem.style.zIndex.style.zIndex = (FRAIS.layers_count - i + 1) * 10;
						if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
							$("pointInfo").style.zIndex = (FRAIS.layers_count - i + 1) * 10;
					}
				}
				for (var i = 1; i < FRAIS.layers[FRAIS.activeLayer.id].layer_position - 2; i++) {
				
					if (FRAIS.getLayerByPosition(i) != null) {
						FRAIS.getLayerByPosition(i).elem.style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - (i * 10);
						if($("pointInfo") != null && FRAIS.getLayerByPosition(i).containsPoint(FRAIS.activePoint.id))
							$("pointInfo").style.zIndex = FRAIS.getLayerByPosition(FRAIS.layers[FRAIS.activeLayer.id].layer_position).elem.style.zIndex - (i * 10);
					}
				}
			}
	}
}
//Function to make a layer inactive
FRAIS.unsetActiveLayer=function(){
	if(FRAIS.activeLayer.isSet){
		$("display_layer"+FRAIS.activeLayer.id).style.borderTop="0px";
		$("display_layer"+FRAIS.activeLayer.id).style.zIndex=(FRAIS.displayed_layers-1)*10;
		$("label"+FRAIS.activeLayer.id).style.borderTop="2px solid "+$("display_layer"+FRAIS.activeLayer.id).style.backgroundColor;
		$("label"+FRAIS.activeLayer.id).style.borderLeft="2px solid "+$("display_layer"+FRAIS.activeLayer.id).style.backgroundColor;
		if ($("pointInfo") != null && FRAIS.layers[FRAIS.activeLayer.id].containsPoint(FRAIS.activePoint.id)) {
			$("pointInfo").style.borderTop = "0px";
			$("pointInfo").style.zIndex = (FRAIS.displayed_layers-1) * 10;
		}
		FRAIS.layers[FRAIS.activeLayer.id].layer_loader_item.style.display="none";
		FRAIS.layers[FRAIS.activeLayer.id].point_loader_item.style.display="none";
		FRAIS.layers[FRAIS.activeLayer.id].fp_loader_item.style.display="none";
		FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("click",FRAIS.deactivatePoint,false);

		FRAIS.activeLayer.id=null;
		FRAIS.activeLayer.isSet=false;
	}
}

//Function to load the initial navigation bar of the editor into the html-document 
//the navigation bar uses a hierarchical system list-items in 5 steps named from  A to E
FRAIS.loadEditorNavBar=function(){
	//at first get the DIV element from the html-page
	var navBar=$("navBar");
	//probably obsolete reset button
	var navBarResetButton=document.createElement("input");
		navBarResetButton.id="navBarResetButton";
		navBarResetButton.type="button";
		navBarResetButton.value="Zum Anfang";
		navBarResetButton.style.display="none";
		navBarResetButton.addEventListener("click",FRAIS.resetNavBar,false);

	var navBarListA=document.createElement("ul");
		navBarListA.id="navBarListA";
		navBarListA.className="navBarList";

	var navBarSelectItemA=document.createElement("li");
		navBarSelectItemA.id="navBarSelectItemA";


	var navBarSelectA=document.createElement("select");
		navBarSelectA.name="navBarSelectA";
		navBarSelectA.id="navBarSelectA";
		navBarSelectA.className="navBarSelect";
		navBarSelectA.size=1;
		navBarSelectA.addEventListener("change",FRAIS.loadTask,false);
	
	var navBarSelectAOption0=document.createElement("option");
		navBarSelectAOption0.value=0;
	var navBarSelectAOption1=document.createElement("option");
		navBarSelectAOption1.value=1;
	var navBarSelectAOption2=document.createElement("option");
		navBarSelectAOption2.value=2;
	var navBarSelectAOption0Text=document.createTextNode("Bitte waehlen");
		navBarSelectAOption0.appendChild(navBarSelectAOption0Text);
	var navBarSelectAOption1Text=document.createTextNode("Projekt bearbeiten");
		navBarSelectAOption1.appendChild(navBarSelectAOption1Text);
	var navBarSelectAOption2Text=document.createTextNode("Projekt erstellen");
		navBarSelectAOption2.appendChild(navBarSelectAOption2Text);	
	
		navBarSelectA.appendChild(navBarSelectAOption0);
		navBarSelectA.appendChild(navBarSelectAOption1);
		navBarSelectA.appendChild(navBarSelectAOption2);
	
		navBarSelectItemA.appendChild(navBarSelectA);
		navBarListA.appendChild(navBarSelectItemA);
		navBar.appendChild(navBarListA);
		navBar.appendChild(navBarResetButton);
}
//Function to load the first task for creating a faclity routing system --> create or choose a project
FRAIS.loadTask=function(){
	var navBarSelectItemA=$("navBarSelectItemA");
	for(var i=1;i< navBarSelectItemA.childNodes.length;i++){
		navBarSelectItemA.removeChild(navBarSelectItemA.childNodes[i]);
	}
	FRAIS.resetMain();
		//navBarSelectA.addEventListener("change",resetMain,false);
	if (parseInt($("navBarSelectA").value) == 1) {
		var MyAjax = new Ajax.Request('php/loadProject.php', {
			method: 'post'
		});
	}
	if(parseInt($("navBarSelectA").value) == 2){
		var main=$("main");
		var addProjectList=document.createElement("ul");
			addProjectList.id="addProjectList";
			addProjectList.className="mainList";
		var addProjectNameItem=document.createElement("li");
			addProjectNameItem.id="addProjectNameItem";
			addProjectNameItem.appendChild(document.createTextNode("Projektname "));
		var addProjectNameInput=document.createElement("input");
			addProjectNameInput.id="addProjectNameInput";			
		var addProjectButton=document.createElement("input");
			addProjectButton.id="addProjectButton";
			addProjectButton.className="mainButton";
			addProjectButton.type="button";
			addProjectButton.value="Projekt erstellen"
			addProjectButton.addEventListener("click",FRAIS.addProject,false);
			addProjectNameItem.appendChild(addProjectNameInput);
			addProjectNameItem.appendChild(addProjectButton);
			
			addProjectList.appendChild(addProjectNameItem)
			main.appendChild(addProjectList);
			
			//$("navBarResetButton").style.display="inline";			
	}
}
//Function for creating a new project
FRAIS.addProject= function(){
	if ($("addProjectNameInput") != null) {
		var projectName = $("addProjectNameInput").value;
		if (projectName == "") {
			alert("Es wurde kein Name fuer das Projekt angegeben!");
		}
		else {
			if (projectName.length <= 45) {
				var MyAjax = new Ajax.Request('php/addProject.php', {
					method: 'post',
					parameters: {
						name: projectName
					}
				});
			}
			else {
				alert("Der Name fuer das Projekt ist zu lang!");
			}
		}
	}
}
//Function to choose to what to do with the chosen project
FRAIS.loadProjectTask= function(){
	//at first remove all subsequent list-items
	var navBarSelectItemB=$("navBarSelectItemB");
	for(var i=1;i< navBarSelectItemB.childNodes.length;i++){
		navBarSelectItemB.removeChild(navBarSelectItemB.childNodes[i]);
	}
	//clear the main DIV
	FRAIS.resetMain();
	//create the list-item with a select item to choose the task 
	if (parseInt($("navBarSelectB").value) != 0) {
		
		var navBarListC=document.createElement("ul");
			navBarListC.id="navBarListC";
			navBarListC.className="navBarList";
		var navBarSelectItemC = document.createElement("li");
			navBarSelectItemC.id = "navBarSelectItemC";
		
		
		var navBarSelectC = document.createElement("select");
			navBarSelectC.name = "navBarSelectC";
			navBarSelectC.id = "navBarSelectC";
			navBarSelectC.className="navBarSelect";
			navBarSelectC.size = 1;
			navBarSelectC.addEventListener("change", FRAIS.chooseProjectTask, false);
		
		var navBarSelectCOption0 = document.createElement("option");
			navBarSelectCOption0.value = 0;
		var navBarSelectCOption1 = document.createElement("option");
			navBarSelectCOption1.value = 1;
		var navBarSelectCOption2 = document.createElement("option");
			navBarSelectCOption2.value = 2;
		var navBarSelectCOption3 = document.createElement("option");
			navBarSelectCOption3.value = 3;
		var navBarSelectCOption4 = document.createElement("option");
			navBarSelectCOption4.value = 4;
		var navBarSelectCOption5 = document.createElement("option");
			navBarSelectCOption5.value = 5;
			
		var navBarSelectCOption0Text = document.createTextNode("Aufgabe waehlen");
			navBarSelectCOption0.appendChild(navBarSelectCOption0Text);
		var navBarSelectCOption1Text = document.createTextNode("Haeuser bearbeiten");
			navBarSelectCOption1.appendChild(navBarSelectCOption1Text);
		var navBarSelectCOption2Text = document.createTextNode("Ebenen bearbeiten");
			navBarSelectCOption2.appendChild(navBarSelectCOption2Text);
		var navBarSelectCOption3Text = document.createTextNode("Grundrisse bearbeiten");
			navBarSelectCOption3.appendChild(navBarSelectCOption3Text);
		var navBarSelectCOption4Text = document.createTextNode("Wegpunkte bearbeiten");
			navBarSelectCOption4.appendChild(navBarSelectCOption4Text);
		var navBarSelectCOption5Text = document.createTextNode("Projekt loeschen");
			navBarSelectCOption5.appendChild(navBarSelectCOption5Text);
		
		navBarSelectC.appendChild(navBarSelectCOption0);
		navBarSelectC.appendChild(navBarSelectCOption1);
		navBarSelectC.appendChild(navBarSelectCOption2);
		navBarSelectC.appendChild(navBarSelectCOption3);
		navBarSelectC.appendChild(navBarSelectCOption4);
		navBarSelectC.appendChild(navBarSelectCOption5);
		
		navBarSelectItemC.appendChild(navBarSelectC);
		navBarListC.appendChild(navBarSelectItemC);
		navBarSelectItemB.appendChild(navBarListC);
		
	}
}
//Function to choose the project task
FRAIS.chooseProjectTask= function(){
	var navBarSelectItemC=$("navBarSelectItemC");
	for(var i=1;i< navBarSelectItemC.childNodes.length;i++){
		navBarSelectItemC.removeChild(navBarSelectItemC.childNodes[i]);
	}
	FRAIS.resetMain();
	
	var navBarSelectC=$("navBarSelectC");
	
	if(navBarSelectC.value==1){
		FRAIS.manageBuildings();
	}
	if(navBarSelectC.value==2){
		FRAIS.getBuildingsForLevels();
	}
	if(navBarSelectC.value==3){
		FRAIS.layerMode="floorplan";
		FRAIS.getBuildingsForFloorplans();
	}
	if(navBarSelectC.value==4){
		FRAIS.layerMode="waypoints";
		FRAIS.getBuildingsForWaypoints();
	}
	if(navBarSelectC.value==5){
		FRAIS.deleteProject();
	}
}

//function for deleting the chosen project
FRAIS.deleteProject= function(){
	var project = parseInt($("navBarSelectB").value);
	if(project==0){
		alert("Kein Projekt ausgewaehlt!");
		return;
	}

	if (window.confirm("Dieses Projekt wirklich loeschen?")) {		
		var MyAjax = new Ajax.Request('php/deleteProject.php', {
			method: 'post',
			parameters: {
				projectId: project,
			}
		});
	}
	
}
//Function for choosing a layer from the fifth select item to be loaded into the editor
FRAIS.chooseLayer= function(){
	
	var level=parseInt($("navBarSelectE").value);
	var layer=FRAIS.getLayerByLevel(level);
	if (layer != null) 
		if (layer.elem.style.display != "none") {
			FRAIS.setActiveLayer(layer.id);	
		}
		else {
			layer.addLayer(layer);
		}
	else {
		if (FRAIS.activeLayer.isSet) {
			FRAIS.layers[FRAIS.activeLayer.id].layer_loader_item.style.display = "none";
		}
	}
}

////////////////////////////////////
// Functions for building management
////////////////////////////////////

// show the building management form
FRAIS.manageBuildings=function(){
	var main= $("main");
	var manageBuildingList=document.createElement("ul");
		manageBuildingList.id="manageBuildingList";
		manageBuildingList.className="mainList";
	var addBuildingHeaderItem=document.createElement("li");
		addBuildingHeaderItem.id="addBuildingHeaderItem";
		addBuildingHeaderItem.className="listHeader";
		addBuildingHeaderItem.appendChild(document.createTextNode("Haus hinzufuegen "));
	var addBuildingItem=document.createElement("li");
		addBuildingItem.id="addBuildingItem";
		addBuildingItem.appendChild(document.createTextNode("Hausbeschreibung "));
	var addBuildingDescInput=document.createElement("input");
		addBuildingDescInput.id="addBuildingDescInput";
	var addBuildingButton=document.createElement("input");
		addBuildingButton.id="addBuildingButton";
		addBuildingButton.className="mainButton";
		addBuildingButton.type="button";
		addBuildingButton.value="Haus hinzufuegen"
		addBuildingButton.addEventListener("click",FRAIS.addBuilding,false);
		addBuildingItem.appendChild(addBuildingDescInput);
		addBuildingItem.appendChild(addBuildingButton);
		
		manageBuildingList.appendChild(addBuildingHeaderItem);	
		manageBuildingList.appendChild(addBuildingItem);
		main.appendChild(manageBuildingList);
		FRAIS.getBuildingsForDelete();
}

// Add a building to the database, the selected project is used for database reference
FRAIS.addBuilding=function(){
	var buildingDesc=$("addBuildingDescInput").value;
	var project=parseInt($("navBarSelectB").value);
	if(buildingDesc!=""){
		if(buildingDesc.length <= 50){
			var MyAjax = new Ajax.Request('php/addBuilding.php', {
					method: 'post',
					parameters: {
						desc: buildingDesc,
						projectId: project
					}
			});
		}
		else{
			alert("Die Hausbeschreibung ist zu lang!");
		}
	}
	else{
		alert("Es wurde keine Hausbeschreibung angegeben!");
	}
}

//get all available buildings for the building management form
FRAIS.getBuildingsForDelete=function(){
	var project=parseInt($("navBarSelectB").value);
	var MyAjax = new Ajax.Request('php/getBuildingsForDelete.php', {
		method: 'post',
		parameters: {
			projectId: project
		}
	});
}

//function for deleting a building
FRAIS.deleteBuilding=function(){
	var project = parseInt($("navBarSelectB").value);
	var building = parseInt($("delBuildingSelect").value);
	if (building != 0) {
		if (window.confirm("Dieses Gebaeude wirklich loeschen?")) {		
			var MyAjax = new Ajax.Request('php/deleteBuilding.php', {
				method: 'post',
				parameters: {
					projectId: project,
					buildingId: building
				}
			});
		}
	}
	else{
		alert("Es wurde kein Haus ausgewaehlt!");
	}
}

/////////////////////////////////
// Functions for level management
/////////////////////////////////
//Get the buildings the levels belong to and add them to the nav bar
FRAIS.getBuildingsForLevels= function(){
	var project=parseInt($("navBarSelectB").value);
	var MyAjax = new Ajax.Request('php/getBuildingsForLevels.php', {
		method: 'post',
		parameters: {
			projectId: project
		}
	});	
}
// show the level management form
FRAIS.manageLevels= function(){
	var navBarSelectItemD=$("navBarSelectItemD");
	for(var i=1;i< navBarSelectItemD.childNodes.length;i++){
		navBarSelectItemD.removeChild(navBarSelectItemD.childNodes[i]);
	}
	FRAIS.resetMain();
	
	if (parseInt($("navBarSelectD").value) != 0) {
		var main = $("main");
		
		var manageLevelForm= document.createElement("form");
			manageLevelForm.action="php/upload.php";
			manageLevelForm.method="post";
			manageLevelForm.enctype="multipart/form-data";
			manageLevelForm.target="uploadFrame";
		    manageLevelForm.addEventListener("submit", FRAIS.addLevel, false);
		
		var manageLevelList = document.createElement("ul");
		manageLevelList.id = "manageLevelList";
		manageLevelList.className = "mainList";
		
		var addLevelHeaderItem = document.createElement("li");
		addLevelHeaderItem.id = "addLevelHeaderItem";
		addLevelHeaderItem.className = "listHeader";
		addLevelHeaderItem.appendChild(document.createTextNode("Ebene hinzufuegen "));
		
		var addLevelDescItem = document.createElement("li");
		addLevelDescItem.id = "addLevelDescItem";
		addLevelDescItem.appendChild(document.createTextNode("Ebenenbeschreibung "));
		
		var addLevelDescInput = document.createElement("input");
		addLevelDescInput.id = "addLevelDescInput";
		
		var addLevelFloorplanImageItem = document.createElement("li");
		addLevelFloorplanImageItem.id = "addLevelFloorplanImageItem";
		addLevelFloorplanImageItem.appendChild(document.createTextNode("Grundrissgrafik der Ebene "));
		
		var addLevelFloorplanImageInput = document.createElement("input");
		addLevelFloorplanImageInput.id = "addLevelFloorplanImageInput";
		addLevelFloorplanImageInput.name="addLevelFloorplanImageInput";
		addLevelFloorplanImageInput.type = "file";
		addLevelFloorplanImageInput.accept = "*.jpg,*.jpeg,*.png,*.gif";
		
		var addLevelFloorplanLengthItem = document.createElement("li");
		addLevelFloorplanLengthItem.id = "addLevelFloorplanLengthItem";
		addLevelFloorplanLengthItem.appendChild(document.createTextNode("Breite der Grundrissgrafik in Pixeln "));
		
		var addLevelFloorplanLengthInput = document.createElement("input");
		addLevelFloorplanLengthInput.id = "addLevelFloorplanLengthInput";
		addLevelFloorplanLengthInput.type = "input";
		
		var addLevelFloorplanHeightItem = document.createElement("li");
		addLevelFloorplanHeightItem.id = "addLevelFloorplanHeightItem";
		addLevelFloorplanHeightItem.appendChild(document.createTextNode("Hoehe der Grundrissgrafik in Pixeln "));
		
		var addLevelFloorplanHeightInput = document.createElement("input");
		addLevelFloorplanHeightInput.id = "addLevelFloorplanHeightInput";
		addLevelFloorplanHeightInput.type = "input";
		
		var addLevelFloorplanRefXItem = document.createElement("li");
		addLevelFloorplanRefXItem.id = "addLevelFloorplanRefXItem";
		addLevelFloorplanRefXItem.appendChild(document.createTextNode("X-Referenzkoordinate der Grundrissgrafik "));
		
		var addLevelFloorplanRefXInput = document.createElement("input");
		addLevelFloorplanRefXInput.id = "addLevelFloorplanRefXInput";
		addLevelFloorplanRefXInput.type = "input";
		
		var addLevelFloorplanRefYItem = document.createElement("li");
		addLevelFloorplanRefYItem.id = "addLevelFloorplanRefYItem";
		addLevelFloorplanRefYItem.appendChild(document.createTextNode("Y-Referenzkoordinate der Grundrissgrafik "));
		
		var addLevelFloorplanRefYInput = document.createElement("input");
		addLevelFloorplanRefYInput.id = "addLevelFloorplanRefYInput";
		addLevelFloorplanRefYInput.type = "input";
		
		var addLevelFloorplanScaleItem = document.createElement("li");
		addLevelFloorplanScaleItem.id = "addLevelFloorplanScaleItem";
		addLevelFloorplanScaleItem.appendChild(document.createTextNode("Massstabszahl der Grundrissgrafik "));
		
		var addLevelFloorplanScaleInput = document.createElement("input");
		addLevelFloorplanScaleInput.id = "addLevelFloorplanScaleInput";
		addLevelFloorplanScaleInput.type = "input";
		
		var addLevelButtonItem = document.createElement("li");
		addLevelButtonItem.id = "addLevelButtonItem";
		
		var addLevelButton = document.createElement("input");
		addLevelButton.id = "addLevelButton";
		addLevelButton.name = "addLevelButton";
		addLevelButton.className = "mainButton";
		addLevelButton.type = "submit";
		addLevelButton.value = "Ebene hinzufuegen"
		//addLevelButton.addEventListener("submit", FRAIS.addLevel, false);
		
		var uploadFrame=document.createElement("iframe");
			uploadFrame.id="uploadFrame";
			uploadFrame.name="uploadFrame";
			uploadFrame.src="#";
			uploadFrame.style.width="0px";
			uploadFrame.style.height="0px";
			uploadFrame.style.border="0px solid #fff";
		
		addLevelDescItem.appendChild(addLevelDescInput);
		addLevelFloorplanImageItem.appendChild(addLevelFloorplanImageInput);
		addLevelFloorplanLengthItem.appendChild(addLevelFloorplanLengthInput);
		addLevelFloorplanHeightItem.appendChild(addLevelFloorplanHeightInput);
		addLevelFloorplanRefXItem.appendChild(addLevelFloorplanRefXInput);
		addLevelFloorplanRefYItem.appendChild(addLevelFloorplanRefYInput);
		addLevelFloorplanScaleItem.appendChild(addLevelFloorplanScaleInput);
		addLevelButtonItem.appendChild(addLevelButton);
		addLevelButtonItem.appendChild(uploadFrame);
		
		manageLevelList.appendChild(addLevelHeaderItem);
		manageLevelList.appendChild(addLevelDescItem);
		manageLevelList.appendChild(addLevelFloorplanImageItem);
		manageLevelList.appendChild(addLevelFloorplanLengthItem);
		manageLevelList.appendChild(addLevelFloorplanHeightItem);
		manageLevelList.appendChild(addLevelFloorplanRefXItem);
		manageLevelList.appendChild(addLevelFloorplanRefYItem);
		manageLevelList.appendChild(addLevelFloorplanScaleItem);
		manageLevelList.appendChild(addLevelButtonItem);
		
		manageLevelForm.appendChild(manageLevelList);
		
		main.appendChild(manageLevelForm);
		
		FRAIS.getLevelsForDelete();
	}
}
//get all available levels for the level management form
FRAIS.getLevelsForDelete=function(){
	var project=parseInt($("navBarSelectB").value);
	var building=parseInt($("navBarSelectD").value);
	var MyAjax = new Ajax.Request('php/getLevelsForDelete.php', {
		method: 'post',
		parameters: {
			projectId: project,
			buildingId: building
		}
	});
}
//Function for deleting a level
FRAIS.deleteLevel=function(){
	var project = parseInt($("navBarSelectB").value);
	var building = parseInt($("navBarSelectD").value);
	if(project==0){
		alert("Kein Projekt ausgewaehlt!");
		return;
	}
	var building=parseInt($("navBarSelectD").value);
	if(building==0){
		alert("Kein Haus ausgewaehlt!");
		return;
	}
	var level = parseInt($("delLevelSelect").value);
	if (level != 0) {
		if (window.confirm("Diese Etage wirklich loeschen?")) {		
			var MyAjax = new Ajax.Request('php/deleteLevel.php', {
				method: 'post',
				parameters: {
					projectId: project,
					buildingId: building,
					levelId: level
				}
			});
		}
	}
	else{
		alert("Es wurde keine Etage ausgewaehlt!");
	}
}
//Function for adding a level
FRAIS.addLevel=function(e){
	if(!e) e=window.event;
	
	var project=parseInt($("navBarSelectB").value);
	if(project==0){
		alert("Kein Projekt ausgewaehlt!");
		e.preventDefault();
		return;
	}
	var building=parseInt($("navBarSelectD").value);
	if(building==0){
		alert("Kein Haus ausgewaehlt!");
		e.preventDefault();
		return;
	}
	var desc=$("addLevelDescInput").value;
	if(desc==""){
		alert("Es wurde keine Ebenenbeschreibung angegeben!");
		e.preventDefault();
		return;
	}
	var image=$("addLevelFloorplanImageInput").value;
	if(!image.match(/(.jpg|.jpeg|.png|.gif)$/i)){
		alert("Falsches Bildformat oder keine Grundrissgrafik angegeben!");
		e.preventDefault();
		return;
	}
	var length=$("addLevelFloorplanLengthInput").value;
	if(!length.match(/^[1-9][0-9]*$/)){
		alert("Ungueltige Grundrissbreite angegeben!");
		e.preventDefault();
		return;
	}
	var height=$("addLevelFloorplanHeightInput").value;
	if(!height.match(/^[1-9][0-9]*$/)){
		alert("Ungueltige Grundrisshoehe angegeben!");
		e.preventDefault();
		return;
	}
	var refX=$("addLevelFloorplanRefXInput").value;
	if(!refX.match(/^([0-9]|[1-9][0-9]+)$/)){
		alert("Ungueltige X Referenzkoordinate angegeben!");
		e.preventDefault();
		return;
	}
	var refY=$("addLevelFloorplanRefYInput").value;
	if(!refY.match(/^([0-9]|[1-9][0-9]+)$/)){
		alert("Ungueltige Y Referenzkoordinate angegeben!");
		e.preventDefault();
		return;
	}
	var scale=$("addLevelFloorplanScaleInput").value;
	if(!scale.match(/^[1-9]+$/)){
		alert("Ungueltige Massstabszahl angegeben!");
		e.preventDefault();
		return;
	}
	/*
	var MyAjax = new Ajax.Request('php/addLevel.php', {
		method: 'post',
		parameters: {
			buildingId: building,
			projectId: project,
			levelDesc: desc,
			imagePath: image,
			imageWidth: length,
			imageHeight: height,
			imageRefX: refX,
			imageRefY: refY,
			imageScale: scale
		}
	});
	*/
}
/////////////////////////////////////
// Functions for floorplan management
/////////////////////////////////////
//Get the buildings the floorplans belong to based on the chosen project
FRAIS.getBuildingsForFloorplans= function(){
	var project=parseInt($("navBarSelectB").value);
	var MyAjax = new Ajax.Request('php/getBuildingsForFloorplans.php', {
		method: 'post',
		parameters: {
			projectId: project
		}
	});
}
//Get the levels the floorplans belong to based on the chosen project and building
FRAIS.loadLevelsForFloorplans= function(){
	var navBarSelectItemD=$("navBarSelectItemD");
	for(var i=1;i< navBarSelectItemD.childNodes.length;i++){
		navBarSelectItemD.removeChild(navBarSelectItemD.childNodes[i]);
	}
	FRAIS.resetMain();
	if (parseInt($("navBarSelectD").value) != 0) {
		var project = parseInt($("navBarSelectB").value);
		var building = $("navBarSelectD").value;
		var MyAjax = new Ajax.Request('php/loadLevelsForFloorplans.php', {
			method: 'post',
			parameters: {
				projectId: project,
				buildingId: building
			}
		});
	}
}

/////////////////////////////////////
// Functions for waypoints management
/////////////////////////////////////
//Get the buildings the waypoints belong to based on the chosen project
FRAIS.getBuildingsForWaypoints= function(){
	var project=parseInt($("navBarSelectB").value);
	var MyAjax = new Ajax.Request('php/getBuildingsForWaypoints.php', {
		method: 'post',
		parameters: {
			projectId: project
		}
	});
}
//Get the levels the waypoints belong to based on the chosen project and building
FRAIS.loadLevelsForWaypoints= function(){
	var navBarSelectItemD=$("navBarSelectItemD");
	for(var i=1;i< navBarSelectItemD.childNodes.length;i++){
		navBarSelectItemD.removeChild(navBarSelectItemD.childNodes[i]);
	}
	FRAIS.resetMain();
	if (parseInt($("navBarSelectD").value) != 0 && parseInt($("navBarSelectD").value) != 999) {
		FRAIS.layerMode="waypoints";
		var project = parseInt($("navBarSelectB").value);
		var building = $("navBarSelectD").value;
		var MyAjax = new Ajax.Request('php/loadLevelsForWaypoints.php', {
			method: 'post',
			parameters: {
				projectId: project,
				buildingId: building
			}
		});
	}
	if (parseInt($("navBarSelectD").value) == 999) {
		FRAIS.layerMode="overview";
		var project = parseInt($("navBarSelectB").value);
		//var building = $("navBarSelectD").value;
		var MyAjax = new Ajax.Request('php/loadLevelsWithAllBuildingsForWaypoints.php', {
			method: 'post',
			parameters: {
				projectId: project
				//buildingId: building
			}
		});
	}
	
}

/*FRAIS.loadLayers=function(){
	var db=$("navBarSelect").value;

	var MyAjax = new Ajax.Request('php/loadLayers.php', {
			method: 'post',
			parameters: {
				database: db
			}
		});
}
*/
//Function for resetting the nav bar to its initial state
FRAIS.resetNavBar= function(){
	
	var navBar=$("navBar");

	var oldNavBarList=$("navBarListA");
		
	var navBarResetButton=document.createElement("input");
		navBarResetButton.id="navBarResetButton";
		navBarResetButton.type="button";
		navBarResetButton.value="Zum Anfang";
		navBarResetButton.style.display="none";
		navBarResetButton.addEventListener("click",FRAIS.resetNavBar,false);

	var navBarListA=document.createElement("ul");
		navBarListA.id="navBarListA";
		navBarListA.className="navBarList";

	var navBarSelectItemA=document.createElement("li");
		navBarSelectItemA.id="navBarSelectItemA";


	var navBarSelectA=document.createElement("select");
		navBarSelectA.name="navBarSelectA";
		navBarSelectA.id="navBarSelectA";
		navBarSelectA.className="navBarSelect";
		navBarSelectA.size=1;
		navBarSelectA.addEventListener("change",FRAIS.loadTask,false);
	
	var navBarSelectAOption0=document.createElement("option");
		navBarSelectAOption0.value=0;
	var navBarSelectAOption1=document.createElement("option");
		navBarSelectAOption1.value=1;
	var navBarSelectAOption2=document.createElement("option");
		navBarSelectAOption2.value=2;
	var navBarSelectAOption0Text=document.createTextNode("Bitte waehlen");
		navBarSelectAOption0.appendChild(navBarSelectAOption0Text);
	var navBarSelectAOption1Text=document.createTextNode("Projekt bearbeiten");
		navBarSelectAOption1.appendChild(navBarSelectAOption1Text);
	var navBarSelectAOption2Text=document.createTextNode("Projekt erstellen");
		navBarSelectAOption2.appendChild(navBarSelectAOption2Text);	
	
		navBarSelectA.appendChild(navBarSelectAOption0);
		navBarSelectA.appendChild(navBarSelectAOption1);
		navBarSelectA.appendChild(navBarSelectAOption2);
	
		navBarSelectItemA.appendChild(navBarSelectA);
		navBarListA.appendChild(navBarSelectItemA);
		navBar.appendChild(navBarListA);
		navBar.appendChild(navBarResetButton);
		
		navBar.replaceChild(navBarListA,oldNavBarList);
		
		FRAIS.resetMain();		
}
//Function to clear the main DIV of the FRAIS
FRAIS.resetMain= function(){
	if($("main")!=null){
		var main=$("main");

		while(main.childNodes.length > 0){
			main.removeChild(main.firstChild);
		}
		if(FRAIS.layers.length!=0){
			FRAIS.layers=new Array();
			FRAIS.layers_count=0;
			FRAIS.displayed_layers=0;
			FRAIS.activePoint={id:null, isSet:false};
			FRAIS.activeLayer={id:null, isSet:false};
			FRAIS.activeBuilding=null;
			FRAIS.activeProject=null;
		}	
		if(FRAIS.wayPoints.length!=0){
			FRAIS.wayPoints=new Array();
		}
		if(FRAIS.FPElements.length!=0){
			FRAIS.FPElements=new Array();
		}
	}
}
//Function to get a layer by its level
FRAIS.getLayerByLevel= function(level){
	for(var i=1; i<= FRAIS.layers_count;i++){
		if(FRAIS.layers[i].level==level)
			return FRAIS.layers[i];
	}
	return null;
}


//class for way points
FRAIS.WayPoint= function(x,y,id,type,desc,dest,level,building,project,layer){
	
	var that=this; // reference to the own object
	
	this.x=x;	// x-coordinate
	this.y=y;	// y-coordinate
	this.id=id; // unique id
    this.type=type; // type of point (eg. waypoint, lift) as 2-character abbreviation
    this.desc=desc; // waypoint description, only necessary for points as destination
	this.dest=dest; //boolean if this waypoint is a destination and can be chosen for search
	this.level=level; // corresponding level
	this.building=building; // corrsponding building
	this.project=project; // corresponding project
	this.layer=layer; // corresponding layer
	
	
	this.NPs=new Array(); // array for neighbour points
	//number of neighbour points can vary. neighbour points are always the last parameters in the constructor
	if(arguments.length >=11){
		for(var i=11;i<=arguments.length;i++){
			this.NPs[i-11]=arguments[i-1];
		}
	}
	// preparation for the svg element of the waypoint
	this.SVGElem = null;
	
	// method for checking if a point is neighbour
	this.hasNeighbour = function(id){
		if(that.id==id)return true;
		for(var i=0; i<this.NPs.length;i++){
			if(this.NPs[i] == id) 
				return true;
		}
		return false;
	}
	//method for adding a neighbour
	this.addNeighbour= function(id){
		if (this.hasNeighbour(id) || that.id==id) {
			return false
		}
		else {
			for(var i=0; i<this.NPs.length;i++){
				if(this.NPs[i] == null){
					this.NPs[i] = id;
					var added=true;
					break;
				}
				else{
					var added=false;
				}
			}
			if(!added) 
				this.NPs[this.NPs.length]=id;
			return true;
		}
	}
	//method for removing a neighbour
	this.removeNeighbour=function(id){
		if (!this.hasNeighbour(id) || that.id==id) {
			return false
		}
		else{
			for(var i=0; i<this.NPs.length;i++){
				if (this.NPs[i] == id) {
					this.NPs[i] = null;
					return true;
				}
			}
		}
	}
	//method for removing all neighbours
	this.removeAllNeighbours = function(){
		for(var i=0; i<this.NPs.length;i++){
			if(this.NPs[i]!=null)
				FRAIS.wayPoints[this.NPs[i]].removeNeighbour(this.id);
				
			this.NPs[i]=null;
		}
		return true;
	}
	//method for adding the waypoint to the svg document
	this.addToScreen = function(){
		if(this.SVGElem != null)
			FRAIS.layers[this.layer].SVGDoc.documentElement.appendChild(this.SVGElem);
	}
	
}

// Class for floorplan elements
FRAIS.FPElement = function(id,level,building,project,layer,type,loaded){
	this.id =id; // unique id
	this.level=level; //corresponding level
	this.building=building; //corresponding building
	this.project=project; //corresponding project
	this.layer=layer; //corresponding layer
	this.type=type; // the geometry type in the mysql database
	this.floorPoints=new Array(); // the points creating the geometry
	this.floorPointsCount=0; // number of points in the geometry
	this.finished=false; // flag variable indicating the status of the FPElement
	this.loaded=loaded; //flag variable indicating that the FPElement was loaded from the database
	this.SVGElem=null;
}
//FPElement-method for adding the floorplan element to the svg document
FRAIS.FPElement.prototype.addToScreen = function(){	
	if(this.SVGElem!=null && FRAIS.layers[FRAIS.activeLayer.id].SVGDoc !=null)
		FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.appendChild(this.SVGElem);
}
//FPElement-method for creating the floorpoints of the FPElement from the well-known-text of the geometry in the database 
FRAIS.FPElement.prototype.loadFloorpointsFromWKTGeometry = function(WKTGeometry){

	this.type = WKTGeometry.slice(0,WKTGeometry.indexOf("("));
	
	if (this.type == "LINESTRING") {
		var points = WKTGeometry.slice(WKTGeometry.indexOf("(") + 1, WKTGeometry.indexOf(")")).split(",");
		for (var i = 0; i < points.length; i++) {
			var temp_points = points[i].split(" ");
			this.floorPoints[++this.floorPointsCount] = new FRAIS.FloorPoint(parseInt(temp_points[0]), parseInt(temp_points[1]), this.floorPointsCount, "FP", this);
		}
	}
	if (this.type == "POLYGON") {
		var points = WKTGeometry.slice(WKTGeometry.indexOf("(") + 2, WKTGeometry.indexOf(")")).split(",");
		
		for (var i = 0; i < points.length-1; i++) {
			var temp_points = points[i].split(" ");
			this.floorPoints[++this.floorPointsCount] = new FRAIS.FloorPoint(parseInt(temp_points[0]), parseInt(temp_points[1]), this.floorPointsCount, "FP", this);
		}
	}
}
//Function for adding a new floorplan element in the editor
FRAIS.addFPElement= function(e){
	
	if(!e) e=window.event;
	if (e.detail) {
		//Check for double click
		if (e.detail == 2) {
			//Check that there is no drawing in progress 
			if (!FRAIS.drawing && FRAIS.activeFPElement == null){
				FRAIS.tempFPElement = new FRAIS.FPElement(FRAIS.maxFPElementsId+1,FRAIS.layers[FRAIS.activeLayer.id].level,
				FRAIS.activeBuilding,FRAIS.activeProject,FRAIS.activeLayer.id,"",false);
				FRAIS.activeFPElement=FRAIS.maxFPElementsId+1;
				FRAIS.drawing=true;
			}
			
			if (FRAIS.activeFPElement == (FRAIS.maxFPElementsId + 1) && FRAIS.tempFPElement!=null) {
				//Check if the element is already finished, i.e. floor points can't be added anymore
				if (!FRAIS.tempFPElement.finished) {
					//Create new floor point
					FRAIS.tempFPElement.floorPoints[++FRAIS.tempFPElement.floorPointsCount] = new FRAIS.FloorPoint(FRAIS.realXCoordinate(e.clientX), FRAIS.realYCoordinate(e.clientY), FRAIS.tempFPElement.floorPointsCount, "FP", FRAIS.tempFPElement);
					FRAIS.tempFPElement.floorPoints[FRAIS.tempFPElement.floorPointsCount].addToScreen();
					
					if (FRAIS.tempFPElement.floorPointsCount > 1) {
						FRAIS.tempFPElement.floorPoints[FRAIS.tempFPElement.floorPointsCount - 1].svgElem.setAttributeNS(null, "fill", "red");
						FRAIS.tempFPElement.floorPoints[FRAIS.tempFPElement.floorPointsCount - 1].svgElem.removeEventListener("click", FRAIS.removeFloorPoint, false);
					}
					//Floor plan element can be finished as a linestring by Shift + click on the SVG
					FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.addEventListener("click", FRAIS.finishLinestringFPElement, false);
				}
			}
			else {
				if (!FRAIS.FPElements[FRAIS.activeFPElement].finished) {
					FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[++FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount] = new FRAIS.FloorPoint(FRAIS.realXCoordinate(e.clientX), FRAIS.realYCoordinate(e.clientY), FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount, "FP", FRAIS.FPElements[FRAIS.activeFPElement]);
					FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount].addToScreen();
					
					if (FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount > 1) {
						FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount - 1].svgElem.setAttributeNS(null, "fill", "red");
						FRAIS.FPElements[FRAIS.activeFPElement].floorPoints[FRAIS.FPElements[FRAIS.activeFPElement].floorPointsCount - 1].svgElem.removeEventListener("click", FRAIS.removeFloorPoint, false);
					}
					//Floor plan element can be finished as a linestring by Shift + click on the SVG
					FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.addEventListener("click", FRAIS.finishLinestringFPElement, false);
				}
			}
		}
	}

}

/*FRAIS.FPElementGeomToJsonString=function(FPElementId){
	if (FRAIS.FPElements[FPElementId] != null && FRAIS.FPElements[FPElementId].finished) {
		var JSONString = "[{\"type\": \"" + FRAIS.FPElements[FPElementId].type + "\", \"floorPoints\":[\n";
		for (var j = 1; j < FRAIS.FPElements[FPElementId].floorPointsCount; j++) {
			if (j > 1) JSONString += ",";
			JSONString += "{\"id\":" + FRAIS.FPElements[FPElementId].floorPoints[j].id + ",\"x\":" + FRAIS.FPElements[FPElementId].floorPoints[j].x + ",\"y\":" +
						  FRAIS.FPElements[FPElementId].floorPoints[j].y +",\"type\":\"" + FRAIS.FPElements[FPElementId].floorPoints[j].type + "\",\"FPElement\":" +
						  FRAIS.FPElements[FPElementId].floorPoints[j].FPElement +"}\n";
		}
		JSONString += "],\"loaded\":" + FRAIS.FPElements[FPElementId].loaded + "}\n]";
		
		return JSONString;
	}
	else{
		return "";
	}
}
*/

//Function to create a well-known-text of a floorplan element
FRAIS.FPElementGeomToWKT= function(FPElement){
	if (FPElement != null && FPElement.finished) {
		var wkt= FPElement.type+"(";
		if(FPElement.type=="POLYGON") wkt+="(";
		for (var j = 1; j <= FPElement.floorPointsCount; j++) {
			if (j > 1) wkt += ",";
			wkt += FPElement.floorPoints[j].x + " " + FPElement.floorPoints[j].y 
		}
		if(FPElement.type=="POLYGON") wkt+="," + FPElement.floorPoints[1].x + " " + FPElement.floorPoints[1].y 
		wkt+=")"
		if(FPElement.type=="POLYGON") wkt+=")";
		return wkt;
	}
	else{
		return "";
	}
}
//Function to save a floorplan element in the databse 
FRAIS.saveFPElement= function(FPElement,geomType){
	if (FPElement != null) {
		FPElement.type = geomType;
		var geomWKT = FRAIS.FPElementGeomToWKT(FPElement);
		if (geomWKT != "") {

			var action;
			//Determining database transaction
			if (FPElement.loaded) {
				action = 1; //update in the database
			}
			else {
				action = 2; //insert in the database
			}
			var wktAjax = new Ajax.Request('php/saveFPElement.php', {
				method: 'post',
				parameters: {
					id: FPElement.id,
					mode: action,
					type: geomType,
					level: FPElement.level,
					building: FPElement.building,
					project: FPElement.project,
					wkt: geomWKT
				}
			});
			
		}
		else {
			alert("Floorplan element could not be saved!");
		}
	}else{
		alert("Empty FPElement Object for saveFPElement");
	}
	
}
//Function for finshing a floorplan element as a polygon
FRAIS.finishPolygonFPElement=function(e){
	
	if (!e) 
		e = window.event;
		e.stopPropagation();
	if (e.shiftKey) {
		
		if(FRAIS.tempFPElement!=null){
			 var FPElement=FRAIS.tempFPElement;
		}
		else{
			 var FPElement=FRAIS.FPElements[FRAIS.activeFPElement];
		}
		
		if (FPElement.floorPointsCount >= 3) {
				
			//if (confirm("POLYGON Element abschliessen?")) {
				FPElement.finished = true;
				FRAIS.saveFPElement(FPElement, "POLYGON");
				//for(var i=1;i<=FPElement.floorPointsCount;i++){
				//	FPElement.floorPoints[i].svgElem.addEventListener("click", FRAIS.updateFinishedFPElement, false);
				//}
				//FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener("click", FRAIS.finishPolygonFPElement, false);
			//}
		}
		else{
			alert("Polygon Element kann noch nicht geschlossen werden!")
		}
	}
	
}
//Function for finshing a floorplan element as a linestring
FRAIS.finishLinestringFPElement=function(e){
	
	if (!e) 
		e = window.event;
		e.stopPropagation();
	if (e.shiftKey) {

		//if (confirm("LINESTRING Element abschliessen?")) {
			if(FRAIS.tempFPElement!=null){
			 	var FPElement=FRAIS.tempFPElement;
			}
			else{
			 	var FPElement=FRAIS.FPElements[FRAIS.activeFPElement];
			}
			FPElement.floorPoints[++FPElement.floorPointsCount] = new FRAIS.FloorPoint(FRAIS.realXCoordinate(e.clientX), FRAIS.realYCoordinate(e.clientY), FPElement.floorPointsCount, "FP", FPElement);
			FPElement.finished = true;
			FRAIS.saveFPElement(FPElement, "LINESTRING");
			//for(var i=1;i<=FPElement.floorPointsCount;i++){
			//	FPElement.floorPoints[i].svgElem.addEventListener("click", FRAIS.updateFinishedFPElement, false);
			//}
			//FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener("click", FRAIS.finishLinestringFPElement, false);
			
		//}
	}
	
}
// Function to re-open a finished floorplan element for editing
FRAIS.reopenFPElement=function(e){
	if (!e) 
		e = window.event;
		e.stopPropagation();
	if (e.shiftKey) {
		if (!FRAIS.activeFPElement) {
			var FPElement = parseInt(parseInt(e.currentTarget.getAttributeNS(null, "id").match(/[0-9]+/)) / 100);
			var geomType = FRAIS.FPElements[FPElement].type;
			if (geomType == "LINESTRING" && FRAIS.activeLayer.isSet) {
				//if (confirm(geomType + " Element oeffnen?")) {
					FRAIS.hideFloorPointInfo();
					FRAIS.activeFPElement = FPElement;
					FRAIS.drawing = true;
					FRAIS.FPElements[FPElement].finished = false;
					FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem);
					FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgLine);
					FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount] = null;
					FRAIS.FPElements[FPElement].floorPointsCount--;
					FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.setAttributeNS(null, "fill", "yellow");
					if (FRAIS.FPElements[FPElement].floorPointsCount > 1) {
						FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
					}
					//FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.setAttributeNS(null, "fill", "yellow");
					//FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.removeEventListener("click", FRAIS.reopenFPElement, false);
					//FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
					FRAIS.FPElements[FPElement].floorPoints[1].svgElem.addEventListener("click", FRAIS.finishPolygonFPElement, false);
					
					//FRAIS.activeFPElement = FPElement;
					FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.addEventListener("click", FRAIS.finishLinestringFPElement, false);
					
					for(var i=1;i<=FRAIS.FPElements[FPElement].floorPointsCount;i++){
						FRAIS.FPElements[FPElement].floorPoints[i].svgElem.removeEventListener("click", FRAIS.updateFinishedFPElement, false);
					}
				//}
			}
			else 
				if (geomType == "POLYGON") {
					//if (confirm(geomType + " Element oeffnen?")) {
						var firstPoint = FRAIS.FPElements[FPElement].floorPoints[1];
						FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(firstPoint.svgLine);
						firstPoint.svgLine = null;
						FRAIS.FPElements[FPElement].finished = false;
						FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.setAttributeNS(null, "fill", "yellow");
						FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.removeEventListener("click", FRAIS.reopenFPElement, false);
						FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
						FRAIS.FPElements[FPElement].floorPoints[1].svgElem.addEventListener("click", FRAIS.finishPolygonFPElement, false);
						FRAIS.drawing = true;
						FRAIS.activeFPElement = FPElement;
						FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.addEventListener("click", FRAIS.finishLinestringFPElement, false);
						
						for(var i=1;i<=FRAIS.FPElements[FPElement].floorPointsCount;i++){
							FRAIS.FPElements[FPElement].floorPoints[i].svgElem.removeEventListener("click", FRAIS.updateFinishedFPElement, false);
						}
						
					//}
				}
		}
	}	
}
//Function for updating a finished floorplan element whose floorpoints have been moved
FRAIS.updateFinishedFPElement=function(e){
	if (!e) 
		e = window.event;
		e.stopPropagation();
	if (e.altKey) {
		if (!FRAIS.activeFPElement) {
			var FPElement = FRAIS.FPElements[parseInt(parseInt(e.currentTarget.getAttributeNS(null, "id").match(/[0-9]+/)) / 100)];
			var point=e.currentTarget;
			var color=e.currentTarget.getAttributeNS(null, "fill");
			if (FPElement != null){
				//FPElement.type = geomType;
				var geomWKT = FRAIS.FPElementGeomToWKT(FPElement);
				if (geomWKT != "") {
				
					var wktAjax = new Ajax.Request('php/saveFPElement.php', {
						method: 'post',
						parameters: {
							id: FPElement.id,
							mode: 1,//update transaction in the database
							type: FPElement.type,
							level: FPElement.level,
							building: FPElement.building,
							project: FPElement.project,
							wkt: geomWKT
						}
					});
					//show that the request was send 
					point.setAttributeNS(null, "fill","orange");
					setTimeout(function(){point.setAttributeNS(null, "fill",color);},1000);
				
				}
			else {
				alert("Floorplan element could not be saved!");
			}
		}else{
			alert("Empty FPElement Object for updateFinishedFPElement");
		}
			
		}
	}	
}

//Function for finishing a floorplan element that has been loaded from the database
FRAIS.finishLoadedFPElement = function(FPElement){
	if (FPElement != null) {
		if (FRAIS.FPElements[FPElement].type == "POLYGON" && FRAIS.FPElements[FPElement].floorPointsCount >= 3) {
		
			//Create a line from the first point to the last point of the FPElement
			var firstPoint = FRAIS.FPElements[FPElement].floorPoints[1];
			firstPoint.svgLine = FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.createElementNS(FRAIS.svgNS, "line");
			firstPoint.svgLine.setAttributeNS(null, "id", "line" + FPElement + "" + firstPoint.id);
			firstPoint.svgLine.setAttributeNS(null, "x1", FRAIS.displayedXCoordinate(FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].x));
			firstPoint.svgLine.setAttributeNS(null, "y1", FRAIS.displayedYCoordinate(FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].y));
			firstPoint.svgLine.setAttributeNS(null, "x2", FRAIS.displayedXCoordinate(firstPoint.x));
			firstPoint.svgLine.setAttributeNS(null, "y2", FRAIS.displayedYCoordinate(firstPoint.y));
			firstPoint.svgLine.setAttributeNS(null, "stroke", "rgb(27,165,229)");
			firstPoint.svgLine.setAttributeNS(null, "stroke-width", "2px");
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.appendChild(firstPoint.svgLine);
			FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.setAttributeNS(null, "fill", "black");
			FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.addEventListener("click", FRAIS.reopenFPElement, false);
			FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.removeEventListener("click", FRAIS.removeFloorPoint, false);
			FRAIS.FPElements[FPElement].floorPoints[1].svgElem.removeEventListener("click", FRAIS.finishPolygonFPElement, false);
			//FPElement is finished
			FRAIS.FPElements[FPElement].finished = true;
			FRAIS.drawing = false;
			FRAIS.activeFPElement = null
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener("click", FRAIS.finishLinestringFPElement, false);
			
			for(var i=1;i<=FRAIS.FPElements[FPElement].floorPointsCount;i++){
				FRAIS.FPElements[FPElement].floorPoints[i].svgElem.addEventListener("click", FRAIS.updateFinishedFPElement, false);
			}
			
		}
		else {
			if (FRAIS.FPElements[FPElement].type == "LINESTRING") {
				FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.setAttributeNS(null, "fill", "black");
				FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.addEventListener("click", FRAIS.reopenFPElement, false);
				FRAIS.FPElements[FPElement].floorPoints[FRAIS.FPElements[FPElement].floorPointsCount].svgElem.removeEventListener("click", FRAIS.removeFloorPoint, false);
				FRAIS.FPElements[FPElement].floorPoints[1].svgElem.removeEventListener("click", FRAIS.finishPolygonFPElement, false);
				FRAIS.FPElements[FPElement].finished = true;
				FRAIS.drawing = false;
				FRAIS.activeFPElement = null
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.removeEventListener("click", FRAIS.finishLinestringFPElement, false);
				
				for(var i=1;i<=FRAIS.FPElements[FPElement].floorPointsCount;i++){
					FRAIS.FPElements[FPElement].floorPoints[i].svgElem.addEventListener("click", FRAIS.updateFinishedFPElement, false);
				}
			}
			else {
				alert("Wrong Geometry Type: " + FRAIS.FPElements[FPElement].type);
			}
		}
	}
}
//Function for creating a floorplan element from a well-known-text
FRAIS.createFPElementFromWKTGeometry= function(WKTGeometry){
	var geomType = WKTGeometry.slice(0,WKTGeometry.indexOf("("));
	var points = WKTGeometry.slice(WKTGeometry.indexOf("(")+1,WKTGeometry.indexOf(")")).split(",");
	FRAIS.FPElements[++FRAIS.FPElementCount]= new FRAIS.FPElement(FRAIS.FPElementCount,geomType);
	//FRAIS.FPElements[FRAIS.FPElementCount].loaded=true;
	
	for(var i=0;i< points.length;i++){
		var temp_points=points[i].split(" ");
		FRAIS.FPElements[FRAIS.FPElementCount].floorPoints[++FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount] = 
		new FRAIS.FloorPoint(parseInt(temp_points[0]), parseInt(temp_points[1]), FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount, "FP", FRAIS.FPElementCount);
		FRAIS.FPElements[FRAIS.FPElementCount].floorPoints[FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount].addToScreen();	
		if(FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount > 1){
			FRAIS.FPElements[FRAIS.FPElementCount].floorPoints[FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount-1].svgElem.setAttributeNS(null,"fill", "red");
			FRAIS.FPElements[FRAIS.FPElementCount].floorPoints[FRAIS.FPElements[FRAIS.FPElementCount].floorPointsCount-1].svgElem.removeEventListener("click",FRAIS.removeFloorPoint,false);
		}
		
	}	
	FRAIS.finishLoadedFPElement(FRAIS.FPElementCount);
	
}
//Class for floorpoints
FRAIS.FloorPoint = function(x,y,id,type,FPElement){
	this.x=x; //x-coordinate
	this.y=y; //y-coordinate
	this.id=id //id inside the floorplan element
    this.type=type; //type, probably not necessary
	this.FPElement=FPElement.id; //the associated floorplan element that the point belongs to 
	this.svgElem= null; // the SVG element of the floorpoint
	
	if (FRAIS.layers[FPElement.layer].SVGDoc != null) {
		this.svgElem = FRAIS.layers[FPElement.layer].SVGDoc.createElementNS(FRAIS.svgNS, "circle");
		if (this.id < 10) {
			this.svgElem.setAttributeNS(null, "id", "fp" + this.FPElement + "0" + this.id);
		}
		else {
			this.svgElem.setAttributeNS(null, "id", "fp" + this.FPElement + "" + this.id);
		}
		this.svgElem.setAttributeNS(null, "cx", FRAIS.displayedXCoordinate(this.x));
		this.svgElem.setAttributeNS(null, "cy", FRAIS.displayedYCoordinate(this.y));
		this.svgElem.setAttributeNS(null, "r", "4px");
		this.svgElem.setAttributeNS(null, "fill", "yellow");
		this.svgElem.setAttributeNS(null, "stroke", "black");
		this.svgElem.setAttributeNS(null, "stroke-width", "2px");
		this.svgElem.setAttributeNS(null, "style", "cursor:pointer");
		this.svgElem.addEventListener("mouseover", FRAIS.selectFloorPoint, false);
		this.svgElem.addEventListener("mouseover", FRAIS.showFloorPointInfo, false);
		this.svgElem.addEventListener("mouseout", FRAIS.deselectFloorPoint, false);
		this.svgElem.addEventListener("mouseout", FRAIS.hideFloorPointInfo, false);
		
		if (this.id == 1) {
			this.svgElem.addEventListener("click", FRAIS.finishPolygonFPElement, false);
		}
		// as floorpoints are always associated to a floorplan element, a connection line to the preceeding floorpoint in the floorplan element is created
		if (this.id > 1) {
			this.svgLine = FRAIS.layers[FPElement.layer].SVGDoc.createElementNS(FRAIS.svgNS, "line");
			this.svgLine.setAttributeNS(null, "id", "line" + this.FPElement + "" + this.id);
			this.svgLine.setAttributeNS(null, "x1", FRAIS.displayedXCoordinate(FPElement.floorPoints[this.id - 1].x));
			this.svgLine.setAttributeNS(null, "y1", FRAIS.displayedYCoordinate(FPElement.floorPoints[this.id - 1].y));
			this.svgLine.setAttributeNS(null, "x2", FRAIS.displayedXCoordinate(this.x));
			this.svgLine.setAttributeNS(null, "y2", FRAIS.displayedYCoordinate(this.y));
			this.svgLine.setAttributeNS(null, "stroke", "rgb(27,165,229)");
			this.svgLine.setAttributeNS(null, "stroke-width", "2px");
			
			this.svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
		}
		else {
			this.svgLine = null;
		}
	}	
}
//Class-method to add floorpoint to the SVG
FRAIS.FloorPoint.prototype.addToScreen = function(){

	FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.appendChild(this.svgElem);
	if(this.svgLine){
		FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.appendChild(this.svgLine);
	}	

}
//Function for showing information about a floorpoint in an box
FRAIS.showFloorPointInfo= function(e){
	if(!e)e=window.event;
	
	var popup= document.createElement("div");
		popup.id="FPpopup";
		popup.style.position="absolute";
		popup.style.left= (e.pageX+40)+"px";
		popup.style.top= (e.pageY+40)+"px";
		popup.style.zIndex=1000;
		popup.style.padding="5px"
		popup.style.backgroundColor="white"
		popup.style.border= "solid 2px rgb(27,165,229)";
		
	var pointId=parseInt(e.currentTarget.getAttributeNS(null,"id").match(/[0-9]+/))%100;
	var FPElementId=parseInt(parseInt(e.currentTarget.getAttributeNS(null,"id").match(/[0-9]+/))/100);

		popup.appendChild(document.createTextNode("Element: "+FPElementId));
		popup.appendChild(document.createElement("br"));
				
		//posX= realCoords(getPos(e.currentTarget.style.left));
		//posY= realCoords(getPos(e.currentTarget.style.top));
	var	posX=FRAIS.realXCoordinate(e.currentTarget.getAttributeNS(null,"cx").match(/[0-9]+/));
	var	posY=FRAIS.realYCoordinate(e.currentTarget.getAttributeNS(null,"cy").match(/[0-9]+/));
				
		popup.appendChild(document.createTextNode("X: " +(posX)));
		popup.appendChild(document.createElement("br"));
		popup.appendChild(document.createTextNode("Y: " +(posY)));
		//document.body.appendChild(popup);
		if($("main") != null){
			$("main").appendChild(popup);
		}
}
//Function for removing the infobox of a floorpoint  
FRAIS.hideFloorPointInfo= function(){
	if($("FPpopup") != null){
		$("main").removeChild($("FPpopup"));
	}
}
//Function for removing a floorpoint from a floorplan element
FRAIS.removeFloorPoint= function(e){
	if(!e)e=window.event;
	e.stopPropagation();
	
	if (e.altKey) {
		var pointId=parseInt(e.currentTarget.getAttributeNS(null,"id").match(/[0-9]+/))%100;
		var FPElementId=parseInt(parseInt(e.currentTarget.getAttributeNS(null,"id").match(/[0-9]+/))/100);
		if (FPElementId == FRAIS.activeFPElement && FRAIS.tempFPElement==null) {
			//if (confirm("Diesen Punkt loeschen?")) {
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.FPElements[FPElementId].floorPoints[pointId].svgElem);
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.FPElements[FPElementId].floorPoints[pointId].svgLine);
				FRAIS.FPElements[FPElementId].floorPoints[pointId] = null;
				FRAIS.FPElements[FPElementId].floorPointsCount--;
				FRAIS.FPElements[FPElementId].floorPoints[FRAIS.FPElements[FPElementId].floorPointsCount].svgElem.setAttributeNS(null, "fill", "yellow");
				if (FRAIS.FPElements[FPElementId].floorPointsCount > 1) {
					FRAIS.FPElements[FPElementId].floorPoints[FRAIS.FPElements[FPElementId].floorPointsCount].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
				}
				FRAIS.hideFloorPointInfo();
			//}
		}	
		if (FPElementId == FRAIS.activeFPElement && FRAIS.tempFPElement!=null) {
			//if (confirm("Diesen Punkt loeschen?")) {
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.tempFPElement.floorPoints[pointId].svgElem);
				FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeChild(FRAIS.tempFPElement.floorPoints[pointId].svgLine);
				FRAIS.tempFPElement.floorPoints[pointId] = null;
				FRAIS.tempFPElement.floorPointsCount--;
				FRAIS.tempFPElement.floorPoints[FRAIS.tempFPElement.floorPointsCount].svgElem.setAttributeNS(null, "fill", "yellow");
				if (FRAIS.tempFPElement.floorPointsCount > 1) {
					FRAIS.tempFPElement.floorPoints[FRAIS.tempFPElement.floorPointsCount].svgElem.addEventListener("click", FRAIS.removeFloorPoint, false);
				}
				FRAIS.hideFloorPointInfo();
			//}
		}		
	}		
}
//Function for selecting a floorpoint for drag and drop moving 
FRAIS.selectFloorPoint=function(e){
	if(!e)e=window.event;
	
	if(FRAIS.selectedFloorPoint) FRAIS.deselectFloorPoint();
	
	FRAIS.selectedFloorPoint=e.currentTarget;
	FRAIS.selectedFloorPoint.setAttributeNS(null,"stroke","green");
	FRAIS.selectedFloorPoint.addEventListener("mousedown",FRAIS.dragFloorPoint,false);
}
//Function for deselecting a point
FRAIS.deselectFloorPoint=function(){
	if(FRAIS.selectedFloorPoint){
		FRAIS.selectedFloorPoint.setAttributeNS(null,"stroke","black");
		FRAIS.selectedFloorPoint.removeEventListener("mousedown",FRAIS.dragFloorPoint,false);
		FRAIS.selectedFloorPoint=null;
	}
	
}
//Function for drag-and-drop functionality of a floorpoint
FRAIS.dragFloorPoint=function(e){
	
	if (FRAIS.selectedFloorPoint) {
	if(!e)e=window.event;	
	var elementToDrag = e.currentTarget;
		
		function moveHandler(f) {
			
		   if (!f) f = window.event; // Event-Modell des IE
		   
		   var maxPosX= 800;
		   var maxPosY= 600;
		   
		   var newPosX=f.clientX;//(f.clientX - deltaX);
		   if(newPosX < 0) newPosX=0;
		   if(newPosX > maxPosX) newPosX=maxPosX;
		   
		   var newPosY=f.clientY;//(f.clientY - deltaY);
		   if(newPosY < 0) newPosY=0;
		   if(newPosY > maxPosY) newPosY=maxPosY;
		   
			 elementToDrag.setAttributeNS(null,"cx",newPosX+"px");
			 elementToDrag.setAttributeNS(null,"cy",newPosY+"px");
			 
			 var pointId=parseInt(elementToDrag.getAttributeNS(null,"id").match(/[0-9]+/))%100;
			 var FPElementId=parseInt(parseInt(elementToDrag.getAttributeNS(null,"id").match(/[0-9]+/))/100);
			 
			 if(FRAIS.tempFPElement!=null){
			 	var FPElement=FRAIS.tempFPElement;
			 }
			 else{
			 	var FPElement=FRAIS.FPElements[FPElementId];
			 }
			 
			 if(FPElement.floorPoints[pointId].svgLine){
			 	FPElement.floorPoints[pointId].svgLine.setAttributeNS(null,"x2",newPosX+"px");
				FPElement.floorPoints[pointId].x=FRAIS.realXCoordinate(newPosX);
				FPElement.floorPoints[pointId].svgLine.setAttributeNS(null,"y2",newPosY+"px");
				FPElement.floorPoints[pointId].y=FRAIS.realYCoordinate(newPosY);
			 }else{
			 	FPElement.floorPoints[pointId].x=FRAIS.realXCoordinate(newPosX);
				FPElement.floorPoints[pointId].y=FRAIS.realYCoordinate(newPosY);
			 }
			 if(pointId < FPElement.floorPointsCount){
					FPElement.floorPoints[pointId+1].svgLine.setAttributeNS(null,"x1",newPosX+"px");
					FPElement.floorPoints[pointId+1].svgLine.setAttributeNS(null,"y1",newPosY+"px");
					FPElement.floorPoints[pointId].x=FRAIS.realXCoordinate(newPosX);
					FPElement.floorPoints[pointId].y=FRAIS.realYCoordinate(newPosY);
			 }
		 	 if(pointId == FPElement.floorPointsCount && FPElement.finished && FPElement.type=="POLYGON"){
					FPElement.floorPoints[1].svgLine.setAttributeNS(null,"x1",newPosX+"px");
					FPElement.floorPoints[1].svgLine.setAttributeNS(null,"y1",newPosY+"px");
			 }
			 if (f.stopPropagation) f.stopPropagation( );
		 	 else f.cancelBubble = true;
		 	
		 }
		 
		function upHandler(g) {
	
			if (!g) g = window.event; 
		
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("mousemove",moveHandler,false);
		 	FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("mouseup",upHandler,false);
	
		 	if (g.stopPropagation) g.stopPropagation( ); 
		 	else g.cancelBubble = true;
		 	
			
		}	

			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("mousemove",moveHandler,false);
		 	FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("mouseup",upHandler,false);
			
		 if (e.stopPropagation) e.stopPropagation( ); 
		 else e.cancelBubble = true; 
		 
		 if (e.preventDefault) e.preventDefault( ); 
		 else e.returnValue = false; 
		 
		
	}
	
}	
		
/*FRAIS.getPos= function(value){
		         value =value.substring(0,value.length-2)
				 
				 return parseInt(value);
}
*/
//functions for calculating the real world coordinates of a point
FRAIS.realXCoordinate= function(pos){
	return Math.round((pos*(FRAIS.layers[FRAIS.activeLayer.id].scale))+FRAIS.layers[FRAIS.activeLayer.id].refX);	
}
FRAIS.realYCoordinate= function(pos){
	return Math.round(((FRAIS.displayHeight-pos)*(FRAIS.layers[FRAIS.activeLayer.id].scale))+FRAIS.layers[FRAIS.activeLayer.id].refY);	
}	
//functions for calculating the display coordinates of a point
FRAIS.displayedXCoordinate= function(pos){
	return Math.round((pos-FRAIS.layers[FRAIS.activeLayer.id].refX)/(FRAIS.layers[FRAIS.activeLayer.id].scale));
}	
FRAIS.displayedYCoordinate= function(pos){
	return Math.round(FRAIS.displayHeight-((pos-FRAIS.layers[FRAIS.activeLayer.id].refY)/(FRAIS.layers[FRAIS.activeLayer.id].scale)));
}	
//Function to set the x-coordinate of a waypoint from the attribute-box of the waypoint  
FRAIS.setXCoord= function(){	
	//resetItem.show();
	//$("changeList").appendChild(resetItem);
	var x=this.value;
	if (x.match(/^[0-9]+$/)) {
		FRAIS.showResetPointPosition();
		var point = parseInt($('inputPointID').value);
		var pos = FRAIS.displayedXCoordinate(this.value);
		FRAIS.wayPoints[point].SVGElem.setAttributeNS(null, "cx", pos);
	}else{
		alert("Unzulaessiger Wert fuer X!");
		var point = parseInt($('inputPointID').value);
		$('inputX').value=FRAIS.wayPoints[point].x;
	}
}
//Function to set the y-coordinate of a waypoint from the attribute-box of the waypoint  
FRAIS.setYCoord=function(){
	//resetItem.show();
	//$("changeList").appendChild(resetItem);
	var y=this.value;
	if (y.match(/^[0-9]+$/)) {
		FRAIS.showResetPointPosition();
		var point = parseInt($('inputPointID').value);
		var pos = FRAIS.displayedYCoordinate(this.value);
		FRAIS.wayPoints[point].SVGElem.setAttributeNS(null, "cy", pos);
	}else{
		alert("Unzulaessiger Wert fuer Y!");
		var point = parseInt($('inputPointID').value);
		$('inputY').value=FRAIS.wayPoints[point].y;
	}
}

//Drag-and-drop functionality for waypoints
FRAIS.drag=function(e){
	
	if(!e)e=window.event;
	if (FRAIS.activePoint.isSet && FRAIS.activePoint.id == e.currentTarget.id) {

		var elementToDrag = e.currentTarget;

		//resetItem.show();
		
		
		function moveHandler(f) {
		
		   if (!f) f = window.event; 
		   //if($("resetItem")==null)
		   //		$("changeList").appendChild(resetItem);
		   FRAIS.showResetPointPosition();
		   
		   var maxPosX= 800;
		   var maxPosY= 600;
		   
		   var newPosX=f.clientX;//(f.clientX - deltaX);
		   if(newPosX < 0) newPosX=0;
		   if(newPosX > maxPosX) newPosX=maxPosX;
		   
		   var newPosY=f.clientY;//(f.clientY - deltaY);
		   if(newPosY < 0) newPosY=0;
		   if(newPosY > maxPosY) newPosY=maxPosY;
		   
			 elementToDrag.setAttributeNS(null,"cx",newPosX);
			 elementToDrag.setAttributeNS(null,"cy",newPosY);
			 
			$("inputX").value= FRAIS.realXCoordinate(newPosX); 
			$("inputY").value= FRAIS.realYCoordinate(newPosY);
			 
			 FRAIS.showUpdatePoint();

			 if (f.stopPropagation) f.stopPropagation( );
		 	 else f.cancelBubble = true; 
		 	
		 }
		 
		function upHandler(g) {
	
			if (!g) g = window.event; 
			
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("mousemove",moveHandler,false);
		 	FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("mouseup",upHandler,false);
			//
		 	if (g.stopPropagation) g.stopPropagation(); 
		 	else g.cancelBubble = true; 
		 	//delay the event registration for "deactivatePoint" because of the current click
			setTimeout(function(){FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("click",FRAIS.deactivatePoint,false);},100);
		 		
		}	

			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("mousemove",moveHandler,false);
		 	FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.addEventListener("mouseup",upHandler,false);
			FRAIS.layers[FRAIS.activeLayer.id].SVGDoc.documentElement.removeEventListener("click",FRAIS.deactivatePoint,false);
			
		 if (e.stopPropagation) e.stopPropagation( ); 
		 else e.cancelBubble = true; 
		 
		 if (e.preventDefault) e.preventDefault( );
		 else e.returnValue = false; 
	}
}			
// Function for creating an info box for a waypoint when hovering over it				
FRAIS.showInfo=function(e){

	var popup= document.createElement("div");
		popup.id="popup";
		popup.style.position="absolute";
		popup.style.left= (e.pageX + 40) + "px";//+((FRAIS.wayPoints[e.currentTarget.getAttributeNS(null,"id")].layer-1)*20))+"px";
		popup.style.top=  (e.pageY + 40) + "px";//+((FRAIS.wayPoints[e.currentTarget.getAttributeNS(null,"id")].layer-1)*20))+"px";
		//popup.style.left= (parseInt(e.currentTarget.getAttributeNS(null,"cx"))+40)+"px";
		//popup.style.top= (parseInt(e.currentTarget.getAttributeNS(null,"cy"))+40)+"px";
		popup.style.zIndex=1000;
		popup.style.padding="5px"
		popup.style.backgroundColor="white"
		popup.style.border= "solid 2px rgb(27,165,229)";
		popup.appendChild(document.createTextNode("ID: "+e.currentTarget.getAttributeNS(null,"id")));
		popup.appendChild(document.createElement("br"));
				
	var	posX= FRAIS.realXCoordinate(e.currentTarget.getAttributeNS(null,"cx"));
	var	posY= FRAIS.realYCoordinate(e.currentTarget.getAttributeNS(null,"cy"));
							
		popup.appendChild(document.createTextNode("X: " +(posX)));
		popup.appendChild(document.createElement("br"));
		popup.appendChild(document.createTextNode("Y: " +(posY)));
		
		//document.body.appendChild(popup);
		if($("main") != null){
			$("main").appendChild(popup);
		}
}
//Function for removing the info box of a waypoint
FRAIS.hideInfo= function(){
	if($("popup")!=null)
		$("main").removeChild($("popup"));
}
// Function for deselecting a waypoint
FRAIS.deactivatePoint= function(e){
	
	if(typeof(e)!="undefined"){
		if(e.shiftKey)
			var shifted=true;
		else
			var shifted=false
	}
	else{
		var shifted =false
	}
	
	if(FRAIS.activePoint.isSet && !shifted ){			
		FRAIS.activePoint.isSet=false;

		var point = FRAIS.wayPoints[FRAIS.activePoint.id].SVGElem;
			point.setAttributeNS(null,"stroke","black");
			point.removeEventListener("mousedown",FRAIS.drag,false);
			point.addEventListener("click",FRAIS.selectPoint,false);
			point.addEventListener("mouseover",FRAIS.showInfo,false);
					
		var j=FRAIS.wayPoints[FRAIS.activePoint.id].NPs.length;
					
		for(i=0;i<j;i++){
			if (FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] != null) {
				if(typeof(FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]]) != "undefined"){
					if (FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].SVGElem != null) {
						FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].SVGElem.setAttributeNS(null, "stroke", "black");
					}
				}
			}
		}
		if(typeof(FRAIS.newNeighbours)!="undefined"){
			for(var j in FRAIS.newNeighbours){
				if(FRAIS.wayPoints[FRAIS.newNeighbours[j]].SVGElem!=null){
					FRAIS.wayPoints[FRAIS.newNeighbours[j]].SVGElem.setAttributeNS(null,"stroke","black");
				}	
			}
			delete FRAIS.newNeighbours;
		}
		FRAIS.activePoint.id=null;
		$("main").removeChild($("pointInfo"));				
	}
			
}
			
//Function for selecting a waypoint and show its attribute-box	
FRAIS.selectPoint= function(e){
	if(!e)e=window.event;
	if (!e.shiftKey) {
		if (FRAIS.activePoint.isSet) 
			FRAIS.deactivatePoint();
		
		FRAIS.activePoint.id = e.currentTarget.id;
		e.stopPropagation();
		FRAIS.activePoint.isSet = true;
		e.currentTarget.setAttributeNS(null, "stroke", "rgb(40,200,0)");
		e.currentTarget.removeEventListener("click", FRAIS.selectPoint, false);
		e.currentTarget.addEventListener("mousedown", FRAIS.drag, false);
		e.currentTarget.removeEventListener("mouseover", FRAIS.showInfo, false);
		
		var left = parseInt(FRAIS.layers[FRAIS.activeLayer.id].elem.style.left.match(/[0-9]+/g));
		var top = parseInt(FRAIS.layers[FRAIS.activeLayer.id].elem.style.top.match(/[0-9]+/g));
		
		var pointInfo = document.createElement("div");
		
		pointInfo.id = "pointInfo"
		pointInfo.name = "pointInfo"
		pointInfo.style.position = "absolute";
		pointInfo.style.left = (left + parseInt($("SVGObject" + FRAIS.activeLayer.id).width.match(/[0-9]+/g)) + 20) + "px";
		pointInfo.style.top = top + "px";
		pointInfo.width = "auto";
		pointInfo.style.zIndex = FRAIS.layers[FRAIS.activeLayer.id].elem.style.zIndex;
		pointInfo.style.padding = "0px 10px 0px 10px";
		pointInfo.style.borderTop = "2px solid rgb(27,165,229)";
		pointInfo.style.backgroundColor = FRAIS.layers[FRAIS.activeLayer.id].elem.style.backgroundColor;
		
		var descList = document.createElement("ul");
		descList.id = "descList";
		descList.style.backgroundColor = FRAIS.layers[FRAIS.activeLayer.id].elem.style.backgroundColor;
		descList.style.padding = "10px";
		descList.style.fontWeight = "bold";
		descList.style.fontFamily = "Arial,Helvetica, sans-serif";
		descList.style.textAlign = "right";
		
		var idItem = document.createElement("li");
		idItem.style.listStyle = "none";
		var descPointID = document.createTextNode("ID ");
		var inputPointID = document.createElement("input");
		inputPointID.id = "inputPointID";
		inputPointID.className = "pointInfoInput";
		inputPointID.style.border = "1px solid"
		inputPointID.readOnly="readonly";
		inputPointID.type = "text";
		inputPointID.value = e.currentTarget.id.match(/[0-9]+/);
		idItem.appendChild(descPointID);
		idItem.appendChild(inputPointID);
		descList.appendChild(idItem);
		
		var xItem = document.createElement("li");
		xItem.style.listStyle = "none";
		var descX = document.createTextNode("X ");
		var inputX = document.createElement("input");
		inputX.id = "inputX";
		inputX.className = "pointInfoInput";
		inputX.style.border = "1px solid"
		inputX.type = "text";
		inputX.value = FRAIS.realXCoordinate(parseInt(e.currentTarget.getAttributeNS(null, "cx")));
		inputX.addEventListener("change",FRAIS.setXCoord,false);
		inputX.addEventListener("change",FRAIS.showUpdatePoint,false);
		inputX.addEventListener("keydown",FRAIS.showUpdatePoint,false);
		xItem.appendChild(descX);
		xItem.appendChild(inputX);
		descList.appendChild(xItem);
		
		var yItem = document.createElement("li");
		yItem.style.listStyle = "none";
		var descY = document.createTextNode("Y ");
		var inputY = document.createElement("input");
		inputY.id = "inputY";
		inputY.className = "pointInfoInput";
		inputY.style.border = "1px solid"
		inputY.type = "text";
		inputY.value = FRAIS.realYCoordinate(parseInt(e.currentTarget.getAttributeNS(null, "cy")));
		inputY.addEventListener("change",FRAIS.setYCoord,false);
		inputY.addEventListener("keydown",FRAIS.showUpdatePoint,false);
		inputY.addEventListener("change",FRAIS.showUpdatePoint,false);
		yItem.appendChild(descY);
		yItem.appendChild(inputY);
		descList.appendChild(yItem);
		
		var typeItem = document.createElement("li");
		typeItem.style.listStyle = "none";
		var descType = document.createTextNode("Art ");
		var inputType = document.createElement("select");
		for(var i=0;i<FRAIS.wayPointTypes.length;i++){
			var option =document.createElement("option");
				option.value=FRAIS.wayPointTypes[i];
				option.appendChild(document.createTextNode(FRAIS.wayPointTypes[i]));
			inputType.appendChild(option);
		}
		inputType.id = "inputType";
		inputType.className = "pointInfoInput";
		inputType.style.border = "1px solid"
		//inputType.type = "text";
		inputType.value = FRAIS.wayPoints[e.currentTarget.id].type;
		inputType.addEventListener("change",FRAIS.showUpdatePoint,false);
		typeItem.appendChild(descType);
		typeItem.appendChild(inputType);
		descList.appendChild(typeItem);
		
		var descItem = document.createElement("li");
		descItem.style.listStyle = "none";
		var descDesc = document.createTextNode("Beschreibung ");
		var inputDesc = document.createElement("input");
		inputDesc.id = "inputDesc";
		inputDesc.className = "pointInfoInput";
		inputDesc.style.border = "1px solid";
		inputDesc.type = "text";
		inputDesc.value = FRAIS.wayPoints[e.currentTarget.id].desc;
		inputDesc.addEventListener("keydown",FRAIS.showUpdatePoint,false);
		descItem.appendChild(descDesc);
		descItem.appendChild(inputDesc);
		descList.appendChild(descItem);
		
		var destItem = document.createElement("li");
		destItem.style.listStyle = "none";
		var destText = document.createTextNode("Zielpunkt ");
		var destCheckbox=document.createElement("input");
		destCheckbox.type = "checkbox";
		destCheckbox.id = "destCheckbox";
		destCheckbox.className = "pointInfoInput";
		destCheckbox.style.border = "1px solid";
		if(FRAIS.wayPoints[e.currentTarget.id].dest)
			destCheckbox.checked=true;
		else 
			destCheckbox.checked=false;
		destCheckbox.addEventListener("change",FRAIS.showUpdatePoint,false);
		
		/*var inputDest = document.createElement("input");
		inputDest.id = "inputType";
		inputType.className = "pointInfoInput";
		inputType.style.border = "1px solid"
		inputType.type = "text";
		inputType.value = FRAIS.wayPoints[e.currentTarget.id].type;
		inputType.addEventListener("keydown",FRAIS.showUpdatePoint,false);
		*/
		destItem.appendChild(destText);
		destItem.appendChild(destCheckbox);
		descList.appendChild(destItem);
		
	/*	for (i = 0; i < wayPoints[activePoint.id].NPs.length; i++) {
			if (wayPoints[activePoint.id].NPs[i]) {
				wayPoints[wayPoints[activePoint.id].NPs[i]].SVGElem.setAttributeNS(null, "stroke", "black");
			}
		}
	*/	
		var j = FRAIS.wayPoints[FRAIS.activePoint.id].NPs.length;
		
		for (i = 0; i < j; i++) {
		  if (FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]) {
		  	if (typeof(FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]]) != "undefined") {
				if (FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].SVGElem != null) {
					FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].SVGElem.setAttributeNS(null, "stroke", "orange");
				}
				
				window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"] = document.createElement("li");
				window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"].id = "np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item";
				window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"].style.listStyle = "none";
				
				if (FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].SVGElem != null) {
					//if (FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].layer == FRAIS.activeLayer.id) {
					if (FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].level == FRAIS.wayPoints[FRAIS.activePoint.id].level) {
						window["descNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id] = document.createTextNode("NP ");
					}
					else {
						window["descNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id] = document.createTextNode("NP* ");
					}
				}
				else {
					window["descNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id] = document.createTextNode("NP* ");
				}
				
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id] = document.createElement("input");
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].id = "inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id;
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].className = "pointInfoInput";
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].style.border = "1px solid";
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].style.backgroundColor = "orange";
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].type = "text";
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].readOnly = "readonly";
				window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id].value = FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i];//window["wp"+e.currentTarget.id].NPs[i-1];
				window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"].appendChild(window["descNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id]);
				window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"].appendChild(window["inputNP" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id]);
				
				descList.appendChild(window["np" + FRAIS.wayPoints[FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id + "Item"]);
			}
			else{
				window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"] = document.createElement("li");
				window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"].id = "np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item";
				window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"].style.listStyle = "none";
				
				window["descNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]] = document.createTextNode("NP** ");
				
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]] = document.createElement("input");
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].id = "inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i];
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].className = "pointInfoInput";
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].style.border = "1px solid";
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].style.backgroundColor = "rgb(27,165,229)";
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].type = "text";
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].readOnly = "readonly";
				window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]].value = FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i];//window["wp"+e.currentTarget.id].NPs[i-1];
				window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"].appendChild(window["descNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]]);
				window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"].appendChild(window["inputNP" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i]]);
				descList.appendChild(window["np" + FRAIS.wayPoints[FRAIS.activePoint.id].NPs[i] + "Item"]);
			}
		  }
		}
		
		var changeList= document.createElement("ul");
		changeList.id = "changeList";
		changeList.style.backgroundColor = FRAIS.layers[FRAIS.activeLayer.id].elem.style.backgroundColor;
		changeList.style.padding = "10px";
		changeList.style.fontWeight = "bold";
		changeList.style.fontFamily = "Arial,Helvetica, sans-serif";
		changeList.style.textAlign = "right";
		
		var updateItem= document.createElement("li");
		updateItem.id="updateItem";
		updateItem.style.listStyle = "none";
		updateItem.style.display="none";
		var updateButton = document.createElement("input");
		updateButton.id = "updateButton";
		updateButton.type = "button";
		updateButton.style.border = "1px solid black"
		updateButton.style.marginTop="2px";
		updateButton.style.backgroundColor = "rgb(27,165,229)"
		updateButton.style.fontWeight = "bold";
		updateButton.style.width = "152px";
		updateButton.style.cursor = "pointer";
		updateButton.value = "Aenderung speichern"
		updateButton.addEventListener("click", FRAIS.updatePoint, false);
		
		updateItem.appendChild(updateButton);
		changeList.appendChild(updateItem);

		
		var resetItem = document.createElement("li");
		resetItem.id="resetItem";
		resetItem.style.listStyle = "none";
		resetItem.style.display = "none";
		var resetButton = document.createElement("input");
		resetButton.id = "resetButton";
		resetButton.type = "button";
		resetButton.style.border = "1px solid black"
		resetButton.style.marginTop="2px";
		resetButton.style.backgroundColor = "rgb(27,165,229)"
		resetButton.style.fontWeight = "bold";
		resetButton.style.width = "152px";
		resetButton.style.cursor = "pointer";
		resetButton.value = "Position zuruecksetzen"
		resetButton.addEventListener("click", FRAIS.resetPointPosition, false);
		
		resetItem.appendChild(resetButton);
		changeList.appendChild(resetItem);
		
		pointInfo.appendChild(descList);
		pointInfo.appendChild(changeList);
			
		$("main").appendChild(pointInfo);
		
		if (e.currentTarget.getAttributeNS(null, "cx") == FRAIS.displayedXCoordinate(FRAIS.wayPoints[FRAIS.activePoint.id].x) && e.currentTarget.getAttributeNS(null, "cy") == FRAIS.displayedYCoordinate(FRAIS.wayPoints[FRAIS.activePoint.id].y)) {
			FRAIS.hideResetPointPosition();
			FRAIS.hideUpdatePoint();
		}
		else {
			FRAIS.showResetPointPosition();
			FRAIS.showUpdatePoint();
		}
	}
}				

//Function for resetting the position of a point
FRAIS.resetPointPosition= function(){
	var point=FRAIS.wayPoints[parseInt($('inputPointID').value)];
		point.SVGElem.setAttributeNS(null,"cx",FRAIS.displayedXCoordinate(point.x));
		point.SVGElem.setAttributeNS(null,"cy",FRAIS.displayedYCoordinate(point.y));
		$("inputX").value= FRAIS.wayPoints[FRAIS.activePoint.id].x;
		$("inputY").value= FRAIS.wayPoints[FRAIS.activePoint.id].y;
		//$(resetItem).hide();
		FRAIS.hideResetPointPosition();
		//$("changeList").removeChild(resetItem);

}
//Show the button for resetting the position of a point
FRAIS.showResetPointPosition= function(){
	if($("resetItem")!=null)
		$("resetItem").style.display="";
}
//Hide the button for resetting the position of a point
FRAIS.hideResetPointPosition= function(){
	if($("resetItem")!=null)
		$("resetItem").style.display="none";
}
//Function for adding / removing neighbours of a waypoint
FRAIS.toggleNeighbour= function(e){
	if(!e)e=window.event;
		e.stopPropagation();
		if(e.shiftKey && FRAIS.activePoint.isSet && FRAIS.activePoint.id!=e.currentTarget.getAttributeNS(null,"id")){// && FRAIS.wayPoints[parseInt(e.currentTarget.getAttributeNS(null,"id"))].loaded){
			if(typeof(FRAIS.newNeighbours)=="undefined")
				FRAIS.newNeighbours=new Object();
// remove the clicked neighbour from the active point
/*			if(wayPoints[activePoint.id].hasNeighbour(e.currentTarget.getAttributeNS(null,"id"))){
				var descList=$("descList");
				var npItem= $("np"+e.currentTarget.getAttributeNS(null,"id")+"Item");
				descList.removeChild(npItem);
				e.currentTarget.setAttributeNS(null,"stroke","black");
				wayPoints[activePoint.id].removeNeighbour(e.currentTarget.getAttributeNS(null,"id"));
				
			}*/
			if($("np"+e.currentTarget.getAttributeNS(null,"id")+"Item")!=null){
				var descList=$("descList");
				var npItem= $("np"+e.currentTarget.getAttributeNS(null,"id")+"Item");
				descList.removeChild(npItem);
				e.currentTarget.setAttributeNS(null,"stroke","black");
				//wayPoints[activePoint.id].removeNeighbour(e.currentTarget.getAttributeNS(null,"id"));
				var np_id = e.currentTarget.getAttributeNS(null,"id");
				delete FRAIS.newNeighbours["np"+np_id];
				FRAIS.showUpdatePoint();
				
			}
// add the clicked neighbour to the active point
			else{
				var descList = $("descList");
				var np_id = e.currentTarget.getAttributeNS(null,"id");
				e.currentTarget.setAttributeNS(null,"stroke","orange");
				FRAIS.newNeighbours["np"+np_id]=np_id;
				//wayPoints[activePoint.id].addNeighbour(np_id);
				if (FRAIS.wayPoints[np_id].SVGElem != null) {
					FRAIS.wayPoints[np_id].SVGElem.setAttributeNS(null, "stroke", "orange");
				}
			
				window["np" + np_id + "Item"] = document.createElement("li");
				window["np" + np_id + "Item"].id = "np" + np_id + "Item";
				window["np" + np_id + "Item"].style.listStyle = "none";
			
				if (FRAIS.wayPoints[np_id].SVGElem != null) {
					if (FRAIS.wayPoints[np_id].level == FRAIS.wayPoints[FRAIS.activePoint.id].level) {
						window["descNP" + FRAIS.wayPoints[np_id].id] = document.createTextNode("NP ");
					}
					else {
						window["descNP" + FRAIS.wayPoints[np_id].id] = document.createTextNode("NP* ");
					}
				}
				else {
					window["descNP" + FRAIS.wayPoints[np_id].id] = document.createTextNode("NP* ");
				}
			
				window["inputNP" + FRAIS.wayPoints[np_id].id] = document.createElement("input");
				window["inputNP" + FRAIS.wayPoints[np_id].id].id = "inputNP" + FRAIS.wayPoints[np_id].id;
				window["inputNP" + FRAIS.wayPoints[np_id].id].className = "pointInfoInput";
				window["inputNP" + FRAIS.wayPoints[np_id].id].style.border = "1px solid"
				window["inputNP" + FRAIS.wayPoints[np_id].id].style.backgroundColor = "orange";
				window["inputNP" + FRAIS.wayPoints[np_id].id].type = "text";
				window["inputNP" + FRAIS.wayPoints[np_id].id].value = np_id;//window["wp"+e.currentTarget.id].NPs[i-1];
				window["np" + FRAIS.wayPoints[np_id].id + "Item"].appendChild(window["descNP" + FRAIS.wayPoints[np_id].id]);
				window["np" + FRAIS.wayPoints[np_id].id + "Item"].appendChild(window["inputNP" + FRAIS.wayPoints[np_id].id]);
			
			
				descList.appendChild(window["np" + FRAIS.wayPoints[np_id].id + "Item"]);
				FRAIS.showUpdatePoint();
			}				
		}
}	
//Function for creating a new waypoint by double-clicking on the SVG of a layer		
FRAIS.addPoint= function(e){
	
	if(!e) e=window.event;
		if (e.detail) {
			if (e.detail == 2) {
				
				var level= FRAIS.layers[FRAIS.activeLayer.id].level;
				var building= FRAIS.activeBuilding;
				var project= FRAIS.activeProject;
				
				var MyAjax = new Ajax.Request('php/addPoint.php', {
					method: 'post',
					parameters: {
					levelId: level,
					projectId: project,
					buildingId: building,
					pointId:++FRAIS.maxPointId,
					pointX:	FRAIS.realXCoordinate(e.clientX),
					pointY: FRAIS.realYCoordinate(e.clientY)
					}
				});
				
			/*	if (typeof(maxID) == "undefined"){
					var point_id = 1;
					maxID=point_id;
				} 
					
				else {
					var point_id = ++maxID;
				}
				
				var level=layers[activeLayer.id].level;

				wayPoints[point_id]= new WayPoint(e.clientX,e.clientY, point_id,"",level,activeBuilding,activeProject,layers[activeLayer.id].id,false);
				wayPoints[point_id].SVGElem = layers[activeLayer.id].SVGDoc.createElementNS(svgNS,"circle");
				wayPoints[point_id].SVGElem.setAttributeNS(null,"id", point_id);
				wayPoints[point_id].SVGElem.setAttributeNS(null,"cx", e.clientX);
				wayPoints[point_id].SVGElem.setAttributeNS(null,"cy", e.clientY);
				wayPoints[point_id].SVGElem.setAttributeNS(null,"r", "4px");
				wayPoints[point_id].SVGElem.setAttributeNS(null,"fill", "yellow");
				wayPoints[point_id].SVGElem.setAttributeNS(null,"stroke", "black");
				wayPoints[point_id].SVGElem.setAttributeNS(null,"stroke-width", "2px");
				wayPoints[point_id].SVGElem.setAttributeNS(null,"style", "cursor:pointer");
				wayPoints[point_id].SVGElem.addEventListener("click",selectPoint,false);
				wayPoints[point_id].SVGElem.addEventListener("click",toggleNeighbour,false);
				wayPoints[point_id].SVGElem.addEventListener("mouseover",showInfo,false);
				wayPoints[point_id].SVGElem.addEventListener("mousedown",hideInfo,false);
				wayPoints[point_id].SVGElem.addEventListener("mouseout",hideInfo,false);
				wayPoints[point_id].addToScreen();
				layers[activeLayer.id].wayPoints[layers[activeLayer.id].wayPointsCount++]=point_id;
			*/
			}
		}
}
//Function for updating a waypoint in the database
FRAIS.updatePoint= function(){
	
	var descList=$("descList");
	var level= FRAIS.layers[FRAIS.activeLayer.id].level;
	var building= FRAIS.activeBuilding;
	var project= FRAIS.activeProject;
	var id=descList.childNodes[0].childNodes[1].value;
	var x=descList.childNodes[1].childNodes[1].value;
	var y=descList.childNodes[2].childNodes[1].value;
	var type=descList.childNodes[3].childNodes[1].value;
	var desc=descList.childNodes[4].childNodes[1].value;
	var dest=descList.childNodes[5].childNodes[1].checked;
	var NPs="";
	for(i=6;i<descList.childNodes.length;i++){
		if(i==(descList.childNodes.length-1))
			NPs+=descList.childNodes[i].childNodes[1].value;
		else
			NPs+=descList.childNodes[i].childNodes[1].value+" ";
	}
	if (x.match(/^[0-9]+$/) && y.match(/^[0-9]+$/) && type.match(/^[A-Z]{2}$/)) {
		if ((dest && desc != '')|| !dest) {
			var MyAjax = new Ajax.Request('php/updatePoint.php', {
				method: 'post',
				parameters: {
					levelId: level,
					projectId: project,
					buildingId: building,
					pointId: id,
					pointX: x,
					pointY: y,
					pointArt: type,
					pointDesc: desc,
					pointDest: dest,
					pointNPs: NPs
				}
			});
		}
		else{
			alert("Keine Beschreibung fuer den Zielpunkt angegeben!");
		}
	}
	else{
		alert("Ungueltige Eingabe fuer X,Y oder Art!");
	}

}	
//Function for showing the button for saving the changes of a point
FRAIS.showUpdatePoint= function(){
	$("updateItem").style.display="";
}
//Function for showing the button for saving the changes of a point
FRAIS.hideUpdatePoint = function(){
	$("updateItem").style.display = "none";
}
//Function for loading the nav bar for a search
FRAIS.loadNavBar= function(){

	var MyAjax = new Ajax.Request('php/loadSystem.php', {
				method: 'post'
			});
}
//Function for creating 2 select items with all available start and destination points
FRAIS.loadDestinations= function(){
	var navBarSelectItemA=$("navBarSelectItemA");
	//if (navBarSelectItemB != null) {
		for (var i = 1; i < navBarSelectItemA.childNodes.length; i++) {
			navBarSelectItemA.removeChild(navBarSelectItemA.childNodes[i]);
		}
		FRAIS.resetMain();
	//}
	var navBarSelectA=$("navBarSelectA");
	if(navBarSelectA!=null){
		var project= $("navBarSelectA").value;
		if(project!=0){
			var MyAjax = new Ajax.Request('php/loadDestinations.php', {
				method: 'post',
				parameters: {
					projectId: project
				}
			});
		}
	}
}
//Function for executing a search
FRAIS.search =function(){
	FRAIS.resetMain();
	var start=$("navBarSelectBStart");
	var dest=$("navBarSelectBDest");
	if(start != null && dest != null){
		start=$("navBarSelectBStart").value;
		dest=$("navBarSelectBDest").value;
		if (start != 0 && dest != 0) {
			if (start != dest) {
				var MyAjax = new Ajax.Request('php/search.php', {
					method: 'post',
					parameters: {
						startId: start,
						destId: dest
					}
				});
			}
			else {
				alert("Der ausgewaehlte Startpunkt stimmt mit dem Zielpunkt ueberein!");
			}
		}else{
			alert("Es wurde kein Start- oder Zielpunkt ausgewaehlt!");
		}
	}


}
			