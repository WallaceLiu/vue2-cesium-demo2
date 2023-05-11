import Bubble from './bubble.vue';
import Vue from 'vue';

const BubbleConstructor = Vue.extend(Bubble);
const bubbleInstance = {};

// 建立气泡框
const showBubble = (options) => {
	let id = 'CesiumBubble-' + options.id;
	const bubbleDOM = new BubbleConstructor({
		el: document.createElement('div'),
		data() {
			return {
				viewer: options.viewer,
				width: options.width,
				height: options.height,
				title: options.title,
				contentList: options.contentList,
				longitude: options.longitude,
				latitude: options.latitude,
				status: {
					isShow: true,
					isBack: false,
					top: -999,
					left: -999,
				},
			};
		},
		mounted() {
			viewer.scene.postRender.addEventListener(this.postRenderEvent);
		},
		methods: {
			postRenderEvent() {
				if (this.status.isShow) {
					// 更新气泡框位置，判断其是否应该显示
					var cartesian = Cesium.Cartesian3.fromDegrees(
						this.longitude,
						this.latitude
					);
					var pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
						viewer.scene,
						cartesian
					);
					var c = viewer.camera.position;
					var max =
						viewer.scene.globe.ellipsoid.cartesianToCartographic(c)
							.height +
						viewer.scene.globe.ellipsoid.maximumRadius -
						1000000;
					if (pos && Cesium.Cartesian3.distance(c, cartesian) < max) {
						this.status.isBack = false;
						this.status.top = pos.y;
						this.status.left = pos.x;
					} else {
						this.status.isBack = true;
					}
				}
			},
			closeBubble() {
				this.status.isShow = false;
				viewer.scene.postRender.removeEventListener(
					this.postRenderEvent
				);
			},
		},
		beforeDestroy() {
			this.closeBubble();
		},
	});
	document.body.appendChild(bubbleDOM.$el);
	bubbleInstance[id] = bubbleDOM;
};

// 根据id删除气泡框
showBubble.removeById = (id) => {
    id = 'CesiumBubble-' + id;
	if (bubbleInstance && bubbleInstance[id]) {
		bubbleInstance[id].closeBubble();
		delete bubbleInstance[id];
	}
};

function cesiumBubbleRegistry() {
	Vue.prototype.$CesiumBubble = showBubble;
}

export default cesiumBubbleRegistry;
