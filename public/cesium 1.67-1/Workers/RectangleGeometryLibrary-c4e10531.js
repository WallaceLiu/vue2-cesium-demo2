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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./GeometryAttribute-291ff23b"],function(t,Y,x,P,W,a,R){"use strict";var v=Math.cos,O=Math.sin,p=Math.sqrt,n={computePosition:function(t,a,n,r,e,o,s){var i=a.radiiSquared,h=t.nwCorner,g=t.boundingRectangle,u=h.latitude-t.granYCos*r+e*t.granXSin,c=v(u),C=O(u),l=i.z*C,d=h.longitude+r*t.granYSin+e*t.granXCos,M=c*v(d),S=c*O(d),w=i.x*M,m=i.y*S,f=p(w*M+m*S+l*C);if(o.x=w/f,o.y=m/f,o.z=l/f,n){var X=t.stNwCorner;Y.defined(X)?(u=X.latitude-t.stGranYCos*r+e*t.stGranXSin,d=X.longitude+r*t.stGranYSin+e*t.stGranXCos,s.x=(d-t.stWest)*t.lonScalar,s.y=(u-t.stSouth)*t.latScalar):(s.x=(d-g.west)*t.lonScalar,s.y=(u-g.south)*t.latScalar)}}},_=new R.Matrix2,G=new W.Cartesian3,b=new W.Cartographic,y=new W.Cartesian3,I=new a.GeographicProjection;function T(t,a,n,r,e,o,s){var i=Math.cos(a),h=r*i,g=n*i,u=Math.sin(a),c=r*u,C=n*u;G=I.project(t,G),G=W.Cartesian3.subtract(G,y,G);var l=R.Matrix2.fromRotation(a,_);G=R.Matrix2.multiplyByVector(l,G,G),G=W.Cartesian3.add(G,y,G),--o,--s;var d=(t=I.unproject(G,t)).latitude,M=d+o*C,S=d-h*s,w=d-h*s+o*C,m=Math.max(d,M,S,w),f=Math.min(d,M,S,w),X=t.longitude,Y=X+o*g,v=X+s*c,O=X+s*c+o*g;return{north:m,south:f,east:Math.max(X,Y,v,O),west:Math.min(X,Y,v,O),granYCos:h,granYSin:c,granXCos:g,granXSin:C,nwCorner:t}}n.computeOptions=function(t,a,n,r,e,o,s){var i,h,g,u,c,C=t.east,l=t.west,d=t.north,M=t.south,S=!1,w=!1;d===P.CesiumMath.PI_OVER_TWO&&(S=!0),M===-P.CesiumMath.PI_OVER_TWO&&(w=!0);var m=d-M;g=(c=C<l?P.CesiumMath.TWO_PI-l+C:C-l)/((i=Math.ceil(c/a)+1)-1),u=m/((h=Math.ceil(m/a)+1)-1);var f=W.Rectangle.northwest(t,o),X=W.Rectangle.center(t,b);0===n&&0===r||(X.longitude<f.longitude&&(X.longitude+=P.CesiumMath.TWO_PI),y=I.project(X,y));var Y=u,v=g,O=W.Rectangle.clone(t,e),R={granYCos:Y,granYSin:0,granXCos:v,granXSin:0,nwCorner:f,boundingRectangle:O,width:i,height:h,northCap:S,southCap:w};if(0!==n){var p=T(f,n,g,u,0,i,h);if(d=p.north,M=p.south,C=p.east,l=p.west,d<-P.CesiumMath.PI_OVER_TWO||d>P.CesiumMath.PI_OVER_TWO||M<-P.CesiumMath.PI_OVER_TWO||M>P.CesiumMath.PI_OVER_TWO)throw new x.DeveloperError("Rotated rectangle is invalid.  It crosses over either the north or south pole.");R.granYCos=p.granYCos,R.granYSin=p.granYSin,R.granXCos=p.granXCos,R.granXSin=p.granXSin,O.north=d,O.south=M,O.east=C,O.west=l}if(0!==r){n-=r;var _=W.Rectangle.northwest(O,s),G=T(_,n,g,u,0,i,h);R.stGranYCos=G.granYCos,R.stGranXCos=G.granXCos,R.stGranYSin=G.granYSin,R.stGranXSin=G.granXSin,R.stNwCorner=_,R.stWest=G.west,R.stSouth=G.south}return R},t.RectangleGeometryLibrary=n});
