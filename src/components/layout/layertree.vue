<template>
  <div class="layertree">
        <span style="font-size:18px; font-family: myFirstFont; font-weight:bold; padding:10px;"  >图层管理</span>
    <hr/>
    <Tree
      ref="tree"
      :data="data"
      show-checkbox
      @on-check-change="checkChange"
      @on-select-change="selectChange"
     
      class="tree-content"
    ></Tree>

    <!-- :render="renderContent" -->
  </div>
</template>
<script>
import Bus from "@/utils/Bus.js";
import elTree2 from "./tree/src/tree.vue";
import axios from "axios";
import URL from "@/utils/Url.config.js";
import LM from "./layermanager.js";
import POIimg from "./poi-image.js";

var layersData = {};
var entitiesData = {};
var geojsonData = {};
var tilesetArray = {};
var primitiveData = {};
var primitiveDataID = {};
var heatMapData = [];

var terrainProvider = null;
var poiPositions = [];
var centerArr = [] ;
var extent = {};
var maxZoom = 14;
var poiShow = true;
var timestamp = 0;
var labelDataSource = null;
var entities,  centerArr = [] , entityHeights=[];
var colorListJIBIE = [
  Cesium.Color.RED,
  Cesium.Color.ORANGERED,
  Cesium.Color.ORANGE,
  Cesium.Color.YELLOW,
  Cesium.Color.YELLOWGREEN,
  Cesium.Color.SKYBLUE,
];

export default {
  components: {
    elTree2,
  },
  data() {
    return {
      filterText: "",
      data: [
        {
          id: "0",
          title: "基础图层",
          expand: true,
          disableCheckbox: true,
          children: [
            {
              id: "0_1",
              title: "全球行政区划",
              checked: false,
              isLayer: true,
            },
            {
              id: "0_2",
              title: "全球地名注记",
              checked: false,
              isLayer: true,
            },
          ],
        },
        {
          id: "1",
          title: "基础数据",
          expand: true,
          disableCheckbox: true,
          children: [
            // {
            //   id: "1_1",
            //   title: "武汉市基础影像",
            //   isLayer: true,
            //   checked: true,
            // },
            // {
            //   id: "1_2",
            //   title: "武汉市行政区划",
            //   checked: true,
            //   isLayer: true,
            // },
            // {
            //   id: "1_4",
            //   title: "武汉市地形",
            //   checked: false,
            //   isTerrain: true,
            // },
            {
              id: "1_3",
              title: "三维建筑白膜",
              checked: false,
              isB3DM: true,
            },
            // {
            //   id: '1_5',
            //   title: '武汉市DEM',
            //   checked: false,
            // },
            // {
            //   id: "1_6",
            //   title: "武汉市POI",
            //   checked: false,
            //   isPrimitives: true,
            // },
          ],
        },
        {
          id: "2",
          title: "三维模型",
          expand: true,
          disableCheckbox: true,
          children: [
            {
              id: "2_1",
              title: "冰川dsm",
              checked: false,
              isB3DM: true,
            },
            // {
            //   id: "2_2",
            //   title: "体育馆",
            //   checked: false,
            //   isB3DM: true,
            // },
            // {
            //   id: "2_3",
            //   title: "胜利塔",
            //   checked: false,
            //   isB3DM: true,
            // },
            // {
            //   id: "2_4",
            //   title: "半岛宾馆",
            //   checked: false,
            //   isB3DM: true,
            // },
            // {
            //   id: "2_5",
            //   title: "老城区",
            //   checked: false,
            //   isB3DM: true,
            // },
          ],
        },
        // {
        //   id: "3",
        //   title: "人流热力图",
        //   expand: false,
        //   isHeatmap: true,
        // },
        // {
        //   id: "4",
        //   title: "视频监控点",
        //   expand: false,
        //   isGeojson: true,
        // },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },
      filelist: [], // 用户的数据列表
      sharelist: [], //共享的影像
      alreadylist: [], // 已经处理好的数据
    };
  },
  mounted() {
    this.$nextTick((res) => {
      // this.initXglobeFolder();
      this.initChecked();
      viewer.scene.camera.moveEnd.addEventListener(this.cameraEndEvent);
    });
//maximumScreenSpaceError 越小越清晰
      Bus.$on('message1',val=>{
        this.value=val
        var value1 =16-val*0.16;
        console.log(value1);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.maximumScreenSpaceError=value1;
        }
        }
        })
//maximumMemoryUsage 内存大小
    Bus.$on('message2',val=>{
        this.value=val
        var value2 =val*102.4;
        console.log(value2);
     for (const key in tilesetArray) {
     if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.maximumMemoryUsage=value2;
     }
     }
        })

