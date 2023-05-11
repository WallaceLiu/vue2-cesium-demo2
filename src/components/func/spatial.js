import Bus from '@/utils/Bus';

// 测量距离的 左击、悬浮、右击 的三个函数
function getDistanceLeftClick(_this, pos) {
  spatialDrawPoint(_this, pos);
  _this.toolBarStore.points.push(pos);
  if (_this.toolBarStore.points.length >= 2) {
    spatialDrawPolyline(_this, 1);
    var n = _this.toolBarStore.points.length;
    var cx =
      (_this.toolBarStore.points[n - 1].x +
        _this.toolBarStore.points[n - 2].x) /
      2;
    var cy =
      (_this.toolBarStore.points[n - 1].y +
        _this.toolBarStore.points[n - 2].y) /
      2;
    var dis = getDistance(
      _this.toolBarStore.points[n - 1],
      _this.toolBarStore.points[n - 2],
    );
    _this.toolBarStore.disLength += dis;
    spatialDrawLabel(
      _this,
      {
        x: cx,
        y: cy,
        z: 0,
      },
      dis.toFixed(2) + 'km',
      1,
    );
  }
}

function getDistanceMouseMove(_this, pos) {
  if (_this.toolBarStore.points.length == 0) {
    _this.toolBarStore.tooltip = '鼠标左键点击添加测距起始点';
  }
  if (_this.toolBarStore.points.length >= 1) {
    _this.toolBarStore.tpoints = pos;
    spatialDrawTransitionPolyline(_this);
    _this.toolBarStore.tooltip =
      '鼠标左键继续点击添加测距点<br>右键结束并计算总距离';
  }
}

function getDistanceRightClick(_this) {
  var n = _this.toolBarStore.points.length;
  spatialDrawLabel(
    _this,
    _this.toolBarStore.points[n - 1],
    '总长：' + _this.toolBarStore.disLength.toFixed(2) + 'km',
    2,
  );
  for (var i = 0; i < _this.toolBarStore.transition.length; i++) {
    viewer.entities.remove(_this.toolBarStore.transition[i]);
  }
  _this.toolBarStore.tpoints = {};
  _this.toolBarStore.points = [];
  _this.toolBarStore.disLength = 0;
}

// 测量面积的 左击、悬浮、右击 的三个函数
function getAreaLeftClick(_this, pos) {
  spatialDrawPoint(_this, pos);
  _this.toolBarStore.points.push(pos);
  if (_this.toolBarStore.points.length == 2) {
    spatialDrawPolyline(_this, 2);
  }
  if (_this.toolBarStore.points.length >= 3) {
    spatialDrawPolygon(_this, 0);
  }
}

function getAreaMouseMove(_this, pos) {
  if (_this.toolBarStore.points.length < 3) {
    _this.toolBarStore.tooltip = '鼠标左键点击添加多边形各顶点';
  } else {
    _this.toolBarStore.tooltip =
      '鼠标左键点击添加多边形各顶点 <br> 右键结束多边形绘制并获取面积';
  }
  if (_this.toolBarStore.points.length == 1) {
    _this.toolBarStore.tpoints = pos;
    spatialDrawTransitionPolyline(_this);
  }
}

function getAreaRightClick(_this) {
  var n = _this.toolBarStore.points.length;
  if (n < 3) {
    _this.toolBarStore.tooltip =
      '被测量面积的多边形至少有3个点 <br> 请继续添加多边形顶点';
    return;
  }
  spatialDrawPolygon(_this, 1);
  var res = getArea(_this.toolBarStore.points);
  spatialDrawLabel(
    _this,
    _this.toolBarStore.points[n - 1],
    res.toFixed(2) + 'km²',
    2,
  );
  _this.toolBarStore.points = [];
}

// 测量方位角的 左击、悬浮、右击 的三个函数
function getAngleLeftClick(_this, pos) {
  _this.toolBarStore.points.push(pos);
  if (_this.toolBarStore.points.length == 1) {
    spatialDrawPoint(_this, pos);
  }
  if (_this.toolBarStore.points.length == 2) {
    spatialDrawPolyline(_this, 3);
    var angle = getAngel(
      _this.toolBarStore.points[0],
      _this.toolBarStore.points[1],
    );
    spatialDrawLabel(
      _this,
      _this.toolBarStore.points[1],
      angle.toFixed(2) + '°',
      2,
    );
    _this.toolBarStore.points = [];
    _this.toolBarStore.tpoints = {};
  }
}

