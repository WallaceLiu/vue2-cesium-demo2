<template>
  <div>
    <div id="cesiumContainer"></div>
    <!-- cesium目标的气泡弹框 -->
    <bubble
      :isShow="bubble.isShow && !bubble.isBack"
      :height="bubble.height"
      :width="bubble.width"
      @closeBubble="closeBubble"
      :style="{ top: bubble.top + 'px', left: bubble.left + 'px' }"
    >
      <div slot="title">
        <p>{{ bubbleParams.name }}</p>
      </div>
      <div slot="content">
        <div v-for="(val, key, index) in bubbleParams.info" :key="index">{{ key }}：{{ val }}</div>
      </div>
    </bubble>
  </div>
</template>
<script>
import Bus from "@/utils/Bus.js";
import URL from "@/utils/Url.config.js";
// 气泡
import bubble from "@/components/layout/bubble.vue";

var clickSelecting = false;
var drawClickSelected = null;

var selectedBuilding = null;
var curHeight = 0;

var selectedVideo = null;

export default {
  name: "cesiumContainer",
  components: {
    bubble,
  },
  data() {
    return {
      bubble: {
        isShow: false,
        width: 0,
        height: 0,
        isBack: false,
        top: 0,
        left: 0,
        x: 0,
        y: 0,
      },
      bubbleParams: {
        name: "",
        info: [],
      },
    };
  },
  mounted() {
    this.initCesium();
    this.monitor();
    // Cesium鼠标事件
    this.mouseEvent();
  },
  methods: {
    initCesium() {
      // 创建viewer实例
      viewer = new Cesium.Viewer("cesiumContainer", {
        timeline: false,
        animation: false,
        navigationHelpButton: false,
        geocoder: false,
        SkyAtmosphere: false,
        sceneModePicker: false,
        homeButton: false,
        fullscreenButton: false,
        // imageryProvider: new Cesium.UrlTemplateImageryProvider({
        //   url:
        //     'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali',
        // }),
        
        // imageryProvider:  new Cesium.UrlTemplateImageryProvider({
        //   url:URL.tomcat + "/BlueMarble_5L/{z}/{x}/{reverseY}.jpg",
        //   tilingScheme: new Cesium.GeographicTilingScheme(),
        //   minimumLevel: 0,
        //   maximumLevel: 4,
        //   fileExtension: "jpg",
        // }),
        // imageryProvider: new Cesium.UrlTemplateImageryProvider({
        //   url: URL.tomcat + "/world/tiles/{z}/{x}/{reverseY}.png",
        //   tilingScheme: new Cesium.GeographicTilingScheme(),
        //   minimumLevel: 0,
        //   maximumLevel: 7,
        //   fileExtension: "png",
        // }),
        
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          url:
            "http://t0.tianditu.com/img_w/wmts?tk=2a2c5ce64b61343727085b76c46d7ad3&service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
          layer: "img",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          credit: new Cesium.Credit("天地图全球影像服务"),
          // subdomains: [
          //   "t0",
          //   "t1",
          //   "t2",
          //   "t3",
          //   "t4",
          //   "t5",
          //   "t6",
          //   "t7",
          //   "t8",
          //   "t9",
          //   "t10"
          // ],
          maximumLevel: 18,
          show: false,
        }),
        baseLayerPicker: false,
        selectionIndicator: false, //鼠标点击wms选择框
        infoBox: false,
      });
      // 初始化vue-cesium插件.
   var GeoLimitHeight = new Cesium.GeoLimitHeight({
    viewer:viewer
});
//开始分析
GeoLimitHeight.analysis({
   targetHeight:targetHeight,
   labelOption:{
       labelPosition:Cesium.Cartesian3.fromDegrees(lng,lat,targetHeight),
       labelText:"海拔高度："+targetHeight+"米",
       labelShow:true
   },
   polygonPlaneOption:{
       polygonPlaneHierarchy:Cesium.Cartesian3.fromDegreesArray(positionsArray),
       polygonPlaneShow:true,
   },
   polygonFitOption:{
       polygonFitPositions:positionsArray,
   }
  });
      // 引入指北针
      viewer.extend(Cesium.viewerCesiumNavigationMixin, {});

      // 引入3d tielse调试器，设置不显示
      viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
      var obj = document.getElementsByClassName(
        "cesium-viewer-cesium3DTilesInspectorContainer"
      )[0];
      obj.style.display = "none";
      // 去掉默认picking
      var inputNode = document.getElementsByClassName(
        "cesium-cesiumInspector-sectionContent"
      )[0].children[3].children[0].children[0];
      inputNode.click();

      // 去除版权信息
      viewer._cesiumWidget._creditContainer.style.display = "none";
      // 设置延迟时间以显示动画
      setTimeout(() => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            115.42510230563575,
            29.38086287024092,
            5500000
          ),
        });
      }, 1000);

      // 加载datasource
      analysisDataSource = new Cesium.CustomDataSource("analysis");
      viewer.dataSources.add(analysisDataSource);

      // 修改homeButton的默认位置
      // viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      //   function(e) {
      //     e.cancel = true;
      //     //你要飞的位置
      //     viewer.camera.flyTo({
      //       destination: Cesium.Cartesian3.fromDegrees(
      //         103.6315352925101,
      //         27.28681019277553,
      //         21621314.855752839,
      //       ),
      //     });
      //   },
      // );
      //抗锯齿
      viewer.scene.postProcessStages.fxaa.enabled = true;
      //修改分辨率
         var supportsImageRenderingPixelated =viewer.cesiumWidget._supportsImageRenderingPixelated;
      if (supportsImageRenderingPixelated) {
              var vtxf_dpr = window.devicePixelRatio;
              viewer.resolutionScale = vtxf_dpr;
      }
    },
    monitor() {
      Bus.$on("cesium-select-point", (res) => {
        clickSelecting = res.show;
        drawClickSelected = res.type;
      });
      Bus.$on("bubble-close", (res) => {
        this.closeBubble();
      });
      Bus.$on("videoplayer-close", (res) => {
        var type = selectedVideo.info["F6"];
        var url = type == "球机" ? "cam2-1.png" : "cam1-1.png";
        selectedVideo.billboard.image = "/symbol/" + url;
        selectedVideo = null;
      });
    },
    mouseEvent() {
      var scene = viewer.scene;
      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      var _this = this;

      // 屏蔽双击实体跟踪事件
      viewer.trackedEntity = undefined;
      viewer._cesiumWidget._screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );

      var scene = viewer.scene;
      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      // 鼠标左击事件
      handler.setInputAction((movement) => {
        var ray = viewer.camera.getPickRay(movement.position);
        var cartesian = viewer.scene.globe.pick(ray, scene);
        if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var height = viewer.camera.positionCartographic.height;
          var pos = { x: lng, y: lat, z: height };
        }

        // 获取点击位置的entity
        var pick = viewer.scene.pick(movement.position);
        if (Cesium.defined(pick) && pick.id != undefined) {
          if (pick.id.isVideo === true) {
            if (selectedVideo != null) {
              var type = selectedVideo.info["F6"];
              var url = type == "球机" ? "cam2-1.png" : "cam1-1.png";
              selectedVideo.billboard.image = "/symbol/" + url;
            }
            selectedVideo = pick.id;
            var type = selectedVideo.info["F6"];
            var url = type == "球机" ? "cam2-2.png" : "cam1-2.png";
            selectedVideo.billboard.image = "/symbol/" + url;
            // 打开视频
            Bus.$emit("video-player-show", true);
            Bus.$emit("video-info", pick.id.info);
          } else if (pick.id.isBuilding === true) {
            // 清除高亮样式
            if (selectedBuilding != null) {
              selectedBuilding.polygon.outline = false;
            }
            // 设置新的高亮样式
            var building = pick.id;
            building.polygon.outline = true;
            building.polygon.outlineColor = Cesium.Color.BLUE;
            selectedBuilding = building;
            _this.bubble.isShow = true;
            _this.bubble.top = movement.position.y;
            _this.bubble.left = movement.position.x;
            _this.bubble.width = 200;
            _this.bubble.x = pos.x;
            _this.bubble.y = pos.y;
            var newinfo = {};
            newinfo["建筑高度"] = building.properties.Height._value + "层";
            var name = building.name;
            if (name != undefined && name != null) {
              newinfo["建筑名称"] = name;
              _this.bubble.height = 120;
            } else {
              _this.bubble.height = 80;
            }
            _this.bubble.isShow = true;
            _this.bubbleParams = {
              name: "建筑信息",
              info: newinfo,
            };
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 气泡位置
      viewer.scene.postRender.addEventListener(function () {
        if (_this.bubble.isShow) {
          // 更新气泡框位置，判断其是否应该显示
          var cartesian = Cesium.Cartesian3.fromDegrees(
            _this.bubble.x,
            _this.bubble.y
          );
          var pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            viewer.scene,
            cartesian
          );
          var c = viewer.camera.position;
          var max =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(c).height +
            viewer.scene.globe.ellipsoid.maximumRadius -
            1000000;
          if (pos && Cesium.Cartesian3.distance(c, cartesian) < max) {
            _this.bubble.isBack = false;
            _this.bubble.top = pos.y;
            _this.bubble.left = pos.x;
          } else {
            _this.bubble.isBack = true;
          }
        }
      });
    },
    closeBubble() {
      this.bubble.isShow = false;
      if (selectedBuilding != null) {
        selectedBuilding.polygon.outline = false;
      }
    },
  },
};
</script>
<style scoped>
#cesiumContainer {
  height: 100vh;
  width: 100vw;
}
</style>
