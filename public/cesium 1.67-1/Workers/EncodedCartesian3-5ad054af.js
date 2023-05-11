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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9","./Cartesian2-6ec3db89"],function(e,r,h,n){"use strict";function t(){this.high=n.Cartesian3.clone(n.Cartesian3.ZERO),this.low=n.Cartesian3.clone(n.Cartesian3.ZERO)}t.encode=function(e,n){var a;return h.Check.typeOf.number("value",e),r.defined(n)||(n={high:0,low:0}),0<=e?(a=65536*Math.floor(e/65536),n.high=a,n.low=e-a):(a=65536*Math.floor(-e/65536),n.high=-a,n.low=e+a),n};var o={high:0,low:0};t.fromCartesian=function(e,n){h.Check.typeOf.object("cartesian",e),r.defined(n)||(n=new t);var a=n.high,i=n.low;return t.encode(e.x,o),a.x=o.high,i.x=o.low,t.encode(e.y,o),a.y=o.high,i.y=o.low,t.encode(e.z,o),a.z=o.high,i.z=o.low,n};var c=new t;t.writeElements=function(e,n,a){h.Check.defined("cartesianArray",n),h.Check.typeOf.number("index",a),h.Check.typeOf.number.greaterThanOrEquals("index",a,0),t.fromCartesian(e,c);var i=c.high,r=c.low;n[a]=i.x,n[a+1]=i.y,n[a+2]=i.z,n[a+3]=r.x,n[a+4]=r.y,n[a+5]=r.z},e.EncodedCartesian3=t});
