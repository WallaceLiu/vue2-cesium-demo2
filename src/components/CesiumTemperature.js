import axios from 'axios';

function CesiumTemperatureLayer(dataURL, colors) {
	if (!colors) {
		this.colors = {
			'-100--32': 'rgb(112,2,121)',
			'-32--28': 'rgb(121,4,126)',
			'-28--24': 'rgb(77,0,122)',
			'-24--20': 'rgb(1,36,117)',
			'-20--16': 'rgb(0,78,172)',
			'-16--12': 'rgb(60,114,207)',
			'-12--8': 'rgb(0,172,227)',
			'-8--4': 'rgb(118,220,250)',
			'-4-0': 'rgb(172,235,251)',
			'0-4': 'rgb(254,254,200)',
			'4-8': 'rgb(213,255,170)',
			'8-12': 'rgb(167,255,97)',
			'12-16': 'rgb(255,254,6)',
			'16-20': 'rgb(251,195,74)',
			'20-24': 'rgb(251,126,58)',
			'24-28': 'rgb(246,25,96)',
			'28-32': 'rgb(245,5,1)',
			'32-100': 'rgb(183,0,0)',
		};
	} else {
		this.colors = colors;
	}

	this.tmpLayer = null;

	// 请求数据，初始化参数
	axios.get(dataURL).then((res) => {
		this.data = res.data;
		this._init();
	});
}

CesiumTemperatureLayer.prototype._init = function() {
	var img = this.geoJson2canvas(this.data, this.colors);
	var rectangle = Cesium.Rectangle.fromDegrees(-180, -90, 180, 90);
	viewer.imageryLayers.remove(this.tmpLayer);
	this.tmpLayer = viewer.imageryLayers.addImageryProvider(
		new Cesium.SingleTileImageryProvider({
			url: img.toDataURL('image/png'),
			rectangle: rectangle,
		})
	);
	this.tmpLayer.alpha = 0.3;
};

CesiumTemperatureLayer.prototype.geoJson2canvas = function(bands, color) {
	var canvas = document.createElement('canvas');
	var height = 4000;
	var width = 2000;
	canvas.height = height;
	canvas.width = width;

	var ctx = canvas.getContext('2d');
	var features = bands.features;
	ctx.strokeStyle = 'rgba(255,255,255,0.01)'; //填充边框颜色

	for (var i = 0; i < features.length; i++) {
		ctx.fillStyle = color[features[i].properties.temperature];
		var coordinates = features[i].geometry.coordinates;
		for (var j = 0; j < coordinates.length; j++) {
			for (var k = 0; k < coordinates[j].length; k++) {
				var poly = coordinates[j][k];
				ctx.beginPath();
				ctx.moveTo(
					((poly[0][0] + 180) / 360) * width,
					((-poly[0][1] + 90) / 180) * height
				);
				for (var n = 1; n < poly.length; n++) {
					ctx.lineTo(
						((poly[n][0] + 180) / 360) * width,
						((-poly[n][1] + 90) / 180) * height
					);
				}
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	}
	return canvas;
};

CesiumTemperatureLayer.prototype.remove = function() {
	// 移除图层
	viewer.imageryLayers.remove(this.tmpLayer);
};

export default CesiumTemperatureLayer;
