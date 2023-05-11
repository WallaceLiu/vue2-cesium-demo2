<template>
  <Modal
    class-name="hotpoint-toolbar"
    v-model="hotpointShow"
    draggable
    scrollable
    footer-hide
    title="热点分析工具"
    width="700"
    :styles="{ top: '85px' }"
    @on-visible-change="visibleChange"
  >
    <Table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      height="550"
      style="width: 100%"
    ></Table>
  </Modal>
</template>
<script>
import Bus from "@/utils/Bus";
import axios from "axios";
import URL from "@/utils/Url.config.js";

var colorList = [
  new Cesium.Color(254 / 255, 193 / 255, 60 / 255, 1),
  new Cesium.Color(128 / 255, 0 / 255, 38 / 255, 1),
  new Cesium.Color(168 / 255, 21 / 255, 50 / 255, 1),
  new Cesium.Color(227 / 255, 26 / 255, 28 / 255, 1),
  new Cesium.Color(252 / 255, 78 / 255, 42 / 255, 1),
  new Cesium.Color(200 / 255, 124 / 255, 69 / 255, 1),
];

export default {
  data() {
    return {
      loading: true,
      hotpointShow: false,
      tableData: [],
      columns: [
        {
          title: "排序",
          key: "id",
          type: "index",
          width: 100,
        },
        {
          title: "标志建筑",
          key: "building",
          width: 110,
        },
        {
          title: "详细位置",
          key: "address",
        },
        {
          title: "热度",
          key: "hot",
          width: 80,
          render: (h, params) => {
            var color = "default";
            if (params.row.hot == 2) {
              color = "primary";
            } else if (params.row.hot == 3) {
              color = "success";
            } else if (params.row.hot == 4) {
              color = "warning";
            } else if (params.row.hot == 5) {
              color = "error";
            }
            return h("div", [
              h(
                "Tag",
                {
                  props: {
                    color: color,
                  },
                },
                "HOT " + params.row.hot
              ),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 80,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "text",
                    size: "small",
                  },
                  on: {
                    click() {
                      var lon = params.row.lon;
                      var lat = params.row.lat;
                      
                      viewer.camera.flyTo({
                        destination: new Cesium.Cartesian3.fromDegrees(
                          lon,
                          lat,
                          1000
                        ),
                      });
                    },
                  },
                },
                "查看"
              ),
            ]);
          },
        },
      ],
    };
  },
  mounted() {
    Bus.$on("hotpoint-toolbar", (res) => {
      if (this.hotpointShow && res) return;
      this.hotpointShow = res;
      if (res) this.addHotpoint();
    });
  },
  methods: {
    visibleChange(show) {
      // 模态框关闭时
      if (!show) {
        this.statusID = -1;
        // this.clearMeasureDraw();
      }
    },
    addHotpoint() {
      this.loading = true;
      Bus.$emit("hotpoint-addlayer", true);
      setTimeout(() => {
        // 计算数据
        axios.get("/data/hotpoint.json").then((res) => {
          // 累和
          var hotobj = {};
          var data = res.data.features;
          for (var i = 0; i < data.length; i++) {
            var properties = data[i].properties;
            var xiangxiwei = properties["详细位"];
            if (hotobj.hasOwnProperty(xiangxiwei)) {
              hotobj[xiangxiwei].hot += properties.hot;
            } else {
              hotobj[xiangxiwei] = properties;
            }
          }
          // 转为数组
          var hotarray = [];
          var max = 0;
          var min = 1000000;
          for (var item in hotobj) {
            hotarray.push({
              hot: hotobj[item].hot,
              address: hotobj[item]["详细位"],
              building: hotobj[item]["标志建"],
              lon: hotobj[item]["X"],
              lat: hotobj[item]["Y"],
              channel: hotobj[item]["Channel"],
            });
            if (hotobj[item].hot > max) max = hotobj[item].hot;
            if (hotobj[item].hot < min) min = hotobj[item].hot;
          }
          hotarray.sort((x, y) => y.hot - x.hot);
          // 热度分级
          var off = (max - min) / 5;
          for (var i = 0; i < hotarray.length; i++) {
            hotarray[i].hot = Math.floor((hotarray[i].hot - min) / off) + 1;
            if (hotarray[i].hot == 6) {
              hotarray[i].hot = 5;
            }
          }
          this.tableData = hotarray;
          this.loading = false;
        });
      }, 1000);
    },
  },
};
</script>
<style>
.hotpoint-toolbar {
  right: calc(-100% + 550px) !important;
}

.hotpoint-toolbar /deep/ .ivu-modal-content {
  border-radius: 2px !important;
  overflow: hidden;
}

.hotpoint-toolbar /deep/ .ivu-modal-close {
  right: 2px !important;
  top: 2px !important;
}
.hotpoint-toolbar /deep/ .ivu-modal-header {
  padding: 4px 6px;
  background: rgba(34, 47, 113, 1);
}
.hotpoint-toolbar /deep/ .ivu-modal-header-inner {
  font-size: 14px;
  color: #fff;
}
.hotpoint-toolbar /deep/ .ivu-icon-ios-close {
  font-size: 24px !important;
  color: #fff !important;
}
.hotpoint-toolbar /deep/ .ivu-modal-body {
  padding: 0px;
  display: flex;
}

.hotpoint-toolbar /deep/ .ivu-table-cell {
  padding: 2px 8px;
}

.toolbar-btn {
  padding: 5px;
  height: 34px;
  border-radius: 2px;
}
.toolbar-btn:hover {
  opacity: 0.7;
  cursor: pointer;
}
.btn-img {
  width: 24px;
  height: 24px;
}
.line {
  height: 24px;
  width: 1px;
  background: #aaa;
  margin: 5px;
}

.modal-content {
  width: 100%;
  padding: 5px 8px;
}

.hotpoint-toolbar /deep/ .row {
  margin-bottom: 15px;
  font-size: 15px;
  display: flex;
}

.modal-content /deep/ .ivu-col {
  line-height: 32px;
}

.spatialTable {
  margin-top: 10px;
}
</style>
