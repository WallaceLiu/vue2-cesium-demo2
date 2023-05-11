<template>

  <div style="background: rgba(8, 10, 52, 0.8);" >
    <Modal
      class-name="setting-toolbar"
      v-model="measureShow"
      draggable
      scrollable
      footer-hide
      title="模型设置"
      width="320"
      :styles="{ top: '85px' }"
      @on-visible-change="visibleChange"
      
    >
 <div class="block" >
     <span class="demonstration">倾斜摄影精细度</span>
     <el-slider v-model="value1" :step="6.25" :format-tooltip="formatTooltip0" ></el-slider>
    </div>
    <!-- <div class="block">
     <span class="demonstration">最大使用内存(mb)</span>
     <el-slider v-model="value2" :step="10" :format-tooltip="formatTooltip1"></el-slider>
    </div>
    <div class="block">
     <span class="demonstration">渐进分辨率</span>
     <el-slider v-model="value3" :step="20" :format-tooltip="formatTooltip2"></el-slider>
    </div> -->
        <!-- <div class="block">
     <span class="demonstration">相机移动参数</span>
     <el-slider v-model="value9" step="1" :format-tooltip="formatTooltip3"></el-slider>
    </div> -->
    <div class="block" style="margin-top: 10px;">
     <span class="demonstration1" style="margin-right: 10px;  ">动态调节屏幕误差
     </span>
        <el-switch
       v-model="value4"
      active-color="#13ce66"
        inactive-color="#ff4949" @change="changeSwitch4($event)"
        style="margin-left:120px;">
       </el-switch >
    </div>
    <div class="block" style="margin-top: 10px;">
     <span class="demonstration1" style="margin-right: 10px; ">加载临近节点
</span>
        <el-switch
       v-model="value5"
      active-color="#13ce66"
        inactive-color="#ff4949" @change="changeSwitch5($event)"
        style="margin-left:147px;">
       </el-switch>
    </div>
        <div class="block" style="margin-top: 10px;">
     <span class="demonstration1" style="margin-right: 10px;  ">子项边界剔除图块</span>
        <el-switch
       v-model="value6"
      active-color="#13ce66"
        inactive-color="#ff4949" @change="changeSwitch6($event)"
        style="margin-left:124px;">
       </el-switch>
    </div>
        <div class="block" style="margin-top: 10px;">
     <span class="demonstration1" style="margin-right: 10px; ">相机移动剔除瓦片
</span>
        <el-switch
       v-model="value7"
      active-color="#13ce66"
        inactive-color="#ff4949" @change="changeSwitch7($event)"
        style="margin-left:120px;">
       </el-switch>
    </div>
        <div class="block" style="margin-top: 10px;">
     <span class="demonstration1" style="margin-right: 10px;  ">预加载</span>
        <el-switch
       v-model="value8"
      active-color="#13ce66"
      style="margin-left:195px;"
        inactive-color="#ff4949" @change="changeSwitch8($event)">
       </el-switch>
    </div>
 
    
    

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
          value1: 87.5,
          value2: 40,
          value3: 100,     
          value4: true,
          value5: true,
          value6: false,
          value7: true,
          value8: true,
          value9: 10,
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
    
   
    Bus.$on('setting-toolbar', res => {
      if (this.measureShow && res) return;
      this.measureShow = res;
    });
    //Bus.$emit('message',this.value1);
  },
  
  methods: {
       formatTooltip0(val) {
        console.log(val);
        Bus.$emit('message1',this.value1);
        return val *0.16;
         
      },
       formatTooltip1(val) {
        Bus.$emit('message2',this.value2);
        
        return val * 102.4;
      },
      formatTooltip2(val) {
        Bus.$emit('message3',this.value3);
        return val *0.005;
      },
      formatTooltip3(val) {
        Bus.$emit('message9',this.value9);
        return val ;
      },
      changeSwitch4(val){
       console.log(val);    
        Bus.$emit('message4',this.value4);
      },
    changeSwitch5(val){
       console.log(val);    
        Bus.$emit('message5',this.value5);
      },
    changeSwitch6(val){
       console.log(val);    
        Bus.$emit('message6',this.value6);
      },
    changeSwitch7(val){
       console.log(val);    
        Bus.$emit('message7',this.value7);
      },
    changeSwitch8(val){
       console.log(val);    
        Bus.$emit('message8',this.value8);
      },
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



.setting-toolbar {
  right: calc(-100% + 330px) !important;
  
}

.setting-toolbar /deep/ .ivu-modal-content {
  border-radius: 2px !important;
    background: rgba(8, 10, 52, 0.8);
  /* border: 1px solid #0081cb; */
  box-shadow: inset 0 0 10px #3c6379;
}

.setting-toolbar /deep/ .ivu-modal-close {
  right: 2px !important;
  top: 2px !important;
}
.setting-toolbar /deep/ .ivu-modal-header {
  padding: 4px 6px;
  background: rgba(34, 47, 113, 1);
}
.setting-toolbar /deep/ .ivu-modal-header-inner {
  font-size: 14px;
  color: #eee;
}
.setting-toolbar /deep/ .ivu-icon-ios-close {
  font-size: 24px !important;
  color: #eee !important;
}
.setting-toolbar /deep/ .ivu-modal-body {
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