<template>
  <div
    class="tooltip"
    :isShow="isShow"
    :style="{ display: isShow ? '' : 'none' }"
  >
    <div class="arrow"></div>
    <slot name="content"></slot>
  </div>
</template>
<script>
export default {
  props: ['isShow'],
  data() {
    return {};
  },
  methods: {},
};
</script>
<style scoped>
.tooltip {
  z-index: 20;
  position: absolute;
  width: auto;
  height: auto;
  padding: 8px 15px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 14px;
}
.arrow {
  position: absolute;
  top: 10px;
  left: -14px; /* 圆角的位置需要细心调试哦 */
  width: 0;
  height: 0;
  font-size: 0;
  border: solid 7px;
  border-color: transparent rgba(0, 0, 0, 0.5) transparent transparent;
}
</style>
