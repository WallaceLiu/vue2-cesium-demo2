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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9"],function(e,c,l){"use strict";var t=Object.freeze({NONE:0,TOP:1,ALL:2});e.GeometryOffsetAttribute=t,e.arrayFill=function(e,t,a,f){if(l.Check.defined("array",e),l.Check.defined("value",t),c.defined(a)&&l.Check.typeOf.number("start",a),c.defined(f)&&l.Check.typeOf.number("end",f),"function"==typeof e.fill)return e.fill(t,a,f);for(var n=e.length>>>0,r=c.defaultValue(a,0),i=r<0?Math.max(n+r,0):Math.min(r,n),d=c.defaultValue(f,n),u=d<0?Math.max(n+d,0):Math.min(d,n);i<u;)e[i]=t,i++;return e}});
