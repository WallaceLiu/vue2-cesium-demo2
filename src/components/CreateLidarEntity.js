export function lidarPlaneScan(lon, lat, radius) {
    var angle = 0;
    var rate = 2;

    function rotationChange() {
        angle = angle + rate;
        if (angle >= 360) {
            angle = 0;
        }
        return Cesium.Math.toRadians(angle);
    }
    var e1 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        ellipse: {
            semiMinorAxis: radius,
            semiMajorAxis: radius,
            height: 10,
            stRotation: new Cesium.CallbackProperty(rotationChange, false),
            material: new Cesium.ImageMaterialProperty({
                image: "/img/lidar-circle.png",
                repeat: new Cesium.Cartesian2(1.0, 1),
                transparent: true
            })
        }
    });

    return [e1];
}

export function lidarHemisphereScan(lon, lat, radius) {
    var e1 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius),
            maximumCone: Cesium.Math.toRadians(90),
            material: Cesium.Color.AQUAMARINE.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.AQUAMARINE.withAlpha(0.5),
            outlineWidth: 1
        }
    });

    var angle = 0;
    var rate = 1;

    function clockChange1() {
        angle = angle + rate;
        if (angle >= 359) {
            angle = 0;
        }
        return Cesium.Math.toRadians(angle);
    }

    function clockChange2() {
        return Cesium.Math.toRadians(angle + 1);
    }

    var e2 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius),
            innerRadii: new Cesium.Cartesian3(0.1, 0.1, 0.1),
            minimumClock: new Cesium.CallbackProperty(clockChange1, false),
            maximumClock: new Cesium.CallbackProperty(clockChange2, false),
            maximumCone: Cesium.Math.toRadians(90.0),
            material: Cesium.Color.AQUAMARINE.withAlpha(0.3)
        }
    });

    return [e1, e2];
}

export function lidarPyramidScan(lon, lat, radius, theta) {
    var e1 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, 20000.0),
            new Cesium.HeadingPitchRoll(0, Cesium.Math.PI / 2, 0.0)
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius),
            innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
            minimumClock: Cesium.Math.toRadians(-theta),
            maximumClock: Cesium.Math.toRadians(theta),
            minimumCone: Cesium.Math.toRadians(90 - theta),
            maximumCone: Cesium.Math.toRadians(90 + theta),
            material: Cesium.Color.DARKCYAN.withAlpha(0.3),
            outline: true,
            stackPartitions: 16,
            slicePartitions: 16,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.3)
        }
    });

    var angle = 90 - theta;
    var rate = 0.2;

    function angleChange1() {
        angle = angle + rate;
        if (angle >= 90 + theta - rate) {
            angle = 90 - theta;
        }
        return Cesium.Math.toRadians(angle);
    }

    function angleChange2() {
        return Cesium.Math.toRadians(angle + 0.01);
    }

    var e2 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, 20000.0),
            new Cesium.HeadingPitchRoll(0, Cesium.Math.PI / 2, 0.0)
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius),
            innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
            minimumClock: Cesium.Math.toRadians(-theta),
            maximumClock: Cesium.Math.toRadians(theta),
            minimumCone: new Cesium.CallbackProperty(angleChange1, false),
            maximumCone: new Cesium.CallbackProperty(angleChange2, false),
            material: Cesium.Color.GREEN.withAlpha(0.3),
            outline: false,
            stackPartitions: 16,
            slicePartitions: 16
        }
    });
    return [e1, e2];
}
