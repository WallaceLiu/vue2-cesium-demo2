<template>
  <div class="layout">
    <div class="top-header">
      <div class="header-title">
        vue-cesium<span>mu</span>
        <div id="he-plugin-simple"></div>
      </div>
    </div>
    <layer-tree class="left-top" v-show="layerShow"></layer-tree>

    <cesium-view></cesium-view>
    <!-- 工具栏的一些组件 -->
    <tool-bar class="right-top">
      
    </tool-bar>
    <!-- <measure-toolbar></measure-toolbar> -->
    <setting-toolbar></setting-toolbar>
    <hotpoint-toolbar></hotpoint-toolbar>
    <!-- 视频播放 -->
    <video-player></video-player>
  
  </div>
</template>

<script>
import toolBar from '@/components/layout/toolbar';
import layerTree from '@/components/layout/layertree';
import cesiumView from '@/components/layout/cesium';
import settingToolbar from '@/components/toolbar/setting.vue';
import measureToolbar from '@/components/toolbar/measure.vue';
import hotpointToolbar from '@/components/toolbar/hotpoint.vue';
// import videoPlayer from '@/components/layout/videoplayer.vue';
import axios from 'axios';
import URL from '@/utils/Url.config.js';
import EchartsLayer from '../components/EchartsLayer.js';
import { option } from '../components/data.js';
import '../components/PolylineDynamicMaterialProperty';
import '../components/EllipsoidFadeMaterialProperty';
import Windy from '../components/Windy';
import CesiumTemperatureLayer from '../components/CesiumTemperature';
import CesiumHeatmap from '../components/CesiumHeatmap';
import { parabolaEquation } from '../components/PolylineParabola.js';
import {
  layerSplit,
  removeLayerSplit,
} from '../components/CesiumLayersSplit.js';
import {
  lidarPlaneScan,
  lidarHemisphereScan,
  lidarPyramidScan,
} from '../components/CreateLidarEntity';
export default {
  name: 'layout',
  components: {
    toolBar,
    layerTree,
    cesiumView,
    measureToolbar,
    hotpointToolbar,
    settingToolbar,
    // videoPlayer,
  },
  data() {
    return {
      layerShow: true,
      // 瓦片切割参数
      filelist: [], // 用户的数据列表
      sharelist: [], //共享的影像
      alreadylist: [], // 已经处理好的数据
    };
  },
created(){
  const city = "武汉"
	      //和风天气插件调用
	      window.WIDGET = {
  "CONFIG": {
    "modules": "01234",
    "background": "1",
    "tmpColor": "FFFFFF",
    "tmpSize": "16",
    "cityColor": "FFFFFF",
    "citySize": "16",
    "aqiColor": "FFFFFF",
    "aqiSize": "16",
    "weatherIconSize": "24",
    "alertIconSize": "18",
    "padding": "10px 10px 10px 10px",
    "shadow": "1",
    "language": "auto",
    "borderRadius": "5",
    "fixed": "true",
    "vertical": "top",
    "horizontal": "left",
    "right": "-1650",
    "top": "70",
    "key": "c954748cc7334106a549f952acef1d89"
  }
	      };
	      (function (d) {
	        var c = d.createElement('link');
	        c.rel = 'stylesheet';
	        c.href = 'static/css/he-simple.css';
	        var s = d.createElement('script');
	        s.src = 'static/js/he-simple.js';
	        var sn = d.getElementsByTagName('script')[0];
	        sn.parentNode.insertBefore(c, sn);
	        sn.parentNode.insertBefore(s, sn);
	      })(document);
	    },
  mounted() {
    // this.initCesium();
    //this.mouseEvent();
    //动态迁徙线
    //this.addFlights();
    // // 动态车流量
    // this.addOdLine();
    // echarts图层
    //this.addEchartsLayer();
    // // 动态扩散点
    //  this.addPoint();
    // // 温度场
    // this.addTemperature();
    // // 三种雷达可视化效果
    // this.addLidar();
    // 风场可视化
    // this.addWind();
    // // 热力图
    //  this.addHeatmap();
     //气泡弹框
    // this.addBubble();
    // // 卷帘分析
    //  this.addLayerSplit();
  },
  methods: {
    addOdLine() {
      Cesium.Resource.fetchJson('./bjgj.json').then(function (e) {
        e.length;
        var p = [];
        e.map(function (e, i) {
          for (var r, a = [], n = 0; n < e.length; n += 2) {
            var t = [e[n], e[n + 1]];
            0 < n && (t = [r[0] + t[0], r[1] + t[1]]);
            var o = (r = t)[0] / 1e4,
              s = t[1] / 1e4,
              m = Cesium.Cartesian3.fromDegrees(o, s, 100);
            a.push(m);
          }
          p.push({ positions: a });
        });
        p.forEach(function (e) {
          viewer.entities.add({
            polyline: {
              positions: e.positions,
              material: new Cesium.PolylineDynamicMaterialProperty({
                color: new Cesium.Color(0.9, 0.1, 0.1, 0.8),
                speed: 1,
                startTime: Math.random(),
              }),
            },
          });
        });
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(116.5, 40, 120000),
      });
    },
    addEchartsLayer() {
      viewer.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 0);
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer._cesiumWidget._creditContainer.style.display = 'none';

      let _echartLayer = new EchartsLayer(viewer, option);
      viewer.camera.setView({
        destination: new Cesium.Cartesian3(
          -9256145.42310121,
          24956348.93821263,
          10829723.085629512
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: Cesium.Math.toRadians(0),
        },
      });
    },
    createFlights(pt1, pt2) {
      var points = parabolaEquation({
        pt1: { x: pt1[0], y: pt1[1] },
        pt2: { x: pt2[0], y: pt2[1] },
        height: 1000000,
        num: 10,
      });
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(points),
          material: new Cesium.PolylineDynamicMaterialProperty({
            color: new Cesium.Color(0.5, 0.5, 0, 1),
            speed: 2,
            startTime: Math.random(),
          }),
        },
      });
    },
    addFlights() {
      axios
        .get(
          'https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/examples/data-gl/asset/data/flights.json'
        )
        .then((res) => {
          let data = res.data;
          let routes = data.routes.map(function (airline) {
            return [
              [data.airports[airline[1]][3], data.airports[airline[1]][4]],
              [data.airports[airline[2]][3], data.airports[airline[2]][4]],
            ];
          });
          for (let i = 0; i < routes.length; i = i + 20) {
            this.createFlights(routes[i][0], routes[i][1]);
          }
        });
    },
    addHeatmap() {
      let data = [];
      for (let i = 0; i < 100; i++) {
        data.push({
          x: 120 + Math.random() * 2,
          y: 30 + Math.random() * 2,
          value: Math.random() * 100,
        });
      }
      let map = CesiumHeatmap.create({
        viewer: viewer,
        options: {
          backgroundColor: 'rgba(0,0,0,0)',
          radius: 100,
          maxOpacity: 0.5,
          minOpacity: 0,
          blur: 0.75,
        },
        data: data,
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(121, 31, 500000),
      });
    },
    addTemperature() {
      let a = new CesiumTemperatureLayer('/data/2020072206tmp.json');
    },
    addLidar() {
      let lidar1 = lidarPlaneScan(120, 30, 3000);
      let lidar2 = lidarHemisphereScan(120.1, 30, 3000);
      let lidar3 = lidarPyramidScan(120.2, 30, 4000, 60);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(120.1, 30, 30000),
      });
    },
    addWind() {
      let wind = new Windy('/data/gfs.json');
    },
    layerShowChange() {
      this.layerShow = !this.layerShow;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout {
   position: relative;
  width: 100%;
  height: 100%;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently*/
}
#he-plugin-simple {
  position: absolute;
  top: 3rem;
  right: 3rem;
  z-index: 100;
}
.left-top {
  position: absolute;
  left: 10px;
  top: 70px;
  z-index: 100;
  padding: 10px;
  text-align: left;
  border: 1px solid #15222b;
  background: rgba(8, 10, 52, 0.8);
  border: 1px solid rgba(34, 47, 113, 1);
  box-shadow: inset 0 0 10px rgba(34, 47, 113, 1);
}

