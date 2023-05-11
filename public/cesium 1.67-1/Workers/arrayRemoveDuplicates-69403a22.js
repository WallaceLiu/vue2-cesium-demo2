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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6"],function(e,u,h,t){"use strict";var l=t.CesiumMath.EPSILON10;e.arrayRemoveDuplicates=function(e,t,n){if(h.Check.defined("equalsEpsilon",t),u.defined(e)){n=u.defaultValue(n,!1);var i,r,a,f=e.length;if(f<2)return e;for(i=1;i<f&&!t(r=e[i-1],a=e[i],l);++i);if(i===f)return n&&t(e[0],e[e.length-1],l)?e.slice(1):e;for(var c=e.slice(0,i);i<f;++i)t(r,a=e[i],l)||(c.push(a),r=a);return n&&1<c.length&&t(c[0],c[c.length-1],l)&&c.shift(),c}}});
