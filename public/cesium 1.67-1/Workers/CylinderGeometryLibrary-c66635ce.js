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
define(["exports","./Math-d7cbfcf6"],function(r,P){"use strict";var t={computePositions:function(r,t,e,a,i){var n,o=.5*r,s=-o,c=a+a,f=new Float64Array(3*(i?2*c:c)),u=0,h=0,y=i?3*c:0,M=i?3*(c+a):3*a;for(n=0;n<a;n++){var d=n/a*P.CesiumMath.TWO_PI,m=Math.cos(d),v=Math.sin(d),b=m*e,l=v*e,p=m*t,C=v*t;f[h+y]=b,f[h+y+1]=l,f[h+y+2]=s,f[h+M]=p,f[h+M+1]=C,f[h+M+2]=o,h+=3,i&&(f[u++]=b,f[u++]=l,f[u++]=s,f[u++]=p,f[u++]=C,f[u++]=o)}return f}};r.CylinderGeometryLibrary=t});