.logo-name {
  font-size: 20px;
  position: relative;
  top: -16px;
  font-weight: 600;
  text-shadow: 3px 4px 0px #1c2f3c;
  left: 2px;
}

.right-top {
  position: absolute;
  top: 25px;
  z-index: 100;
  right: 10px;
  display: flex;
}

.top-header {
  width: 100vw;
  height: 60px;
  position: absolute;
  top: 0px;
  z-index: 100;
  text-align: left;
  background-image: url("../assets/header.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
}

.header-title {
  font-size: 22px;
  position: relative;
  top: 5px;
  left: 25px;
  font-weight: 600;
  text-shadow: 3px 4px 0px #1c2f3c;
}


.header-title span {
  font-size: 20px;
  margin-left: 10px;
  color: #9cccff;
  font-weight: 600;
}

.bottom-title {
  position: absolute;
  bottom: 0px;
  height: 25px;
  width: 100vw;
  background: rgba(8, 10, 52, 0.8);
  z-index: 100;
}

.bottom-title span {
  font-size: 15px;
  line-height: 25px;
  color: #c5c4c4;
}

</style>
<style>

.ivu-modal-content{
  background: rgba(8, 10, 52, 0.8) !important;
  color: white;
  font-family: "微软雅黑"
}
.ivu-modal-header-inner{
  
  color: #f9f9f9 !important;
  font-family: "微软雅黑"
}
.ivu-table-header
{
  background: rgba(8, 10, 52, 0.8) !important;
  color: #f9f9f9;
  font-family: "微软雅黑"
}
.ivu-table-body
{
  background: rgba(8, 10, 52, 0.8) !important;
  color: #f9f9f9;
  font-family: "微软雅黑"
}
.ivu-table td
{
  background: rgba(8, 10, 52, 0.8) !important;
  color: #f9f9f9;
  font-family: "微软雅黑"
}
.ivu-table th 
{
  background: rgba(8, 10, 52, 0.8) !important;
  color: #f9f9f9;
  font-family: "微软雅黑"
}
.ivu-table-tbody td :hover
{
  background-color: rgba(153, 155, 190, 0.8) !important;
  color: #cecaca;
  font-family: "微软雅黑"
}
.ivu-btn-text
{
  
  color: #f9f9f9 !important;
  font-family: "微软雅黑";
}
</style>