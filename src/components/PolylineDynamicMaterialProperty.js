var defaultColor = Cesium.Color.WHITE;
var defaultSpeed = 1.0;
var defaultStartTime = 0;

/**
 * 动态线的样式
 * 
 * @param {*} options
 * {
 *     color: Cesium.Color.WHITE,  颜色
 *     speed:1.0,                  速度，速度越快则动的越快
 *     startTime:Math.ramdom()     起始时间，起始时间不同则从不同的位置开始动态变化
 * }
 * 导入示例：
 * import './PolylineDynamicMaterialProperty.js'
 * 调用示例：
 *    viewer.entities.add({
 *      polyline: {
 *         positions: points,
 *         material: new Cesium.PolylineDynamicMaterialProperty({
 *           color: new Cesium.Color(0.5, 0.5, 0, 1),
 *           speed: 2,
 *           startTime: Math.random(),
 *         }),
 *       },
 *     });
 */

function PolylineDynamicMaterialProperty(options) {
	options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

	this._definitionChanged = new Cesium.Event();
	this._color = undefined;
	this._speed = undefined;
	this._startTime = undefined;

	this.color = options.color;
	this.speed = options.speed;
	this.startTime = options.startTime;
}

Object.defineProperties(PolylineDynamicMaterialProperty.prototype, {
	isConstant: {
		get: function() {
			return false;
		},
	},
	definitionChanged: {
		get: function() {
			return this._definitionChanged;
		},
	},
	color: Cesium.createPropertyDescriptor('color'),
	speed: Cesium.createPropertyDescriptor('speed'),
	startTime: Cesium.createPropertyDescriptor('startTime'),
});
PolylineDynamicMaterialProperty.prototype.getType = function(time) {
	return 'PolylineDynamic';
};
PolylineDynamicMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = Cesium.Property.getValueOrClonedDefault(
		this._color,
		time,
		defaultColor,
		result.color
	);
	result.speed = Cesium.Property.getValueOrDefault(
		this._speed,
		time,
		defaultSpeed
	);
	result.startTime = Cesium.Property.getValueOrDefault(
		this._startTime,
		time,
		defaultStartTime
	);
	return result;
};
PolylineDynamicMaterialProperty.prototype.equals = function(other) {
	return (
		this === other ||
		(other instanceof PolylineDynamicMaterialProperty &&
			Cesium.Property.equals(this._color, other._color) &&
            Cesium.Property.equals(this._speed, other._speed) &&
            Cesium.Property.equals(this._startTime, other._startTime) )
	);
};
Cesium.PolylineDynamicMaterialProperty = PolylineDynamicMaterialProperty;
Cesium.Material.PolylineDynamicType = 'PolylineDynamic';
Cesium.Material.PolylineDynamicSource = `uniform vec4 color;
uniform float speed;
uniform float startTime;

czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float t = fract(startTime + czm_frameNumber * speed / 1000.0);
    t *= 1.05;
    float alpha = smoothstep(t- 0.05, t, st.s) * step(-t, -st.s);
    alpha += 0.2;
    material.diffuse = mix(color.rgb, vec3(1.0,1.0,1.0), startTime);
    material.alpha = alpha;
    return material;
}`;
Cesium.Material._materialCache.addMaterial(
	Cesium.Material.PolylineDynamicType,
	{
		fabric: {
			type: Cesium.Material.PolylineDynamicType,
			uniforms: {
				color: new Cesium.Color(0.2, 0.2, 0.6, 1),
				speed: 2 + 1 * Math.random(),
				startTime: Math.random(),
			},
			source: Cesium.Material.PolylineDynamicSource,
		},
		translucent: function(material) {
			return true;
		},
	}
);
