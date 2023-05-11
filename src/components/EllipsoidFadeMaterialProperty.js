var defaultColor = Cesium.Color.WHITE;
var defaultDuration = 1000;

/**
 * 动态扩散的圆
 * 
 * @param {*} options
 * {
 *     color: Cesium.Color.WHITE,  颜色
 *     duration:1.0,               扩散速度
 * }
 * 导入示例：
 * import './EllipsoidFadeMaterialProperty.js';
 * 调用示例：
 *     viewer.entities.add({
 *        name: 'EllipsoidFade',
 *        position: Cesium.Cartesian3.fromDegrees(104.0, 30.0, 100.0),
 *        ellipse: {
 *          height: 0,
 *          semiMinorAxis: 30000.0,
 *          semiMajorAxis: 30000.0,
 *          material: new Cesium.EllipsoidFadeMaterialProperty({
 *            color: Cesium.Color.RED,
 *            duration: 1000,
 *          }),
 *        },
 *      });
 */

function EllipsoidFadeMaterialProperty(options) {
	options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

	this._definitionChanged = new Cesium.Event();
	this._color = undefined;
	this._duration = undefined;

	this.color = options.color;
	this.duration = options.duration;

	this._time = new Date().getTime();
}
Object.defineProperties(EllipsoidFadeMaterialProperty.prototype, {
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
	duration: Cesium.createPropertyDescriptor('duration'),
});

EllipsoidFadeMaterialProperty.prototype.getType = function(time) {
	return 'EllipsoidFade';
};
EllipsoidFadeMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = Cesium.Property.getValueOrClonedDefault(
		this._color,
		time,
		Cesium.Color.WHITE,
		result.color
	);

	result.duration = Cesium.Property.getValueOrDefault(
		this._duration,
		time,
		defaultDuration
	);

	result.time =
		((new Date().getTime() - this._time) % this._duration) / this._duration;

	return result;
};
EllipsoidFadeMaterialProperty.prototype.equals = function(other) {
	return (
		this === other ||
		(other instanceof EllipsoidFadeMaterialProperty &&
			Cesium.Property.equals(this._color, other._color) &&
			Cesium.Property.equals(this._duration, other._duration))
	);
};
Cesium.EllipsoidFadeMaterialProperty = EllipsoidFadeMaterialProperty;
Cesium.Material.EllipsoidFadeType = 'EllipsoidFade';
Cesium.Material.EllipsoidFadeSource = `czm_material czm_getMaterial(czm_materialInput materialInput){
        czm_material material = czm_getDefaultMaterial(materialInput);
        material.diffuse = color.rgb;
        vec2 st = materialInput.st;
        float dis = distance(st, vec2(0.5, 0.5));
        float per = fract(time);
        if(dis > per * 0.5){
            material.alpha = 0.0;               
            discard;
        } else {
            material.alpha = color.a  * dis / per / 1.0;
        }
        return material;
    }`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidFadeType, {
	fabric: {
		type: Cesium.Material.EllipsoidFadeType,
		uniforms: {
			color: new Cesium.Color(1.0, 0.0, 0.0, 1),
			time: 0,
		},
		source: Cesium.Material.EllipsoidFadeSource,
	},
	translucent: function(material) {
		return true;
	},
});
