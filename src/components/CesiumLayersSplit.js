// 第一个参数是左图，第二个参数是右图
// 左图是layerLeft，右图是layerRight，右图如果不传传参，默认为底图
// 如果左图也传入，右图也传入，则要保证左图的图层顺序是最上面，右图是第二
export function layerSplit(layerLeft, layerRight) {
	// 设置图层顺序
	if (layerRight !== undefined) {
		viewer.imageryLayers.raiseToTop(layerRight);
		viewer.imageryLayers.raiseToTop(layerLeft);
	}

	layerLeft.splitDirection = Cesium.ImagerySplitDirection.LEFT; // Only show to the left of the slider.

	// 创建slider的div以及样式
	var slider = createSliderDiv();
	viewer.scene.imagerySplitPosition =
		slider.offsetLeft / slider.parentElement.offsetWidth;

	var handler = new Cesium.ScreenSpaceEventHandler(slider);

	var moveActive = false;

	function move(movement) {
		if (!moveActive) {
			return;
		}

		var relativeOffset = movement.endPosition.x;
		var splitPosition =
			(slider.offsetLeft + relativeOffset) /
			slider.parentElement.offsetWidth;
		slider.style.left = 100.0 * splitPosition + '%';
		viewer.scene.imagerySplitPosition = splitPosition;
	}

	handler.setInputAction(function() {
		moveActive = true;
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
	handler.setInputAction(function() {
		moveActive = true;
	}, Cesium.ScreenSpaceEventType.PINCH_START);

	handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

	handler.setInputAction(function() {
		moveActive = false;
	}, Cesium.ScreenSpaceEventType.LEFT_UP);
	handler.setInputAction(function() {
		moveActive = false;
	}, Cesium.ScreenSpaceEventType.PINCH_END);

	return {
		handler: handler,
		slider: slider,
		layerLeft: layerLeft,
	};
}

export function removeLayerSplit(options) {
	if (typeof options != 'object') {
		throw 'removeLayerSplit的参数必须是Object类型';
	}
	if (
		options.handler == undefined ||
		options.slider == undefined ||
		options.layerLeft == undefined
	) {
		throw 'removeLayerSplit的参数错误';
	}

    viewer.scene.imagerySplitPosition = 0;
    options.layerLeft.splitDirection = 0;
	let slider = options.slider;
	slider.parentNode.removeChild(slider);

	let handler = options.handler;
	handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
	handler.removeInputAction(Cesium.ScreenSpaceEventType.PINCH_START);
	handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	handler.removeInputAction(Cesium.ScreenSpaceEventType.PINCH_MOVE);
	handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
	handler.removeInputAction(Cesium.ScreenSpaceEventType.PINCH_END);
}

function createSliderDiv() {
	let div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.top = '0px';
	div.style.zIndex = '999';
	div.style.left = '50%';
	div.style.height = '100%';
	div.style.width = '3px';
	div.style.background = '#fff';
	div.onmouseover = function() {
		div.style.cursor = 'ew-resize';
	};
	let parent = document.getElementsByClassName('cesium-viewer')[0]
		.parentElement;
	parent.appendChild(div);
	return div;
}
