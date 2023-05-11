<template>
  <div>
    <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="量测工具"
      @click="addWind()"
    >
      <i class="el-icon-cloudy" style="width:20px;height:20px;"></i>
      <div class="tool-name">风场</div>
    </button>
    <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="量测工具"
      @click="addTemperature()"
    >

      <i class="el-icon-sunny" style="width:20px;height:20px;"></i>
      <div class="tool-name">温度</div>
    </button>
    <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="量测工具"
      @click="addFlights()"
    >
      <!-- <img src="@/assets/toolbar/hotpoint.png" style="width:20px;height:20px;" /> -->
    <i class="el-icon-s-promotion" style="width:20px;height:20px;"></i>
      <div class="tool-name">航线</div>
    </button>
    <!-- <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="量测工具"
      @click="open(2)"
    >
      <img src="@/assets/toolbar/liangce.png" style="width:20px;height:20px;" />
      <div class="tool-name">量测</div>
    </button> -->
    <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="量测工具"
      @click="open(3)"
    >
      <img src="@/assets/toolbar/hotpoint.png" style="width:20px;height:20px;" />
      <div class="tool-name">热点</div>
    </button>  
   <button
      class="cesium-button my-cesium-toolbar-button"
      style="width:80px;height:36px"
      title="空间分析工具"
      @click="open(1)"
    >
      <img src="@/assets/toolbar/kongjian.png" style="width:20px;height:20px;" />
      <div class="tool-name">设置</div>
    </button>
    <div v-if="show3DTileTool" class="tiletool" @click="open3DTileTool(false)">
      <Icon type="md-close" size="18"/>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Bus from "@/utils/Bus";
import EchartsLayer from '../EchartsLayer';
import { option } from '../data.js';
import '../PolylineDynamicMaterialProperty';
import '../EllipsoidFadeMaterialProperty';
import Windy from '../Windy';
import CesiumTemperatureLayer from '../CesiumTemperature';
import CesiumHeatmap from '../CesiumHeatmap';
import { parabolaEquation } from '../PolylineParabola.js';
import {
  layerSplit,
  removeLayerSplit,
} from '../CesiumLayersSplit.js';
import {
  lidarPlaneScan,
  lidarHemisphereScan,
  lidarPyramidScan,
} from '../CreateLidarEntity';

export default {
  data() {
    return {
      show3DTileTool: false,
    };
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
    open(type) {
      switch (type) {
        case 1:
          Bus.$emit("setting-toolbar", true);
          break;
        case 2:
          Bus.$emit("measure-toolbar", true);
          break;
        case 3:
          Bus.$emit("hotpoint-toolbar", true);
          break;
      }
    },
    open(type) {
      switch (type) {
        case 1:
          Bus.$emit("setting-toolbar", true);
          break;
        case 2:
          Bus.$emit("measure-toolbar", true);
          break;
        case 3:
          Bus.$emit("hotpoint-toolbar", true);
          break;
      }
    },
    open3DTileTool(show) {
      var obj = document.getElementsByClassName(
        "cesium-viewer-cesium3DTilesInspectorContainer"
      )[0];
      this.show3DTileTool = show;
      if (show) {
        obj.style.display = "";
      } else {
        obj.style.display = "none";
      }
    },
  },
};
</script>
<style>
.my-cesium-toolbar-button {
  box-sizing: border-box;
  padding: 0;
  padding-top: 6px;
  vertical-align: middle;
  z-index: 0;
  display: flex;
  padding-left: 10px;
  background: rgba(8, 10, 52, 0.8);
  border: 1px solid rgba(34, 47, 113, 1);
  box-shadow: inset 0 0 10px rgba(34, 47, 113, 1);
}
.tool-name {
  margin-left: 10px;
}
.tiletool {
  position: absolute;
  z-index: 101;
  top: 62px;
  right: 22px;
  cursor: pointer;
}
.tiletool:hover {
  opacity: 0.6;
}
</style>
