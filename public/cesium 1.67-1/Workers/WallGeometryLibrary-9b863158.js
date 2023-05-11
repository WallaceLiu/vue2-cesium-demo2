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
define(["exports","./when-a55a8a4c","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./EllipsoidTangentPlane-323c7a98","./PolygonPipeline-5b0d203a","./PolylinePipeline-83c8909c"],function(e,C,A,w,b,E,O){"use strict";var i={};var M=new w.Cartographic,L=new w.Cartographic;var F=new Array(2),H=new Array(2),T={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};i.computePositions=function(e,i,t,n,r,o){var a=function(e,i,t,n){var r=i.length;if(!(r<2)){var o=C.defined(n),a=C.defined(t),l=!0,h=new Array(r),s=new Array(r),g=new Array(r),p=i[0];h[0]=p;var c=e.cartesianToCartographic(p,M);a&&(c.height=t[0]),l=l&&c.height<=0,s[0]=c.height,g[0]=o?n[0]:0;for(var d,P,u=1,v=1;v<r;++v){var y=i[v],f=e.cartesianToCartographic(y,L);a&&(f.height=t[v]),l=l&&f.height<=0,d=c,P=f,A.CesiumMath.equalsEpsilon(d.latitude,P.latitude,A.CesiumMath.EPSILON14)&&A.CesiumMath.equalsEpsilon(d.longitude,P.longitude,A.CesiumMath.EPSILON14)?c.height<f.height&&(s[u-1]=f.height):(h[u]=y,s[u]=f.height,g[u]=o?n[v]:0,w.Cartographic.clone(f,c),++u)}if(!(l||u<2))return h.length=u,s.length=u,g.length=u,{positions:h,topHeights:s,bottomHeights:g}}}(e,i,t,n);if(C.defined(a)){if(i=a.positions,t=a.topHeights,n=a.bottomHeights,3<=i.length){var l=b.EllipsoidTangentPlane.fromPoints(i,e).projectPointsOntoPlane(i);E.PolygonPipeline.computeWindingOrder2D(l)===E.WindingOrder.CLOCKWISE&&(i.reverse(),t.reverse(),n.reverse())}var h,s,g=i.length,p=g-2,c=A.CesiumMath.chordLength(r,e.maximumRadius),d=T;if(d.minDistance=c,d.ellipsoid=e,o){var P,u=0;for(P=0;P<g-1;P++)u+=O.PolylinePipeline.numberOfPoints(i[P],i[P+1],c)+1;h=new Float64Array(3*u),s=new Float64Array(3*u);var v=F,y=H;d.positions=v,d.height=y;var f=0;for(P=0;P<g-1;P++){v[0]=i[P],v[1]=i[P+1],y[0]=t[P],y[1]=t[P+1];var m=O.PolylinePipeline.generateArc(d);h.set(m,f),y[0]=n[P],y[1]=n[P+1],s.set(O.PolylinePipeline.generateArc(d),f),f+=m.length}}else d.positions=i,d.height=t,h=new Float64Array(O.PolylinePipeline.generateArc(d)),d.height=n,s=new Float64Array(O.PolylinePipeline.generateArc(d));return{bottomPositions:s,topPositions:h,numCorners:p}}},e.WallGeometryLibrary=i});
