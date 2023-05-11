<template>
  <div
    class="bubble"
    :style="{
      display: isShow ? '' : 'none',
    }"
    :isShow="isShow"
  >
    <div class="border-top1"></div>
    <div class="border-top2"></div>
    <div class="border-right"></div>
    <div
      class="content"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <div class="delete-btn" @click="closeBubble">×</div>
      <div class="content-title">
        <slot name="title"></slot>
      </div>
      <div class="content-text">
        <slot name="content"></slot>
      </div>
    </div>
    <div class="border-bottom1"></div>
    <div class="border-bottom2"></div>
  </div>
</template>
<script>
import Bus from '@/utils/Bus';

export default {
  props: ['isShow', 'width', 'height'],
  data() {
    return {};
  },
  mounted() {
    Bus.$on('bubble-show', res => {
      this.isShow = res;
    });
  },
  methods: {
    closeBubble() {
      this.isShow = false;
      this.$emit('closeBubble', false);
    }
  },
};
</script>
<style scoped>
.bubble {
  z-index: 20;
  position: absolute;
}

.content {
  background: rgba(8, 10, 52, 0.8);
  /* border: 1px solid #0081cb; */
  box-shadow: inset 0 0 10px #3c6379;
}

.delete-btn {
  font-size: 25px;
  line-height: 30px;
  width: 30px;
  text-align: center;
  position: absolute;
  top: 5px;
  right: 5px;
  color: #bbb;
}

.delete-btn:hover {
  color: #fff;
}

.content-title {
  position: absolute;
  left: 14px;
  top: 10px;
  color: #e7d264;
  font-size: 16px;
  font-weight: 600;
}

.content-text {
  position: absolute;
  left: 14px;
  top: 42px;
  color: #fff;
  font-size: 14px;
  text-align: left;
}

.border-top1 {
  height: 2px;
  background: #0081cb;
  width: 40%;
  position: relative;
  left: 60%;
  z-index: 100;
  top: 0px;
  right: -2px;
}

.border-top2 {
  height: 1px;
  background: #0081cb;
  width: 60%;
  position: relative;
  left: 40%;
  top: 0px;
  right: -2px;
  z-index: 100;
}

.border-right {
  height: 80px;
  background: #0081cb;
  width: 3px;
  position: relative;
  float: right;
  right: -3px;
  top: -3px;
  z-index: 100;
}

.border-bottom1 {
  height: 1px;
  background: #0081cb;
  width: 60%;
  position: relative;
  z-index: 100;
  top: 0px;
}

.border-bottom2 {
  height: 2px;
  background: #0081cb;
  width: 40%;
  position: relative;
  z-index: 100;
  top: 0px;
}

.delbtn {
  padding: 2px 6px;
  border: none;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
}

.delbtn:hover {
  opacity: 0.7;
  cursor: pointer;
}
</style>
