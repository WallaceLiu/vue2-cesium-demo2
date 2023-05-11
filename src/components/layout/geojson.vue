<template>
  <div id="cesiumContainer">

       <div style="position:absolute;left:0;top:0;z-index:99;background:white;opacity:0.9;padding:10px">
   
       
               <el-button type="danger" @click="fix" size="mini">fix</el-button>
               <el-button type="danger" @click="addterrain" size="mini">addterrain</el-button>
               
         </div>


  </div>
</template>

<script>


import {getViewer}  from "@/util/viewer"

var viewer,entities,  centerArr = [] , entityHeights=[]
export default {
 // components:{mousePoint},
  name: 'geojson',
  mounted() {
    viewer = getViewer()

    viewer.scene.globe.depthTestAgainstTerrain = true;
    //这块写自己的json路径	
    var promise=Cesium.GeoJsonDataSource.load('data/buidings.json',{
      clampToGround: true
    });
    promise.then((dataSource)=> {
            viewer.dataSources.add(dataSource);
            entities = dataSource.entities.values;
            var colorHash = {};
         
            for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    var name = entity.name;
                    var color = colorHash[name];
                    if (!color) {
       
                        color = Cesium.Color.WHITESMOKE,
                        colorHash[name] = color;
                    }
                    entity.polygon.material = color;
                    entity.polygon.outline = false;            
    entity.polygon.extrudedHeight =entities[i].properties._Height._value
                    //100
   entity.polygon.HeightReference= Cesium.HeightReference.RELATIVE_TO_GROUND
  var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
   var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
  polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
   let radisCenter = Cesium.Cartographic.fromCartesian(polyCenter)
   centerArr.push(radisCenter)
              }
         terrainHeight
    });
    viewer.flyTo(promise);

     // viewer.scene.ad
  

  
  },
  methods:{
   async fix(){
         if(viewer.terrainProvider instanceof  Cesium.EllipsoidTerrainProvider){
             for (var j = 0; j < entities.length; j++) {
                  var _entity = entities[j];
                  _entity.polygon.extrudedHeight =_entity.properties._Height._value
              }
           
          }else{
              if(entityHeights.length==0){
                  let reslutArr  =  await Cesium.sampleTerrain(viewer.terrainProvider,11, centerArr)
                  console.log(reslutArr)
                  entityHeights = reslutArr.map(item=>item.height)

              }
              for (var j = 0; j < entities.length; j++) {
                  var _entity = entities[j];
                  _entity.polygon.extrudedHeight =entityHeights[j]+_entity.properties._Height._value
              }

          }
    },
    addterrain(){ 
      viewer.terrainProvider  = new Cesium.CesiumTerrainProvider({
        url:'data/terrain'
      })
    }
  },
  beforeDestroy(){

   // if(viewer)viewer.destroy();viewer=null
  }
}

</script>
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
