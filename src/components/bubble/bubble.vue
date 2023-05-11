<template>
  <div class="bubble"
       v-if="status.isShow"
       :style="{ top: status.top + 'px', left: status.left + 'px', display :!status.isBack ? '':'none'}">
    <div class="content"
         :style="{ width: width + 'px', height: height + 'px' }">
      <div class="delete-btn"
           @click="closeBubble">×</div>
      <div class="content-title">
        {{title}}
      </div>
      <div class="content-text">
        <div v-for="(val, key, index) in contentList"
             :key="index">
          <p style="word-break:break-all;">{{ key }}：{{ val }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'bubble',
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
  text-align: left;
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
  cursor: pointer;
}

.content-title {
  position: absolute;
  left: 10px;
  top: 10px;
  color: #e7d264;
  font-size: 16px;
  font-weight: 600;
}

.content-text {
  position: absolute;
  padding: 10px;
  top: 30px;
  color: #fff;
  font-size: 14px;
}
</style>