//progressiveResolutionHeightFraction 0-0.5 
   Bus.$on('message3',val=>{
        this.value=val
        var value3 =val*0.005;
        console.log(value3);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.progressiveResolutionHeightFraction=value3;
        }
        }
        })
//cullRequestsWhileMovingMultiplie   移动时用于剔除请求的乘数。较大的代表更积极的剔除，较小的代表较不积极的剔除。
    Bus.$on('message9',val=>{
        this.value=val
        var value9 =val;
        console.log(value9);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.progressiveResolutionHeightFraction=value9;
        }
        }
        })
//dynamicScreenSpaceError   减少离相机较远的图块的屏幕空间错误。
    Bus.$on('message4',val=>{
        this.value=val
        var value4 =val;
        console.log(value4);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.dynamicScreenSpaceError=value4;
        }
        }
        })
//loadSiblings   减少离相机较远的图块的屏幕空间错误。
    Bus.$on('message5',val=>{
        this.value=val
        var value5 =val;
        console.log(value5);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.loadSiblings=value5;
        }
        }
        })
//cullWithChildrenBounds   减少离相机较远的图块的屏幕空间错误。
    Bus.$on('message6',val=>{
        this.value=val
        var value6 =val;
        console.log(value6);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.cullWithChildrenBounds=value6;
        }
        }
        })
//cullRequestsWhileMoving   减少离相机较远的图块的屏幕空间错误。
    Bus.$on('message7',val=>{
        this.value=val
        var value7 =val;
        console.log(value7);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.cullRequestsWhileMoving=value7;
        }
        }
        })
