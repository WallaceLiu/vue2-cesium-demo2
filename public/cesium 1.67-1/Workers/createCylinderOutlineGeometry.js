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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./IndexDatatype-4351ba4c","./GeometryOffsetAttribute-c9accdb9","./CylinderGeometryLibrary-c66635ce"],function(_,f,e,A,v,t,i,O,C,R,G,g,V){"use strict";var k=new A.Cartesian2;function d(e){var t=(e=_.defaultValue(e,_.defaultValue.EMPTY_OBJECT)).length,i=e.topRadius,r=e.bottomRadius,a=_.defaultValue(e.slices,128),o=Math.max(_.defaultValue(e.numberOfVerticalLines,16),0);if(f.Check.typeOf.number("options.positions",t),f.Check.typeOf.number("options.topRadius",i),f.Check.typeOf.number("options.bottomRadius",r),f.Check.typeOf.number.greaterThanOrEquals("options.slices",a,3),_.defined(e.offsetAttribute)&&e.offsetAttribute===g.GeometryOffsetAttribute.TOP)throw new f.DeveloperError("GeometryOffsetAttribute.TOP is not a supported options.offsetAttribute for this geometry.");this._length=t,this._topRadius=i,this._bottomRadius=r,this._slices=a,this._numberOfVerticalLines=o,this._offsetAttribute=e.offsetAttribute,this._workerName="createCylinderOutlineGeometry"}d.packedLength=6,d.pack=function(e,t,i){return f.Check.typeOf.object("value",e),f.Check.defined("array",t),i=_.defaultValue(i,0),t[i++]=e._length,t[i++]=e._topRadius,t[i++]=e._bottomRadius,t[i++]=e._slices,t[i++]=e._numberOfVerticalLines,t[i]=_.defaultValue(e._offsetAttribute,-1),t};var c={length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};return d.unpack=function(e,t,i){f.Check.defined("array",e),t=_.defaultValue(t,0);var r=e[t++],a=e[t++],o=e[t++],n=e[t++],s=e[t++],u=e[t];return _.defined(i)?(i._length=r,i._topRadius=a,i._bottomRadius=o,i._slices=n,i._numberOfVerticalLines=s,i._offsetAttribute=-1===u?void 0:u,i):(c.length=r,c.topRadius=a,c.bottomRadius=o,c.slices=n,c.numberOfVerticalLines=s,c.offsetAttribute=-1===u?void 0:u,new d(c))},d.createGeometry=function(e){var t=e._length,i=e._topRadius,r=e._bottomRadius,a=e._slices,o=e._numberOfVerticalLines;if(!(t<=0||i<0||r<0||0===i&&0===r)){var n,s=2*a,u=V.CylinderGeometryLibrary.computePositions(t,i,r,a,!1),f=2*a;if(0<o){var d=Math.min(o,a);n=Math.round(a/d),f+=d}var c,b=G.IndexDatatype.createTypedArray(s,2*f),m=0;for(c=0;c<a-1;c++)b[m++]=c,b[m++]=c+1,b[m++]=c+a,b[m++]=c+1+a;if(b[m++]=a-1,b[m++]=0,b[m++]=a+a-1,b[m++]=a,0<o)for(c=0;c<a;c+=n)b[m++]=c,b[m++]=c+a;var p=new R.GeometryAttributes;p.position=new C.GeometryAttribute({componentDatatype:O.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u}),k.x=.5*t,k.y=Math.max(r,i);var l=new v.BoundingSphere(A.Cartesian3.ZERO,A.Cartesian2.magnitude(k));if(_.defined(e._offsetAttribute)){t=u.length;var y=new Uint8Array(t/3),h=e._offsetAttribute===g.GeometryOffsetAttribute.NONE?0:1;g.arrayFill(y,h),p.applyOffset=new C.GeometryAttribute({componentDatatype:O.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:y})}return new C.Geometry({attributes:p,indices:b,primitiveType:C.PrimitiveType.LINES,boundingSphere:l,offsetAttribute:e._offsetAttribute})}},function(e,t){return _.defined(t)&&(e=d.unpack(e,t)),d.createGeometry(e)}});
