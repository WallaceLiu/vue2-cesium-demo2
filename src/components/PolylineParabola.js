/**
 * 返回两点间的抛物线数组
 *
 * @param {*} options
 * {
 *    pt1:{x,y},  起点
 *    pt2:{x,y},  终点
 *    num:100,    点数
 *    height:1000000  高度
 * }
 * @return [lon,lat,height,lon,lat,height ……]
 *  导入示例：
 *    import {parabolaEquation} from "./PolylineParabola.js";
 *  调用示例：
 *    viewer.entities.add({
 *      polyline: {
 *         positions: Cesium.Cartesian3.fromDegreesArrayHeights(parabolaEquation({
 *            pt1:{x:120,y:30},
 *            pt2:{x:110,y:20},
 *            num:100,
 *            height:1000000
 *         })),
 *         material: new Cesium.Color(0.5, 0.5, 0, 1),
 *       },
 *     });
 */

export function parabolaEquation(options) {
	//方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
	var h = options.height;
	var L =
		Math.abs(options.pt1.x - options.pt2.x) >
		Math.abs(options.pt1.y - options.pt2.y)
			? Math.abs(options.pt1.x - options.pt2.x)
			: Math.abs(options.pt1.y - options.pt2.y);
	var num = options.num && options.num > 100 ? options.num : 100;
	var result = [];
	var dlt = L / num;
	if (
		Math.abs(options.pt1.x - options.pt2.x) >
		Math.abs(options.pt1.y - options.pt2.y)
	) {
		//以x为基准
		var dely = (options.pt2.y - options.pt1.y) / num;
		if (options.pt1.x - options.pt2.x > 0) {
			dlt = -dlt;
		}
		for (var i = 0; i < num; i++) {
			var tempH =
				h -
				(Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * h) /
					Math.pow(L, 2);
			var x = options.pt1.x + dlt * i;
			var y = options.pt1.y + dely * i;
			result.push(x, y, tempH);
		}
	} else {
		//以y为基准
		var delx = (options.pt2.x - options.pt1.x) / num;
		if (options.pt1.y - options.pt2.y > 0) {
			dlt = -dlt;
		}
		for (var i = 0; i < num; i++) {
			var tempH =
				h -
				(Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * h) /
					Math.pow(L, 2);
			var x = options.pt1.x + delx * i;
			var y = options.pt1.y + dlt * i;
			result.push(x, y, tempH);
		}
	}
	return result;
}
