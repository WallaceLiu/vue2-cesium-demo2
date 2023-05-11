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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./GeometryOffsetAttribute-c9accdb9"],function(c,o,e,d,y,t,a,p,b,C,l){"use strict";var h=new d.Cartesian3;function u(e){var t=(e=c.defaultValue(e,c.defaultValue.EMPTY_OBJECT)).minimum,a=e.maximum;if(o.Check.typeOf.object("min",t),o.Check.typeOf.object("max",a),c.defined(e.offsetAttribute)&&e.offsetAttribute===l.GeometryOffsetAttribute.TOP)throw new o.DeveloperError("GeometryOffsetAttribute.TOP is not a supported options.offsetAttribute for this geometry.");this._min=d.Cartesian3.clone(t),this._max=d.Cartesian3.clone(a),this._offsetAttribute=e.offsetAttribute,this._workerName="createBoxOutlineGeometry"}u.fromDimensions=function(e){var t=(e=c.defaultValue(e,c.defaultValue.EMPTY_OBJECT)).dimensions;o.Check.typeOf.object("dimensions",t),o.Check.typeOf.number.greaterThanOrEquals("dimensions.x",t.x,0),o.Check.typeOf.number.greaterThanOrEquals("dimensions.y",t.y,0),o.Check.typeOf.number.greaterThanOrEquals("dimensions.z",t.z,0);var a=d.Cartesian3.multiplyByScalar(t,.5,new d.Cartesian3);return new u({minimum:d.Cartesian3.negate(a,new d.Cartesian3),maximum:a,offsetAttribute:e.offsetAttribute})},u.fromAxisAlignedBoundingBox=function(e){return o.Check.typeOf.object("boundindBox",e),new u({minimum:e.minimum,maximum:e.maximum})},u.packedLength=2*d.Cartesian3.packedLength+1,u.pack=function(e,t,a){return o.Check.typeOf.object("value",e),o.Check.defined("array",t),a=c.defaultValue(a,0),d.Cartesian3.pack(e._min,t,a),d.Cartesian3.pack(e._max,t,a+d.Cartesian3.packedLength),t[a+2*d.Cartesian3.packedLength]=c.defaultValue(e._offsetAttribute,-1),t};var s=new d.Cartesian3,f=new d.Cartesian3,m={minimum:s,maximum:f,offsetAttribute:void 0};return u.unpack=function(e,t,a){o.Check.defined("array",e),t=c.defaultValue(t,0);var n=d.Cartesian3.unpack(e,t,s),r=d.Cartesian3.unpack(e,t+d.Cartesian3.packedLength,f),i=e[t+2*d.Cartesian3.packedLength];return c.defined(a)?(a._min=d.Cartesian3.clone(n,a._min),a._max=d.Cartesian3.clone(r,a._max),a._offsetAttribute=-1===i?void 0:i,a):(m.offsetAttribute=-1===i?void 0:i,new u(m))},u.createGeometry=function(e){var t=e._min,a=e._max;if(!d.Cartesian3.equals(t,a)){var n=new C.GeometryAttributes,r=new Uint16Array(24),i=new Float64Array(24);i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=a.x,i[4]=t.y,i[5]=t.z,i[6]=a.x,i[7]=a.y,i[8]=t.z,i[9]=t.x,i[10]=a.y,i[11]=t.z,i[12]=t.x,i[13]=t.y,i[14]=a.z,i[15]=a.x,i[16]=t.y,i[17]=a.z,i[18]=a.x,i[19]=a.y,i[20]=a.z,i[21]=t.x,i[22]=a.y,i[23]=a.z,n.position=new b.GeometryAttribute({componentDatatype:p.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:i}),r[0]=4,r[1]=5,r[2]=5,r[3]=6,r[4]=6,r[5]=7,r[6]=7,r[7]=4,r[8]=0,r[9]=1,r[10]=1,r[11]=2,r[12]=2,r[13]=3,r[14]=3,r[15]=0,r[16]=0,r[17]=4,r[18]=1,r[19]=5,r[20]=2,r[21]=6,r[22]=3,r[23]=7;var o=d.Cartesian3.subtract(a,t,h),u=.5*d.Cartesian3.magnitude(o);if(c.defined(e._offsetAttribute)){var s=i.length,f=new Uint8Array(s/3),m=e._offsetAttribute===l.GeometryOffsetAttribute.NONE?0:1;l.arrayFill(f,m),n.applyOffset=new b.GeometryAttribute({componentDatatype:p.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:f})}return new b.Geometry({attributes:n,indices:r,primitiveType:b.PrimitiveType.LINES,boundingSphere:new y.BoundingSphere(d.Cartesian3.ZERO,u),offsetAttribute:e._offsetAttribute})}},function(e,t){return c.defined(t)&&(e=u.unpack(e,t)),u.createGeometry(e)}});
