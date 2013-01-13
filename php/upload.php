// PHP-script to upload a floorplan image
<?php
	$server=$_SERVER['DOCUMENT_ROOT'];
	$result=0;
	$filepath= $server."/FRAIS/images/".basename( $_FILES['addLevelFloorplanImageInput']['name']);
	
	if(@move_uploaded_file($_FILES['addLevelFloorplanImageInput']['tmp_name'], $filepath)) {
      $result = 1;
   }
  
?>
<script language="javascript" type="text/javascript">
	(function(){
		var result=<?php echo $result ?>;
		if (result == 1) {
			var project=parseInt(window.top.window.document.getElementById("navBarSelectB").value);

			var building=parseInt(window.top.window.document.getElementById("navBarSelectD").value);
			
			var desc=window.top.window.document.getElementById("addLevelDescInput").value;

			var image=window.top.window.document.getElementById("addLevelFloorplanImageInput").value;

			var length=window.top.window.document.getElementById("addLevelFloorplanLengthInput").value;

			var height=window.top.window.document.getElementById("addLevelFloorplanHeightInput").value;
	
			var refX=window.top.window.document.getElementById("addLevelFloorplanRefXInput").value;
	
			var refY=window.top.window.document.getElementById("addLevelFloorplanRefYInput").value;
	
			var scale=window.top.window.document.getElementById("addLevelFloorplanScaleInput").value;
			
			//alert(project+" "+building+" "+desc+" "+image+" "+length+" "+height+" "+refX+" "+refY+" "+scale);
			
			var MyAjax = new window.top.window.Ajax.Request('php/addLevel.php', {
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
			
		}else{
			alert("Ebene wurde nicht korrekt erzeugt!");
		}
	 }());	
</script>