function getAngleMouseMove(_this, pos) {
  if (_this.toolBarStore.points.length == 0) {
    _this.toolBarStore.tooltip = '鼠标左键点击添加方位角起始点';
  } else {
    _this.toolBarStore.tooltip =
      '鼠标左键点击继续添加方位角终止点<br>并得到终止点相对于起始点的方位角';
  }
  if (_this.toolBarStore.points.length == 1) {
    _this.toolBarStore.tpoints = pos;
    spatialDrawTransitionPolyline(_this);
  }
}

// 绘制点
function spatialDrawPoint(_this, pos, billboard) {
  if (billboard != undefined && billboard != null) {
    var point = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(pos.x, pos.y, pos.z),
      billboard: billboard,
    });
  } else {
    var point = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(pos.x, pos.y, pos.z),
      point: {
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }
  _this.toolBarStore.entities.push(point);
  return point;
}

// 绘制线，当flag为2时绘制的是细线，当flag为3绘制的是箭头线
function spatialDrawPolyline(_this, flag) {
  var n = _this.toolBarStore.points.length;
  var array = [
    _this.toolBarStore.points[n - 2].x,
    _this.toolBarStore.points[n - 2].y,
    _this.toolBarStore.points[n - 1].x,
    _this.toolBarStore.points[n - 1].y,
  ];
  var width = 3;
  var opacity = 1;
  if (flag == 2) {
    width = 2;
    opacity = 0.2;
  }
  var material = Cesium.Color.YELLOW.withAlpha(opacity);
  if (flag == 3) {
    width = 8;
    material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW);
  }
  var line = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(array),
      width: width,
      clampToGround: true,
      material: material,
    },
  });
  _this.toolBarStore.entities.push(line);
}

// 绘制中间过程的线
function spatialDrawTransitionPolyline(_this) {
  var n = _this.toolBarStore.points.length;
  var array = [
    _this.toolBarStore.points[n - 1].x,
    _this.toolBarStore.points[n - 1].y,
    _this.toolBarStore.tpoints.x,
    _this.toolBarStore.tpoints.y,
  ];
  var entity = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(array),
      width: 3,
      clampToGround: true,
      material: Cesium.Color.YELLOW.withAlpha(0.3),
    },
  });
  if (_this.toolBarStore.transition.length != 0) {
    for (var i = 0; i < _this.toolBarStore.transition.length; i++) {
      viewer.entities.remove(_this.toolBarStore.transition[i]);
    }
  }
  _this.toolBarStore.transition.push(entity);
}

// 绘制面，flag为0则存储为中间状态的多边形，flag为1则存储为最后的多边形，flag2则为绘制交集或并集
function spatialDrawPolygon(_this, flag, url) {
  var n = _this.toolBarStore.points.length;
  var array = [];
  for (var i in _this.toolBarStore.points) {
    array.push(_this.toolBarStore.points[i].x);
    array.push(_this.toolBarStore.points[i].y);
  }
  var color = Cesium.Color.YELLOW.withAlpha(0.1);
  if (flag == 1) {
    color = Cesium.Color.YELLOW.withAlpha(0.4);
  } else if (flag == 2) {
    color = Cesium.Color.BLUE.withAlpha(0.4);
  } else if (flag == 3) {
    color = url;
  }
  var polygon = viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(array),
      material: color,
    },
  });
  for (var i = 0; i < _this.toolBarStore.transition.length; i++) {
    viewer.entities.remove(_this.toolBarStore.transition[i]);
  }
  if (flag == 0) {
    _this.toolBarStore.transition.push(polygon);
  } else {
    _this.toolBarStore.entities.push(polygon);
  }
  return polygon;
}

// 绘制label，flag为1，则是普通label，flag为2是重要的label，flag3为比较偏的label, flag4为一点点偏的label
function spatialDrawLabel(_this, pos, text, flag) {
  var font = '28px sans-serif';
  var backgroundColor = new Cesium.Color(0.165, 0.165, 0.165, 0.4);
  var pixelOffset = new Cesium.Cartesian2(0.0, 0.0);
  if (flag == 2) {
    backgroundColor = new Cesium.Color(0.165, 0.165, 0.165, 0.6);
    pixelOffset = new Cesium.Cartesian2(0.0, 18);
  } else if (flag == 3) {
    backgroundColor = new Cesium.Color(0.165, 0.165, 0.165, 0.6);
    pixelOffset = new Cesium.Cartesian2(0.0, -26);
  } else if (flag == 4) {
    backgroundColor = new Cesium.Color(0.165, 0.165, 0.165, 0.6);
    pixelOffset = new Cesium.Cartesian2(0.0, 8);
  }
  var label = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      pos.x,
      pos.y,
      pos.z > 9999 ? 9999 : pos.z,
    ),
    label: {
      text: text,
      fillColor: Cesium.Color.WHITE,
      font: font,
      scale: 0.5,
      showBackground: true,
      backgroundColor: backgroundColor,
      pixelOffset: pixelOffset,
    },
  });
  _this.toolBarStore.entities.push(label);
}

