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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./Plane-37b84dad","./VertexFormat-7f136973","./FrustumGeometry-e26d33c0"],function(s,p,e,m,h,t,r,d,k,g,n,a,y){"use strict";var f=0,o=1;function _(e){p.Check.typeOf.object("options",e),p.Check.typeOf.object("options.frustum",e.frustum),p.Check.typeOf.object("options.origin",e.origin),p.Check.typeOf.object("options.orientation",e.orientation);var t,r,n=e.frustum,a=e.orientation,i=e.origin,u=s.defaultValue(e._drawNearPlane,!0);n instanceof y.PerspectiveFrustum?(t=f,r=y.PerspectiveFrustum.packedLength):n instanceof y.OrthographicFrustum&&(t=o,r=y.OrthographicFrustum.packedLength),this._frustumType=t,this._frustum=n.clone(),this._origin=m.Cartesian3.clone(i),this._orientation=h.Quaternion.clone(a),this._drawNearPlane=u,this._workerName="createFrustumOutlineGeometry",this.packedLength=2+r+m.Cartesian3.packedLength+h.Quaternion.packedLength}_.pack=function(e,t,r){p.Check.typeOf.object("value",e),p.Check.defined("array",t),r=s.defaultValue(r,0);var n=e._frustumType,a=e._frustum;return(t[r++]=n)===f?(y.PerspectiveFrustum.pack(a,t,r),r+=y.PerspectiveFrustum.packedLength):(y.OrthographicFrustum.pack(a,t,r),r+=y.OrthographicFrustum.packedLength),m.Cartesian3.pack(e._origin,t,r),r+=m.Cartesian3.packedLength,h.Quaternion.pack(e._orientation,t,r),t[r+=h.Quaternion.packedLength]=e._drawNearPlane?1:0,t};var l=new y.PerspectiveFrustum,v=new y.OrthographicFrustum,C=new h.Quaternion,F=new m.Cartesian3;return _.unpack=function(e,t,r){p.Check.defined("array",e),t=s.defaultValue(t,0);var n,a=e[t++];a===f?(n=y.PerspectiveFrustum.unpack(e,t,l),t+=y.PerspectiveFrustum.packedLength):(n=y.OrthographicFrustum.unpack(e,t,v),t+=y.OrthographicFrustum.packedLength);var i=m.Cartesian3.unpack(e,t,F);t+=m.Cartesian3.packedLength;var u=h.Quaternion.unpack(e,t,C),o=1===e[t+=h.Quaternion.packedLength];if(!s.defined(r))return new _({frustum:n,origin:i,orientation:u,_drawNearPlane:o});var c=a===r._frustumType?r._frustum:void 0;return r._frustum=n.clone(c),r._frustumType=a,r._origin=m.Cartesian3.clone(i,r._origin),r._orientation=h.Quaternion.clone(u,r._orientation),r._drawNearPlane=o,r},_.createGeometry=function(e){var t=e._frustumType,r=e._frustum,n=e._origin,a=e._orientation,i=e._drawNearPlane,u=new Float64Array(24);y.FrustumGeometry._computeNearFarPlanes(n,a,t,r,u);for(var o,c,s=new g.GeometryAttributes({position:new k.GeometryAttribute({componentDatatype:d.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u})}),p=i?2:1,m=new Uint16Array(8*(1+p)),f=i?0:1;f<2;++f)c=4*f,m[o=i?8*f:0]=c,m[o+1]=c+1,m[o+2]=c+1,m[o+3]=c+2,m[o+4]=c+2,m[o+5]=c+3,m[o+6]=c+3,m[o+7]=c;for(f=0;f<2;++f)c=4*f,m[o=8*(p+f)]=c,m[o+1]=c+4,m[o+2]=c+1,m[o+3]=c+5,m[o+4]=c+2,m[o+5]=c+6,m[o+6]=c+3,m[o+7]=c+7;return new k.Geometry({attributes:s,indices:m,primitiveType:k.PrimitiveType.LINES,boundingSphere:h.BoundingSphere.fromVertices(u)})},function(e,t){return s.defined(t)&&(e=_.unpack(e,t)),_.createGeometry(e)}});
