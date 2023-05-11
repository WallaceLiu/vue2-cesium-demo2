import Bus from '@/utils/Bus.js';
import URL from '@/utils/Url.config.js';

var xglobeTmsLayer = [];

function cesiumTMSHandle(res) {
  if (res.show) {
    var image = viewer.imageryLayers.addImageryProvider(
      new Cesium.TileMapServiceImageryProvider({
        url: res.url,
      }),
    );
    xglobeTmsLayer[res.name] = image;
    // 连接数据库
    var xhr = new XMLHttpRequest();
    xhr.open('get', URL.xglobe.dataList, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4 || xhr.status != 200) {
        return;
      }
      var dataList = JSON.parse(xhr.responseText);
      for (var index in dataList) {
        var dataCollection = dataList[index];
        for (var index1 in dataCollection.dataCollection) {
          var fileInfo = dataCollection.dataCollection[index1];
          var name = dataCollection.dataName;
          if (name != res.name) {
            continue;
          }
          var east = fileInfo.east;
          var north = fileInfo.north;
          var west = fileInfo.west;
          var south = fileInfo.south;
          var centerX = (east + west) / 2;
          var centerY = (south + north) / 2;
          // var height = (east - west) * 255964 + 269747;
          var height = (east - west) * 274563 + 286753;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              centerX,
              centerY,
              height,
            ),
          });
        }
      }
    };
  } else {
    viewer.imageryLayers.remove(xglobeTmsLayer[res.name]);
  }
}

export default {
  cesiumTMSHandle,
};
