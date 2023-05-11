<template>
  <div>
    <Modal
      class-name="measure-toolbar"
      v-model="measureShow"
      draggable
      scrollable
      footer-hide
      title="量测工具栏"
      width="160"
      :styles="{ top: '85px' }"
      @on-visible-change="visibleChange"
    >
      <span
        class="toolbar-btn"
        @click="measureClick(1)"
        :style="{ background: statusID == 1 ? '#e2e2e2' : 'none' }"
      >
        <img
          class="btn-img"
          src="@/assets/toolbar/distance.svg"
          title="连续测距"
      /></span>
      <span
        class="toolbar-btn"
        @click="measureClick(2)"
        :style="{ background: statusID == 2 ? '#e2e2e2' : 'none' }"
        title="面积测量"
      >
        <img class="btn-img" src="@/assets/toolbar/area.svg"
      /></span>
      <span
        class="toolbar-btn"
        @click="measureClick(3)"
        :style="{ background: statusID == 3 ? '#e2e2e2' : 'none' }"
        title="方位角测量"
      >
        <img class="btn-img" src="@/assets/toolbar/angle.svg"
      /></span>
      <span class="line"></span>
      <span class="toolbar-btn" @click="measureClick(0)">
        <img class="btn-img" src="@/assets/toolbar/delete.svg" title="清除绘制"
      /></span>
    </Modal>
    <tooltip
      :isShow="toolBarStore.tooltip.length != 0"
      :style="{
        top: toolBarStore.tooltipTop + 'px',
        left: toolBarStore.tooltipLeft + 'px',
      }"
    >
      <div slot="content">
        <p v-html="toolBarStore.tooltip"></p>
      </div>
    </tooltip>
  </div>
</template>
<script>
import Bus from '@/utils/Bus';
// 导入测距、测面积、测方位角的函数
import toolBarSpatial from '@/components/func/spatial';
import tooltip from '@/components/toolbar/tooltip';

export default {
  data() {
    return {
      measureShow: false,
      statusID: -1, // -1是无功能，1是测距离，2是测面积，3是方位角
      toolBarStore: {
        tooltip: '',
        tooltipTop: 0,
        tooltipLeft: 0,
        points: [],
        tpoints: {},
        transition: [],
        entities: [],
        disLength: 0,
      },
    };
  },
  components: {
    tooltip,
  },
  mounted() {
    this.mouseEvent();
    Bus.$on('measure-toolbar', res => {
      if (this.measureShow && res) return;
      this.measureShow = res;
    });
  },
  methods: {
    measureClick(type) {
      // 123是功能，0是清除，-1是关闭
      if (type != 0) {
        this.statusID = type;
      }
      if (type == 0 || type == -1) {
        this.clearMeasureDraw();
      }
    },
    visibleChange(show) {
      // 模态框关闭时
      if (!show) {
        this.statusID = -1;
        this.clearMeasureDraw();
      }
    },
    mouseEvent() {
      var scene = viewer.scene;
      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      var _this = this;

      handler.setInputAction(function(movement) {
        if (_this.statusID == -1) return;
        var ray = viewer.camera.getPickRay(movement.endPosition);
        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var height = viewer.camera.positionCartographic.height;
          var pos = { x: lng, y: lat, z: 0 };

          // 工具栏的函数
          if (_this.statusID == 1) {
            toolBarSpatial.getDistanceMouseMove(_this, pos);
          } else if (_this.statusID == 2) {
            toolBarSpatial.getAreaMouseMove(_this, pos);
          } else if (_this.statusID == 3) {
            toolBarSpatial.getAngleMouseMove(_this, pos);
          }

          // 工具栏的tooltip显示
          if (_this.toolBarStore.tooltip.length != 0) {
            _this.toolBarStore.tooltipTop = movement.endPosition.y;
            _this.toolBarStore.tooltipLeft = movement.endPosition.x + 30;
          }
        } else {
          _this.toolBarStore.tooltip = '';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(function(movement) {
        if (_this.statusID == -1) return;
        var ray = viewer.camera.getPickRay(movement.position);
        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var height = viewer.camera.positionCartographic.height;
          var pos = { x: lng, y: lat, z: 0 };

          // 工具栏的函数
          if (_this.statusID == 1) {
            toolBarSpatial.getDistanceLeftClick(_this, pos);
          } else if (_this.statusID == 2) {
            toolBarSpatial.getAreaLeftClick(_this, pos);
          } else if (_this.statusID == 3) {
            toolBarSpatial.getAngleLeftClick(_this, pos);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction(function(movement) {
        if (_this.statusID == -1) return;
        // 工具栏的函数
        if (_this.statusID == 1) {
          toolBarSpatial.getDistanceRightClick(_this);
        } else if (_this.statusID == 2) {
          toolBarSpatial.getAreaRightClick(_this);
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    clearMeasureDraw() {
      for (var i = 0; i < this.toolBarStore.entities.length; i++) {
        viewer.entities.remove(this.toolBarStore.entities[i]);
      }
      for (var i = 0; i < this.toolBarStore.transition.length; i++) {
        viewer.entities.remove(this.toolBarStore.transition[i]);
      }
      this.toolBarStore.points = [];
      this.toolBarStore.tpoints = {};
      this.toolBarStore.transition = [];
      this.toolBarStore.entities = [];
      this.toolBarStore.disLength = 0;
      this.toolBarStore.tooltip = '';
      this.toolBarStore.tooltipLeft = 0;
      this.toolBarStore.tooltipTop = 0;
    },
  },
};
</script>
<style>
.measure-toolbar {
  right: calc(-100% + 210px) !important;
}

.measure-toolbar /deep/ .ivu-modal-content {
  border-radius: 2px !important;
  background: rgba(8, 10, 52, 0.8) !important;
}

.measure-toolbar /deep/ .ivu-modal-close {
  right: 2px !important;
  top: 2px !important;
}
.measure-toolbar /deep/ .ivu-modal-header {
  padding: 4px 6px;
  background: rgba(34, 47, 113, 1);
}
.measure-toolbar /deep/ .ivu-modal-header-inner {
  font-size: 14px;
  color: #eee;
}
.measure-toolbar /deep/ .ivu-icon-ios-close {
  font-size: 24px !important;
  color: #eee !important;
}
.measure-toolbar /deep/ .ivu-modal-body {
  padding: 3px 6px 6px 6px;
  display: flex;
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
</style>