//preloadWhenHidden   减少离相机较远的图块的屏幕空间错误。
    Bus.$on('message8',val=>{
        this.value=val
        var value8 =val;
        console.log(value8);
      for (const key in tilesetArray) {
       if (Object.hasOwnProperty.call(tilesetArray, key)) {
      const element = tilesetArray[key];
      element.preloadWhenHidden=value8;
        }
        }
        })
    Bus.$on("hotpoint-addlayer", (res) => {
      var nodes = this.$refs.tree.getCheckedNodes();
      var renliu = false,
        shipin = false;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.title == "人流热力图") renliu = true;

        if (node.title == "视频监控点") shipin = true;
      }
      if (!renliu) {
        // 勾选
        this.$set(this.data[3], "checked", true);
        this.addHeatmap(this.data[3]);
      }
      if (!shipin) {
        // 勾选
        this.$set(this.data[4], "checked", true);
        this.addGeoJsonData(this.data[4]);
      }
    });
  },
  methods: {
  
    initChecked() {
      var nodes = this.$refs.tree.getCheckedNodes();
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.children == undefined || node.children.length == 0) {
          if (node.isLayer) this.addLayerData(node);
          
          else if (node.isPrimitives) this.addPrimitivesData(node);
        }
      }
    },
   async selectChange(tree, selectedItem) {
      selectedItem.selected = !selectedItem.selected;
        
    },
  async  checkChange(tree, selectedItem) {

      var show = false;
      if (selectedItem.checked == true) {
        show = true;
      }
      // 是xglobe的
      if (selectedItem.isX == true) {
        for (var i = 0; i < this.alreadylist.length; i++) {
          if (selectedItem.title == this.alreadylist[i]) {
            LM.cesiumTMSHandle({
              name: selectedItem.title,
              url: URL.xglobe.tmsUrl + selectedItem.title,
              show: show,
            });
            return;
          }
        }
        this.handle(selectedItem.title);
      }
      // 是layer服务图层的
      else if (selectedItem.isLayer == true) {
        if (show) {
          this.addLayerData(selectedItem);
        } else {
          this.removeLayerData(selectedItem);
        }
        if (selectedItem.id == "0_3") {
          Bus.$emit("set-road-show", show);
        }
      }
      // 是加载entity的
      else if (selectedItem.isEntity == true) {
        if (show) {
          this.addEntityData(selectedItem);
        } else {
          this.removeEntityData(selectedItem);
        }
      }
      // 是geojson数据
      else if (selectedItem.isGeojson == true) {
        if (show) {
          this.addGeoJsonData(selectedItem);
        } else {
          this.removeGeoJsonData(selectedItem);
        }
      } else if (selectedItem.isTerrain == true) {
        if (show) {
          terrainProvider = new Cesium.CesiumTerrainProvider({
            url: URL.tomcat + "/jiujiangterrain/",
          });
          viewer.scene.terrainProvider = terrainProvider;
          viewer.scene.globe.depthTestAgainstTerrain = true;
          // this.terrainShow(true);
          // var positions = [
          //   Cesium.Cartographic.fromDegrees(115.97163810583626, 29.540209646016265), //输入经纬度
          // ];
          // var promise = Cesium.sampleTerrain(terrainProvider, 1, positions); //获取14级地形高程
          // Cesium.when(promise, function (updatedPositions) {
          //   var terrainHeight = updatedPositions[0].height;
          // });
        } else {
          var nullTerrainProvider = new Cesium.EllipsoidTerrainProvider({});
          viewer.scene.terrainProvider = nullTerrainProvider;
        }
      } else if (selectedItem.isB3DM == true) {
        if (show) {
          this.addB3DMData(selectedItem);
        } else {
          this.removeB3DMData(selectedItem);
        }
      } else if (selectedItem.isPrimitives == true) {
        if (show) {
          this.addPrimitivesData(selectedItem);
        } else {
          this.removePrimitivesData(selectedItem);
        }
      } else if (selectedItem.isHeatmap == true) {
        if (show) {
          this.addHeatmap(selectedItem);
        } else {
          this.removeHeatmap(selectedItem);
        }
      }
    if(viewer.terrainProvider instanceof  Cesium.EllipsoidTerrainProvider){
             for (var j = 0; j < entities.length; j++) {
                  var _entity = entities[j];
                  _entity.polygon.extrudedHeight =_entity.properties._Height._value
              }
           
          }else{
              if(selectedItem.isTerrain == true){
                  let reslutArr  =  await Cesium.sampleTerrain(viewer.terrainProvider,11, centerArr)
                  console.log(reslutArr)
                   console.log(entityHeights.length)
                  entityHeights = reslutArr.map(item=>item.height)

              }
              for (var j = 0; j < entities.length; j++) {
                  var _entity = entities[j];
                  _entity.polygon.extrudedHeight =entityHeights[j]+_entity.properties._Height._value
              }

          }
    },
    addHeatmap(selectedItem) {
      if (selectedItem.title == "人流热力图") {
        axios.get("/data/hotpoint.json").then((res) => {
          var features = res.data.features;
          var data = [];
          var min = 100000;
          var max = 0;
          for (var i = 0; i < features.length; i++) {
            var value = features[i].properties["hot"];
            data.push({
              x: features[i].properties["X"],
              y: features[i].properties["Y"],
              value: value,
            });
            if (value > max) max = value;
            if (value < min) min = value;
          }
          heatMapData = CesiumHeatmap.create(
            viewer, // your cesium viewer
            {
              west: 115.939188,
              east: 116.024043,
              south: 29.657175,
              north: 29.729587,
            }, // bounds for heatmap layer
            {
              // heatmap.js options go here
              backgroundColor: "rgba(0,0,0,0)",
              radius: 100,
              maxOpacity: 0.5,
              minOpacity: 0,
              blur: 0.75,
            }
          );
          heatMapData.setWGS84Data(min, max, data);
        });
      }
    },
    removeHeatmap(selectedItem) {
      if (selectedItem.title == "人流热力图") {
        if (heatMapData != null) {
          viewer.entities.remove(heatMapData._layer);
          heatMapData = null;
        }
      }
    },
    terrainShow(show) {
      if (show) {
        // 打开了地形，需要获取点的高程值
        var promise = Cesium.sampleTerrain(terrainProvider, 12, poiPositions);
        Cesium.when(promise, function (updatedPositions) {
          this.removePrimitivesData({
            title: "武汉市POI",
          });
          this.addPrimitivesData(
            {
              title: "武汉市POI",
            },
            updatedPositions
          );
        });
      }
    },
    getTextWidth(str) {
      var width = 0;
      var html = document.createElement("span");
      html.innerText = str;
      html.className = "getTextWidth";
      document.querySelector("body").appendChild(html);
      width = document.querySelector(".getTextWidth").offsetWidth;
      document.querySelector(".getTextWidth").remove();
      return width;
    },
    addLegend(data) {
      if (data.title == "地震烈度图") {
        var colors = {
          V: "#C87C27",
          VI: "#FC4E2A",
          VII: "#E31A1C",
          VIII: "#A81532",
          IX: "#800026",
        };
        var arr = [];
        var index = 1;
        for (var item in colors) {
          arr.push({
            title: item,
            color: colors[item],
            id: "dz" + index,
          });
          index++;
        }
        // 地震是下标为1的节点
        this.$set(this.data[1].children[1], "children", arr);
        this.$set(this.data[1].children[1], "expand", true);
        this.$nextTick(() => {
          for (var k = 0; k < arr.length; k++) {
            var obj = document.getElementById(arr[k].id);
            var checkbox = obj.parentNode.parentNode.children[1];
            checkbox.style.display = "none";
          }
        });
      }
    },
    removeLegend(data) {
      if (data.title == "地震烈度图") {
        this.$set(this.data[1].children[1], "children", []);
      }
    },
    renderContent(h, { root, node, data }) {
      if (
        data.id != undefined &&
        data.id.slice(0, 2) == "dz" &&
        data.checked == true
      ) {
        return (
          <div class="custom-tree-dz-node" id={data.id}>
            <span
              style={"background:" + data.color + ";width:30px;height:15px"}
            ></span>
            <span style={"margin-left:15px"}>{data.title}</span>
          </div>
        );
      } else
        return h(
          "span",
          {
            style: {
              display: "inline-block",
              width: "auto",
              cursor: "pointer",
            },
            attrs: {
              id: data.id,
            },
          },
          [
            h(
              "Tooltip",
              {
                props: {
                  placement: "top-start",
                  transfer: true,
                  maxWidth: "200px",
                },
              },
              [
                data.title, //控制树形显示的内容
                h(
                  "span",
                  {
                    slot: "content",
                    style: {
                      whiteSpace: "normal",
                    },
                  },
                  data.title //控制Tooltip显示的内容
                ),
              ]
            ),
            h("span", {
              style: {
                display: "inline-block",
                float: "right",
                marginRight: "32px",
              },
            }),
          ]
        );
    },
    addLayerData(data) {
      if (data.title == "全球行政区划") {
        //加载天地图全球行政区划数据
        var provider = new Cesium.WebMapTileServiceImageryProvider({
          url:
            "http://t0.tianditu.com/ibo_w/wmts?service=wmts&tk=2a2c5ce64b61343727085b76c46d7ad3&request=GetTile&version=1.0.0&LAYER=ibo&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
          layer: "tiandituImgQH",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "tiandituImgQH",
          maximumLevel: 16,
        });
        layersData[data.title] = viewer.imageryLayers.addImageryProvider(
          provider
        );
      } else if (data.title == "全球地名注记") {
        //加载天地图全球地名注记数据
        var provider = new Cesium.WebMapTileServiceImageryProvider({
          url:
            "http://t0.tianditu.com/cia_w/wmts?service=wmts&tk=2a2c5ce64b61343727085b76c46d7ad3&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
          layer: "tiandituImgMarker",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "tiandituImgMarker",
          maximumLevel: 16,
        });
        layersData[data.title] = viewer.imageryLayers.addImageryProvider(
          provider
        );
      } else if (data.title == "武汉市行政区划") {
        var provider = new window.Cesium.WebMapServiceImageryProvider({
          url: URL.geoserver + "/jiujiang/wms",
          layers: "jiujiang:jiujiang_quhua",
          parameters: {
            transparent: true, //是否透明
            format: "image/png",
            version: "1.1.0",
            srs: "EPSG:4326",
          },
        });
        layersData[data.title] = viewer.imageryLayers.addImageryProvider(
          provider
        );
        // viewer.camera.flyTo({
        //   destination: Cesium.Cartesian3.fromDegrees(
        //     115.42510230563575,
        //     29.38086287024092,
        //     350000,
        //   ),
        // });
      } else if (data.title == "武汉市基础影像") {
        var provider = new Cesium.UrlTemplateImageryProvider({
          url: URL.tomcat + "/jiujiangyingxiang/tiles/{z1}/{x}/{reverseY}.png",
          tilingScheme: new Cesium.GeographicTilingScheme(),
          minimumLevel: 2,
          maximumLevel: 18,
          fileExtension: "png",
          customTags: {
            z1: function (imageryProvider, x, y, level) {
              return level + 1;
            },
          },
          rectangle: new Cesium.Rectangle(
            Cesium.Math.toRadians(113.936682462226),
            Cesium.Math.toRadians(28.6884026525604),
            Cesium.Math.toRadians(116.899083564155),
            Cesium.Math.toRadians(30.0754823210523)
          ),
        });
        layersData[data.title] = viewer.imageryLayers.addImageryProvider(
          provider
        );
      }
    },
    removeLayerData(data) {
      if (layersData.hasOwnProperty(data.title)) {
        viewer.imageryLayers.remove(layersData[data.title]);
        delete layersData[data.title];
        this.removeLegend(data);
      }
    },
    addEntityData(data) {
      if (data.title == "视频监控点") {
        entitiesData[data.title] = [];
        var entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            115.99325324373922,
            29.709743124163676
          ),
          billboard: {
            image: "/symbol/sp2.png",
            width: 25,
            height: 25,
          },
          label: {
            text: "视频监控点1",
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.RED,
            font: "32px sans-serif",
            scale: 0.5,
            pixelOffset: new Cesium.Cartesian2(0.0, 24),
          },
          isVideo: true,
        });
        entitiesData[data.title].push(entity);
        viewer.zoomTo(viewer.entities);
      }
    },
    removeEntityData(data) {
      var entities = entitiesData[data.title];
      for (var i = 0; i < entities.length; i++) {
        viewer.entities.remove(entities[i]);
      }
      entitiesData[data.title] = [];
    },
   async  addGeoJsonData(data) {
      if (data.title == "武汉市建筑") {
        var node = this.data[1].children;
        node.splice(3, 1, {
          title: data.title,
          checked: true,
          loading: true,
          expand: false,
          isGeojson: true,
        });
        var _this = this;
        axios
          .get(
            URL.geoserver +
              "/jiujiang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jiujiang:buildings&outputFormat=application%2Fjson"
          )
          .then((res) => {
            var geojson = res.data;
            var promise = Cesium.GeoJsonDataSource.load(geojson, {
              // camera: viewer.scene.camera,
              // canvas: viewer.scene.canvas,
              clampToGround: true, //开启贴地
            });
            promise.then(function (dataSource) {
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
          if(viewer.terrainProvider instanceof  Cesium.EllipsoidTerrainProvider){
                  var _entity = entities[i];
                  _entity.polygon.extrudedHeight =_entity.properties._Height._value
              
          }else{
              if(entityHeights.length==0){
                  let reslutArr  =  Cesium.sampleTerrain(viewer.terrainProvider,11, centerArr)
                  console.log(reslutArr)
                  entityHeights = reslutArr.map(item=>item.height)
              }
                  var _entity = entities[i];
                  _entity.polygon.extrudedHeight =entityHeights[i]+_entity.properties._Height._value

          }         
                   // entity.polygon.extrudedHeight =entities[i].properties._Height._value;
                    
                    //100
                        entity.polygon.classificationType =
                        Cesium.ClassificationType.TERRAIN;
                        entity.isBuilding = true;
                        entity.polygon.HeightReference= Cesium.HeightReference.RELATIVE_TO_GROUND
  

                      var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;

                      var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;

                      polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);

                      let radisCenter = Cesium.Cartographic.fromCartesian(polyCenter)
                      centerArr.push(radisCenter)
              }
              
              geojsonData[data.title] = dataSource;
              viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(
                  115.97490185882842,
                  29.548049889252916,
                  1295.1897647603191
                ),
                orientation: {
                  heading: 6.265754591474925,
                  pitch: -0.5557482988479676,
                  roll: 6.283126174105142,
                },
              });
            });
          });
    
      } else if (data.title == "视频监控点") {
        axios
          .get(
            URL.geoserver +
              "/jiujiang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jiujiang:shipin&outputFormat=application%2Fjson"
          )
          .then((res) => {
            var geojson = res.data;
            var promise = Cesium.GeoJsonDataSource.load(geojson, {
              camera: viewer.scene.camera,
              canvas: viewer.scene.canvas,
              clampToGround: true, //开启贴地
            });
            promise.then(function (dataSource) {
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
                    //  _entity.polygon.extrudedHeight =entityHeights[i]+_entity.properties._Height._value;
                    //100
                     entity.polygon.HeightReference= Cesium.HeightReference.RELATIVE_TO_GROUND
                      var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                      var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center
                      polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
                      let radisCenter = Cesium.Cartographic.fromCartesian(polyCenter)
                      centerArr.push(radisCenter)
              }
              geojsonData[data.title] = dataSource;
            });
          });
      }
    },
    removeGeoJsonData(data) {
      if (geojsonData.hasOwnProperty(data.title)) {
        geojsonData[data.title].entities.removeAll();
      }
      if (data.title == "武汉市建筑") {
        Bus.$emit("bubble-close", true);
      }
      if (data.title == "视频监控点") {
        Bus.$emit("videoplayer-close", true);
      }
    },
    addPrimitivesData(data, heights) {
      if (data.title == "武汉市POI") {
        poiShow = true;
        var node = this.data[1].children;
        node.splice(4, 1, {
          title: data.title,
          checked: true,
          loading: true,
          expand: false,
          isPrimitives: true,
        });
        // 定义label的datasource
        labelDataSource = new Cesium.CustomDataSource("label");
        viewer.dataSources.add(labelDataSource);
        var _this = this;
        axios
          .get(
            URL.geoserver +
              "/jiujiang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jiujiang:poi&outputFormat=application%2Fjson"
          )
          .then((res) => {
            var geojson = res.data.features;
            var pointPrimitives = viewer.scene.primitives.add(
              new Cesium.PointPrimitiveCollection()
            );
            var ids = {};
            for (var i = 0; i < geojson.length; i++) {
              var lon = geojson[i].geometry.coordinates[0];
              var lat = geojson[i].geometry.coordinates[1];
              var jibie = parseInt(geojson[i].properties.jibie);
              ids[geojson[i].id] = {
                name: geojson[i].properties.name,
                lon: lon,
                lat: lat,
                index: i,
              };
              pointPrimitives.add({
                id: name,
                pixelSize: 5,
                color: colorListJIBIE[jibie - 1],
                position: Cesium.Cartesian3.fromDegrees(
                  lon,
                  lat
                  // heights?.[i] == undefined ? 0 : heights[i]
                ),
              });
            }
            primitiveData[data.title] = pointPrimitives;
            primitiveDataID[data.title] = ids;
            node.splice(4, 1, {
              title: data.title,
              checked: true,
              expand: false,
              isPrimitives: true,
            });
            _this.cameraEndEvent();
            // 存储poiPositions用于获取点高程值
            for (var id in ids) {
              poiPositions.push(
                Cesium.Cartographic.fromDegrees(ids[id].lon, ids[id].lat)
              );
            }
          });
      }
    },
 
    removePrimitivesData(data) {
      if (primitiveData.hasOwnProperty(data.title)) {
        var primitives = primitiveData[data.title];
        viewer.scene.primitives.remove(primitives);
      }
      if (data.title == "武汉市POI") {
        labelDataSource.entities.removeAll();
        poiShow = false;
      }
    },
    addB3DMData(data) {
      if (data.title == "火车站") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2431179.055395176,
            4985231.950452045,
            3140798.948112879
          ),
          orientation: {
            heading: 0.2999333741265531,
            pitch: -0.5003978223079484,
            roll: 6.283184870079847,
          },
        });
        var tileset = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/huochezhan/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.2, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: true, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });
        var heightoff = -140;
        tilesetArray[data.title] = tileset;
        tileset.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      } else if (data.title == "体育馆") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2427435.1202136064,
            4990317.807370859,
            3136491.062572306
          ),
          orientation: {
            heading: 0.29992998249528213,
            pitch: -0.5004188688984432,
            roll: 6.28318484612079,
          },
        });
        var tileset = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/tiyuguan/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });

        var heightoff = -140;
        tilesetArray[data.title] = tileset;
        tileset.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      } else if (data.title == "胜利塔") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2425872.320695305,
            4986516.306245158,
            3141184.7087131767
          ),
          orientation: {
            heading: 1.576558773589599,
            pitch: -0.3169237949617538,
            roll: 0.0030366677337960724,
          },
        });
        var tileset = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/shenglita/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });
        var heightoff = -20;
        tilesetArray[data.title] = tileset;
        tileset.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      } else if (data.title == "半岛宾馆") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2426624.231378075,
            4988539.210037199,
            3138248.0834177346
          ),
          orientation: {
            heading: 0.2999609880852212,
            pitch: -0.5002332076622915,
            roll: 6.2831850516311665,
          },
        });
        var tileset = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/bandao/tileset.json",
          
          
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });
        var heightoff = 0;
        tilesetArray[data.title] = tileset;
        tileset.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      } else if (data.title == "老城区") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2433559.7893535835,
            4986206.1342957495,
            3139907.36213659
          ),
          orientation: {
            heading: 5.708650070065147,
            pitch: -0.3645326053921636,
            roll: 6.281505365362561,
          },
        });
        var tileset1 = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/oldcity1/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });
        tilesetArray[data.title + "1"] = tileset1;
        tileset1.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
        var tileset2 = new Cesium.Cesium3DTileset({
          url: URL.tomcat + "/oldcity2/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });
        tilesetArray[data.title + "2"] = tileset2;
        tileset2.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      }else if (data.title == "武汉市建筑") {
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2427435.1202136064,
            4990317.807370859,
            3136491.062572306
          ),
          orientation: {
            heading: 0.29992998249528213,
            pitch: -0.5004188688984432,
            roll: 6.28318484612079,
          },
        });
        
        var tileset = new Cesium.Cesium3DTileset({
          url: "/data/wuhanbuildings/tileset.json",
          maximumScreenSpaceError: 2, //越小越清晰，向下加载瓦片
          maximumMemoryUsage: 4096, //允许使用的最大内存（M）
          dynamicScreenSpaceError: true, //允许动态调节屏幕误差
          progressiveResolutionHeightFraction: 0.5, //取值（0-0.5）
          loadSiblings: true, //加载临近节点
          cullWithChildrenBounds: false,
          cullRequestsWhileMoving: false, // 相机移动不剔除瓦片
          cullRequestsWhileMovingMultiplier: 1,
          preloadWhenHidden: true, //预加载
        });

        var heightoff = -140;
        tilesetArray[data.title] = tileset;
        tileset.readyPromise
          .then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            );
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              heightoff
            );
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // viewer.zoomTo(
            //   tileset,
            //   new Cesium.HeadingPitchRange(
            //     0.3,
            //     -0.5,
            //     tileset.boundingSphere.radius * 1.5
            //   )
            // );
          })
          .otherwise(function (error) {
            console.log(error);
          });
      }
    },
    removeB3DMData(data) {
      if (tilesetArray.hasOwnProperty(data.title)) {
        viewer.scene.primitives.remove(tilesetArray[data.title]);
      } else if (tilesetArray.hasOwnProperty(data.title + "1")) {
        viewer.scene.primitives.remove(tilesetArray[data.title + "1"]);
        viewer.scene.primitives.remove(tilesetArray[data.title + "2"]);
      }
    },
    altitudeToZoom(altitude) {
      var A = 40487.57;
      var B = 0.00007096758;
      var C = 91610.74;
      var D = -40467.74;

      return Math.round(D + (A - D) / (1 + Math.pow(altitude / C, B)));
    },
    getExtent() {
      var canvas = viewer.scene.canvas;
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var lt = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(0, 0),
        ellipsoid
      ); // canvas左上角
      var rb = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(canvas.width, canvas.height),
        ellipsoid
      ); // canvas右下角
      if (lt && rb) {
        lt = viewer.scene.globe.ellipsoid.cartesianToCartographic(lt);
        rb = viewer.scene.globe.ellipsoid.cartesianToCartographic(rb);
        extent = {
          west: (lt.longitude * 180) / Math.PI,
          north: (lt.latitude * 180) / Math.PI,
          east: (rb.longitude * 180) / Math.PI,
          south: (rb.latitude * 180) / Math.PI,
        };
      } else {
        extent = false;
      }
    },
    checkInExtent(p) {
      if (
        p.lon > extent.west &&
        p.lon < extent.east &&
        p.lat > extent.south &&
        p.lat < extent.north
      ) {
        return true;
      }
      return false;
    },
    cameraEndEvent() {
      if (poiShow == true && primitiveData.hasOwnProperty("武汉市POI")) {
        var height = Math.ceil(viewer.camera.positionCartographic.height);
        var zoom = this.altitudeToZoom(height);
        // 更新视野范围
        this.getExtent();
        if (extent.hasOwnProperty("west") && zoom > maxZoom) {
          timestamp++;
          var dataID = primitiveDataID["武汉市POI"];
          for (var id in dataID) {
            if (this.checkInExtent(dataID[id])) {
              var obj = labelDataSource.entities.getById(id);
              if (obj == undefined) {
                // 如果对应id的不存在，则绘制label
                this.addPOIlabel(id, dataID[id]);
              } else {
                // 如果对应id存在
                obj.status = timestamp;
              }
            }
          }
          // 对于所有不是这批的
          var entities = labelDataSource.entities.values;
          for (var i = 0; i < entities.length; i++) {
            var obj = entities[i];
            if (obj.status != timestamp) {
              labelDataSource.entities.remove(obj);
            }
          }
        } else {
          labelDataSource.entities.removeAll();
        }
      }
    },
    addPOIlabel(id, data) {
      var text = data.name;
      if (text.length >= 12) text = text.slice(0, 10) + "\n" + text.slice(10);
      var entity = labelDataSource.entities.add({
        id: id,
        position: Cesium.Cartesian3.fromDegrees(data.lon, data.lat),
        label: {
          text: text,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          font: "26px sans-serif",
          pixelOffset: new Cesium.Cartesian2(0.0, -14),
          scale: 0.5,
        },
      });
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
};
</script>
<style scoped>
.layertree {
  width: 250px;
  overflow-x: hidden;
}

.filter-tree {
  height: 65vh;
  overflow: auto;
}

.layertree /deep/ .ivu-tree-title {
  color: #bfc4d8;
}

.layertree /deep/ .ivu-tree-title:hover {
  background: #35466bd6;
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #535353;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
}
</style>
<style>
.custom-tree-dz-node {
  flex: 1;
  display: flex;
  font-size: 14px;
  align-items: center;
}
</style>
