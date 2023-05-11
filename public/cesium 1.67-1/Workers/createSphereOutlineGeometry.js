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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./IndexDatatype-4351ba4c","./GeometryOffsetAttribute-c9accdb9","./EllipsoidOutlineGeometry-ba860aab"],function(n,r,e,a,i,t,o,s,c,d,l,u,p){"use strict";function m(e){var i=n.defaultValue(e.radius,1),t={radii:new a.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new p.EllipsoidOutlineGeometry(t),this._workerName="createSphereOutlineGeometry"}m.packedLength=p.EllipsoidOutlineGeometry.packedLength,m.pack=function(e,i,t){return r.Check.typeOf.object("value",e),p.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new p.EllipsoidOutlineGeometry,G={radius:void 0,radii:new a.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return m.unpack=function(e,i,t){var r=p.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=r._stackPartitions,G.slicePartitions=r._slicePartitions,G.subdivisions=r._subdivisions,n.defined(t)?(a.Cartesian3.clone(r._radii,G.radii),t._ellipsoidGeometry=new p.EllipsoidOutlineGeometry(G),t):(G.radius=r._radii.x,new m(G))},m.createGeometry=function(e){return p.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=m.unpack(e,i)),m.createGeometry(e)}});
