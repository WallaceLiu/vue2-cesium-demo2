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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9","./Cartesian2-6ec3db89","./Transforms-a4d7073e"],function(e,o,c,r,a){"use strict";function y(e,t,n,i){this.x=o.defaultValue(e,0),this.y=o.defaultValue(t,0),this.width=o.defaultValue(n,0),this.height=o.defaultValue(i,0)}y.packedLength=4,y.pack=function(e,t,n){return c.Check.typeOf.object("value",e),c.Check.defined("array",t),n=o.defaultValue(n,0),t[n++]=e.x,t[n++]=e.y,t[n++]=e.width,t[n]=e.height,t},y.unpack=function(e,t,n){return c.Check.defined("array",e),t=o.defaultValue(t,0),o.defined(n)||(n=new y),n.x=e[t++],n.y=e[t++],n.width=e[t++],n.height=e[t],n},y.fromPoints=function(e,t){if(o.defined(t)||(t=new y),!o.defined(e)||0===e.length)return t.x=0,t.y=0,t.width=0,t.height=0,t;for(var n=e.length,i=e[0].x,h=e[0].y,r=e[0].x,a=e[0].y,c=1;c<n;c++){var d=e[c],u=d.x,f=d.y;i=Math.min(u,i),r=Math.max(u,r),h=Math.min(f,h),a=Math.max(f,a)}return t.x=i,t.y=h,t.width=r-i,t.height=a-h,t};var d=new a.GeographicProjection,u=new r.Cartographic,f=new r.Cartographic;y.fromRectangle=function(e,t,n){if(o.defined(n)||(n=new y),!o.defined(e))return n.x=0,n.y=0,n.width=0,n.height=0,n;var i=(t=o.defaultValue(t,d)).project(r.Rectangle.southwest(e,u)),h=t.project(r.Rectangle.northeast(e,f));return r.Cartesian2.subtract(h,i,h),n.x=i.x,n.y=i.y,n.width=h.x,n.height=h.y,n},y.clone=function(e,t){if(o.defined(e))return o.defined(t)?(t.x=e.x,t.y=e.y,t.width=e.width,t.height=e.height,t):new y(e.x,e.y,e.width,e.height)},y.union=function(e,t,n){c.Check.typeOf.object("left",e),c.Check.typeOf.object("right",t),o.defined(n)||(n=new y);var i=Math.min(e.x,t.x),h=Math.min(e.y,t.y),r=Math.max(e.x+e.width,t.x+t.width),a=Math.max(e.y+e.height,t.y+t.height);return n.x=i,n.y=h,n.width=r-i,n.height=a-h,n},y.expand=function(e,t,n){c.Check.typeOf.object("rectangle",e),c.Check.typeOf.object("point",t),n=y.clone(e,n);var i=t.x-n.x,h=t.y-n.y;return i>n.width?n.width=i:i<0&&(n.width-=i,n.x=t.x),h>n.height?n.height=h:h<0&&(n.height-=h,n.y=t.y),n},y.intersect=function(e,t){c.Check.typeOf.object("left",e),c.Check.typeOf.object("right",t);var n=e.x,i=e.y,h=t.x,r=t.y;return n>h+t.width||n+e.width<h||i+e.height<r||i>r+t.height?a.Intersect.OUTSIDE:a.Intersect.INTERSECTING},y.equals=function(e,t){return e===t||o.defined(e)&&o.defined(t)&&e.x===t.x&&e.y===t.y&&e.width===t.width&&e.height===t.height},y.prototype.clone=function(e){return y.clone(this,e)},y.prototype.intersect=function(e){return y.intersect(this,e)},y.prototype.equals=function(e){return y.equals(this,e)},e.BoundingRectangle=y});
