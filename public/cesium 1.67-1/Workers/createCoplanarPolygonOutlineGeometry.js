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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./AttributeCompression-6cfb9427","./GeometryPipeline-9b42374e","./EncodedCartesian3-5ad054af","./IndexDatatype-4351ba4c","./IntersectionTests-3d9e1b94","./Plane-37b84dad","./GeometryInstance-fadc2629","./arrayRemoveDuplicates-69403a22","./EllipsoidTangentPlane-323c7a98","./OrientedBoundingBox-764de7b5","./CoplanarPolygonGeometryLibrary-5c0e2fd3","./ArcType-66bc286a","./EllipsoidRhumbLine-4d1a57d2","./PolygonPipeline-5b0d203a","./PolygonGeometryLibrary-34f7d7a7"],function(a,i,e,l,p,t,r,s,d,u,n,m,o,f,y,c,g,h,b,P,v,G,C,k,L){"use strict";function T(e){for(var t=e.length,r=new Float64Array(3*t),n=f.IndexDatatype.createTypedArray(t,2*t),o=0,a=0,i=0;i<t;i++){var y=e[i];r[o++]=y.x,r[o++]=y.y,r[o++]=y.z,n[a++]=i,n[a++]=(i+1)%t}var c=new u.GeometryAttributes({position:new d.GeometryAttribute({componentDatatype:s.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:r})});return new d.Geometry({attributes:c,indices:n,primitiveType:d.PrimitiveType.LINES})}function E(e){var t=(e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT)).polygonHierarchy;i.Check.defined("options.polygonHierarchy",t),this._polygonHierarchy=t,this._workerName="createCoplanarPolygonOutlineGeometry",this.packedLength=L.PolygonGeometryLibrary.computeHierarchyPackedLength(t)+1}E.fromPositions=function(e){return e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT),i.Check.defined("options.positions",e.positions),new E({polygonHierarchy:{positions:e.positions}})},E.pack=function(e,t,r){return i.Check.typeOf.object("value",e),i.Check.defined("array",t),r=a.defaultValue(r,0),t[r=L.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,r)]=e.packedLength,t};var H={polygonHierarchy:{}};return E.unpack=function(e,t,r){i.Check.defined("array",e),t=a.defaultValue(t,0);var n=L.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t);t=n.startingIndex,delete n.startingIndex;var o=e[t];return a.defined(r)||(r=new E(H)),r._polygonHierarchy=n,r.packedLength=o,r},E.createGeometry=function(e){var t=e._polygonHierarchy,r=t.positions;if(!((r=h.arrayRemoveDuplicates(r,l.Cartesian3.equalsEpsilon,!0)).length<3)&&v.CoplanarPolygonGeometryLibrary.validOutline(r)){var n=L.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(t,!1);if(0!==n.length){for(var o=[],a=0;a<n.length;a++){var i=new g.GeometryInstance({geometry:T(n[a])});o.push(i)}var y=m.GeometryPipeline.combineInstances(o)[0],c=p.BoundingSphere.fromPoints(t.positions);return new d.Geometry({attributes:y.attributes,indices:y.indices,primitiveType:y.primitiveType,boundingSphere:c})}}},function(e,t){return a.defined(t)&&(e=E.unpack(e,t)),e._ellipsoid=l.Ellipsoid.clone(e._ellipsoid),E.createGeometry(e)}});