// 绘制箭头的三角形
function spatialDrawArrow(_this) {
  var x1 = _this.toolBarStore.points[0].x,
    y1 = _this.toolBarStore.points[0].y,
    x2 = _this.toolBarStore.points[1].x,
    y2 = _this.toolBarStore.points[1].y;
  var angle = Math.atan2(y2 - y1, x2 - x1);
  var billboard = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(x2, y2, 100),
    point: undefined,
    billboard: {
      image: '/static/symbol/tri.png',
      width: 20,
      height: 20,
      rotation: angle,
    },
  });
  _this.toolBarStore.entities.push(billboard);
}

// 绘制矩形，flag为1是中间状态的矩形，flag为2是结束的时候
function spatialDrawRectangle(_this, flag) {
  var n = _this.toolBarStore.transition.length;
  for (var i = 0; i < n; i++) {
    viewer.entities.remove(_this.toolBarStore.transition[i]);
  }
  var p1 = _this.toolBarStore.points[0];
  var p2 = _this.toolBarStore.tpoints;
  var west = Math.min(p1.x, p2.x);
  var east = Math.max(p1.x, p2.x);
  var north = Math.max(p1.y, p2.y);
  var south = Math.min(p1.y, p2.y);
  if (flag == 1) {
    var rect = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
        material: Cesium.Color.WHITE.withAlpha(0.1),
        outlineColor: Cesium.Color.BLUE,
        outline: true,
      },
    });
    _this.toolBarStore.transition.push(rect);
  }
  if (flag == 2) {
    return {
      west: west,
      east: east,
      south: south,
      north: north,
    };
  }
}

// 计算两个点之间的距离
function getDistance(p1, p2) {
  var point1cartographic = Cesium.Cartographic.fromDegrees(p1.x, p1.y, 0);
  var point2cartographic = Cesium.Cartographic.fromDegrees(p2.x, p2.y, 0);
  /** 根据经纬度计算出距离**/
  var geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1cartographic, point2cartographic);
  var s = geodesic.surfaceDistance;
  return s / 1000; // 单位Km
}

// 计算面积
function getArea(points) {
  // 首尾闭合
  var res = 0;
  // 拆分三角曲面

  for (var i = 0; i < points.length - 2; i++) {
    var j = (i + 1) % points.length;
    var k = (i + 2) % points.length;
    var totalAngle = Angle(points[i], points[j], points[k]);

    var dis_temp1 = getDistance(points[i], points[j]);
    var dis_temp2 = getDistance(points[j], points[k]);
    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
  }

  return res; // 单位 平方公里
}

function Angle(p1, p2, p3) {
  var bearing21 = Bearing(p2, p1);
  var bearing23 = Bearing(p2, p3);
  var angle = bearing21 - bearing23;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

function Bearing(from, to) {
  var radiansPerDegree = Math.PI / 180.0; // 角度转化为弧度(rad)
  var degreesPerRadian = 180.0 / Math.PI; // 弧度转化为角度

  var lat1 = from.y * radiansPerDegree;
  var lon1 = from.x * radiansPerDegree;
  var lat2 = to.y * radiansPerDegree;
  var lon2 = to.x * radiansPerDegree;
  var angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
  );
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  angle = angle * degreesPerRadian; // 角度
  return angle;
}

// 计算p1至p2方向的方位角
function getAngel(p1, p2) {
  var r90 = (90 * Math.PI) / 180;
  var p1x = (p1.x * Math.PI) / 180;
  var p1y = (p1.y * Math.PI) / 180;
  var p2x = (p2.x * Math.PI) / 180;
  var p2y = (p2.y * Math.PI) / 180;
  var cosc =
    Math.cos(r90 - p2y) * Math.cos(r90 - p1y) +
    Math.sin(r90 - p2y) * Math.sin(r90 - p1y) * Math.cos(p2x - p1x);
  var sinc = Math.sqrt(1 - cosc * cosc);
  var a =
    (Math.asin((Math.sin(r90 - p2y) * Math.sin(p2x - p1x)) / sinc) / Math.PI) *
    180;
  if (p2.x - p1.x > 0) {
    if (p2.y - p1.y > 0) return a;
    else return 180 - a;
  } else {
    if (p2.y - p1.y > 0) return 360 + a;
    else return 180 - a;
  }
}

function isEmptyObject(obj) {
  for (var n in obj) {
    return false;
  }
  return true;
}

export default {
  getDistanceLeftClick,
  getDistanceMouseMove,
  getDistanceRightClick,
  getAreaLeftClick,
  getAreaMouseMove,
  getAreaRightClick,
  getAngleLeftClick,
  getAngleMouseMove,
};
