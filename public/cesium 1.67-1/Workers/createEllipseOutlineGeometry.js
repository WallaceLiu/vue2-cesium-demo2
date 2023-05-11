/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./IndexDatatype-4351ba4c","./GeometryOffsetAttribute-c9accdb9","./EllipseGeometryLibrary-62835faa","./EllipseOutlineGeometry-f4812f30"],function(r,e,t,n,i,a,c,o,l,s,f,d,u,b){"use strict";return function(e,t){return r.defined(t)&&(e=b.EllipseOutlineGeometry.unpack(e,t)),e._center=n.Cartesian3.clone(e._center),e._ellipsoid=n.Ellipsoid.clone(e._ellipsoid),b.EllipseOutlineGeometry.createGeometry(e)}});