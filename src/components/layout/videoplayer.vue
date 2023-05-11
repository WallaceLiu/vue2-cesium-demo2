<template>
  <div>
    <Modal
      class-name="video-player"
      v-model="videoShow"
      draggable
      scrollable
      footer-hide
      title="视频监控点"
      width="700"
      :styles="{ top: '85px' }"
      @on-visible-change="visibleChange"
    >
      <div class="video-info">
        <Row class="rows">
          <Col :span="3">区域：</Col>
          <Col :span="21">{{ videoInfo.region }}</Col>
        </Row>
        <Row class="rows">
          <Col :span="3">详细位置：</Col>
          <Col :span="21">{{ videoInfo.address }}</Col>
        </Row>
      </div>
      <!-- <video-player
        v-if="videoShow"
        class="video-player vjs-custom-skin video-position"
        ref="videoPlayer"
        :playsinline="true"
        :options="playerOptions"
      ></video-player>-->
      <Row>
        <Col :span="18">
          <video
            id="videoElement"
            controls="controls"
            autoplay="autoplay"
            class="video-position"
          ></video>
        </Col>
        <Col :span="6">
          <Row class="rows">
            <Col :span="8"></Col>
            <Col :span="8">
              <div class="camera-controls" @click="moveCamera('up')">
                <Icon type="ios-arrow-up" size="28" />
              </div>
            </Col>
            <Col :span="8"></Col>
          </Row>
          <Row class="rows" style="margin-top: 15px">
            <Col :span="8">
              <div class="camera-controls" @click="moveCamera('left')">
                <Icon type="ios-arrow-back" size="28" />
              </div>
            </Col>
            <Col :span="8">
              <div class="camera-controls">
                <Icon type="ios-microphone" size="28" />
              </div>
            </Col>
            <Col :span="8">
              <div class="camera-controls" @click="moveCamera('right')">
                <Icon type="ios-arrow-forward" size="28" />
              </div>
            </Col>
          </Row>
          <Row class="rows" style="margin-top: 15px">
            <Col :span="8"></Col>
            <Col :span="8">
              <div class="camera-controls" @click="moveCamera('down')">
                <Icon type="ios-arrow-down" size="28" />
              </div>
            </Col>
            <Col :span="8"></Col>
          </Row>
          <Row class="rows" style="margin-top: 15px">
            <Col :span="6"></Col>
            <Col :span="6">
              <div class="camera-controls" @click="moveCamera('zoomin')">
                <Icon type="md-add-circle" size="26" />
              </div>
            </Col>
            <Col :span="6">
              <div class="camera-controls" @click="moveCamera('zoomout')">
                <Icon type="md-remove-circle" size="26" />
              </div>
            </Col>
            <Col :span="6"></Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  </div>
</template>
<script>
import Bus from "@/utils/Bus";
import { videoPlayer } from "vue-video-player";
import "video.js/dist/video-js.css";
import "videojs-flash";
import axios from "axios";
import URL from "@/utils/Url.config.js";

export default {
  components: {
    videoPlayer,
  },
  data() {
    return {
      videoShow: false,
      // 视频播放插件设置
      //   playerOptions: {
      //     sources: {
      //       type: "video/flv",
      //       src: "http://localhost:10001/sms/34020000002020000001/flv/hls/36040000002000001213_36040000001310001309.flv",
      //       withCredentials: false,
      //     },
      //     techOrder: ["flash"],
      //     autoplay: true,
      //     live: true,
      //     width: 460,
      //   },
      videoInfo: {
        region: "",
        address: "",
        serial: "36040000002000001213",
        channel: 16,
      },
      // };
    };
  },
  mounted() {
    Bus.$on("video-player-show", (res) => {
      if (this.videoShow && res) return;
      this.videoShow = res;
      if (res == true) {
        // 关闭热点
        Bus.$emit("hotpoint-toolbar", false);
      }
    });
    Bus.$on("video-info", (res) => {
      this.videoInfo.region = res["标志建"];
      this.videoInfo.address = res["详细位"];
      this.videoInfo.channel = res["Channel"];
      this.videoPlay();
    });
  },
  methods: {
    videoPlay() {
      var _this = this;
      axios
        .get(URL.video + "/stream/start", {
          params: {
            serial: this.videoInfo.serial,
            channel: this.videoInfo.channel,
          },
        })
        .then((res) => {
          var flv = res.data["FLV"];
          if (flvjs.isSupported()) {
            var obj = document.getElementById("videoElement");
            var flvPlayer = flvjs.createPlayer({
              type: "flv",
              isLive: true,
              url: flv,
            });
            try {
              flvPlayer.attachMediaElement(obj);
              flvPlayer.load();
              flvPlayer.play();
            } catch (err) {
              _this.videoPlay();
            }
          }
        });
    },
    visibleChange(show) {
      if (!show) {
        Bus.$emit("videoplayer-close", false);
      }
    },
    // moveCamera(command) {
    //   axios
    //     .get("http://localhost:10001/api/v1/control/ptz", {
    //       params: {
    //         serial: "36040000002000001213",
    //         channel: 11,
    //         command: command,
    //         // speed: 1,
    //         // _: new Date().valueOf() / 1000,
    //       },
    //     })
    //     .then((res) => {
    //       console.log(res.data);
    //     });
    //   setTimeout((res) => {
    //     axios
    //       .get("http://localhost:10001/api/v1/control/ptz", {
    //         params: {
    //           serial: "36040000002000001213",
    //           channel: 11,
    //           command: 'stop',
    //           // speed: 1,
    //           // _: new Date().valueOf() / 1000,
    //         },
    //       })
    //       .then((res) => {
    //         console.log(res.data);
    //       });
    //   }, 50);
    // },
  },
};
</script>
<style>
.video-player {
  right: calc(-100% + 730px) !important;
}

.video-player /deep/ .ivu-modal-content {
  border-radius: 2px !important;
}

.video-player /deep/ .ivu-modal-close {
  right: 2px !important;
  top: 2px !important;
}
.video-player /deep/ .ivu-modal-header {
  padding: 4px 6px;
  background: rgba(34, 47, 113, 1);
}
.video-player /deep/ .ivu-modal-header-inner {
  font-size: 14px;
  color: #fff;
}
.video-player /deep/ .ivu-icon-ios-close {
  font-size: 24px !important;
  color: #fff !important;
}
.video-player /deep/ .ivu-modal-body {
  padding: 10px 20px;
}
.video-position {
  margin-top: 10px;
  width: 490px;
}
/* .video-info {
  padding: 10px 20px;
} */
.video-player /deep/ .rows {
  height: 30px;
  display: flex;
}

.camera-controls {
  padding: 20px;
}

.camera-controls:hover {
  opacity: 0.6;
  cursor: pointer;
}
</style>
