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
define(["./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./Cartesian2-6ec3db89","./Transforms-a4d7073e","./RuntimeError-7c184ac0","./WebGLConstants-4c11ee5f","./ComponentDatatype-919a7463","./GeometryAttribute-291ff23b","./GeometryAttributes-1c7ce91d","./IndexDatatype-4351ba4c","./IntersectionTests-3d9e1b94","./Plane-37b84dad","./VertexFormat-7f136973","./EllipsoidTangentPlane-323c7a98","./EllipsoidRhumbLine-4d1a57d2","./PolygonPipeline-5b0d203a","./EllipsoidGeodesic-365e69f7","./PolylinePipeline-83c8909c","./WallGeometryLibrary-9b863158"],function(Z,p,j,K,Q,e,t,X,$,ee,te,i,a,u,r,n,o,s,l,ie){"use strict";var ae=new K.Cartesian3,re=new K.Cartesian3,ne=new K.Cartesian3,oe=new K.Cartesian3,se=new K.Cartesian3,le=new K.Cartesian3,me=new K.Cartesian3,de=new K.Cartesian3;function c(e){var t=(e=Z.defaultValue(e,Z.defaultValue.EMPTY_OBJECT)).positions,i=e.maximumHeights,a=e.minimumHeights;if(!Z.defined(t))throw new p.DeveloperError("options.positions is required.");if(Z.defined(i)&&i.length!==t.length)throw new p.DeveloperError("options.positions and options.maximumHeights must have the same length.");if(Z.defined(a)&&a.length!==t.length)throw new p.DeveloperError("options.positions and options.minimumHeights must have the same length.");var r=Z.defaultValue(e.vertexFormat,u.VertexFormat.DEFAULT),n=Z.defaultValue(e.granularity,j.CesiumMath.RADIANS_PER_DEGREE),o=Z.defaultValue(e.ellipsoid,K.Ellipsoid.WGS84);this._positions=t,this._minimumHeights=a,this._maximumHeights=i,this._vertexFormat=u.VertexFormat.clone(r),this._granularity=n,this._ellipsoid=K.Ellipsoid.clone(o),this._workerName="createWallGeometry";var s=1+t.length*K.Cartesian3.packedLength+2;Z.defined(a)&&(s+=a.length),Z.defined(i)&&(s+=i.length),this.packedLength=s+K.Ellipsoid.packedLength+u.VertexFormat.packedLength+1}c.pack=function(e,t,i){if(!Z.defined(e))throw new p.DeveloperError("value is required");if(!Z.defined(t))throw new p.DeveloperError("array is required");var a;i=Z.defaultValue(i,0);var r=e._positions,n=r.length;for(t[i++]=n,a=0;a<n;++a,i+=K.Cartesian3.packedLength)K.Cartesian3.pack(r[a],t,i);var o=e._minimumHeights;if(n=Z.defined(o)?o.length:0,t[i++]=n,Z.defined(o))for(a=0;a<n;++a)t[i++]=o[a];var s=e._maximumHeights;if(n=Z.defined(s)?s.length:0,t[i++]=n,Z.defined(s))for(a=0;a<n;++a)t[i++]=s[a];return K.Ellipsoid.pack(e._ellipsoid,t,i),i+=K.Ellipsoid.packedLength,u.VertexFormat.pack(e._vertexFormat,t,i),t[i+=u.VertexFormat.packedLength]=e._granularity,t};var f=K.Ellipsoid.clone(K.Ellipsoid.UNIT_SPHERE),h=new u.VertexFormat,g={positions:void 0,minimumHeights:void 0,maximumHeights:void 0,ellipsoid:f,vertexFormat:h,granularity:void 0};return c.unpack=function(e,t,i){if(!Z.defined(e))throw new p.DeveloperError("array is required");var a;t=Z.defaultValue(t,0);var r,n,o=e[t++],s=new Array(o);for(a=0;a<o;++a,t+=K.Cartesian3.packedLength)s[a]=K.Cartesian3.unpack(e,t);if(0<(o=e[t++]))for(r=new Array(o),a=0;a<o;++a)r[a]=e[t++];if(0<(o=e[t++]))for(n=new Array(o),a=0;a<o;++a)n[a]=e[t++];var l=K.Ellipsoid.unpack(e,t,f);t+=K.Ellipsoid.packedLength;var m=u.VertexFormat.unpack(e,t,h),d=e[t+=u.VertexFormat.packedLength];return Z.defined(i)?(i._positions=s,i._minimumHeights=r,i._maximumHeights=n,i._ellipsoid=K.Ellipsoid.clone(l,i._ellipsoid),i._vertexFormat=u.VertexFormat.clone(m,i._vertexFormat),i._granularity=d,i):(g.positions=s,g.minimumHeights=r,g.maximumHeights=n,g.granularity=d,new c(g))},c.fromConstantHeights=function(e){var t,i,a=(e=Z.defaultValue(e,Z.defaultValue.EMPTY_OBJECT)).positions;if(!Z.defined(a))throw new p.DeveloperError("options.positions is required.");var r=e.minimumHeight,n=e.maximumHeight,o=Z.defined(r),s=Z.defined(n);if(o||s){var l=a.length;t=o?new Array(l):void 0,i=s?new Array(l):void 0;for(var m=0;m<l;++m)o&&(t[m]=r),s&&(i[m]=n)}return new c({positions:a,maximumHeights:i,minimumHeights:t,ellipsoid:e.ellipsoid,vertexFormat:e.vertexFormat})},c.createGeometry=function(e){var t=e._positions,i=e._minimumHeights,a=e._maximumHeights,r=e._vertexFormat,n=e._granularity,o=e._ellipsoid,s=ie.WallGeometryLibrary.computePositions(o,t,a,i,n,!0);if(Z.defined(s)){var l,m=s.bottomPositions,d=s.topPositions,p=s.numCorners,u=d.length,c=2*u,f=r.position?new Float64Array(c):void 0,h=r.normal?new Float32Array(c):void 0,g=r.tangent?new Float32Array(c):void 0,y=r.bitangent?new Float32Array(c):void 0,v=r.st?new Float32Array(c/3*2):void 0,C=0,w=0,E=0,x=0,A=0,b=de,_=me,F=le,D=!0,L=0,H=1/((u/=3)-t.length+1);for(l=0;l<u;++l){var k=3*l,G=K.Cartesian3.fromArray(d,k,ae),P=K.Cartesian3.fromArray(m,k,re);if(r.position&&(f[C++]=P.x,f[C++]=P.y,f[C++]=P.z,f[C++]=G.x,f[C++]=G.y,f[C++]=G.z),r.st&&(v[A++]=L,v[A++]=0,v[A++]=L,v[A++]=1),r.normal||r.tangent||r.bitangent){var V,T=K.Cartesian3.clone(K.Cartesian3.ZERO,se),z=o.scaleToGeodeticSurface(K.Cartesian3.fromArray(d,k,re),re);if(l+1<u&&(V=o.scaleToGeodeticSurface(K.Cartesian3.fromArray(d,3+k,ne),ne),T=K.Cartesian3.fromArray(d,3+k,se)),D){var O=K.Cartesian3.subtract(T,G,oe),S=K.Cartesian3.subtract(z,G,ae);b=K.Cartesian3.normalize(K.Cartesian3.cross(S,O,b),b),D=!1}K.Cartesian3.equalsEpsilon(V,z,j.CesiumMath.EPSILON10)?D=!0:(L+=H,r.tangent&&(_=K.Cartesian3.normalize(K.Cartesian3.subtract(V,z,_),_)),r.bitangent&&(F=K.Cartesian3.normalize(K.Cartesian3.cross(b,_,F),F))),r.normal&&(h[w++]=b.x,h[w++]=b.y,h[w++]=b.z,h[w++]=b.x,h[w++]=b.y,h[w++]=b.z),r.tangent&&(g[x++]=_.x,g[x++]=_.y,g[x++]=_.z,g[x++]=_.x,g[x++]=_.y,g[x++]=_.z),r.bitangent&&(y[E++]=F.x,y[E++]=F.y,y[E++]=F.z,y[E++]=F.x,y[E++]=F.y,y[E++]=F.z)}}var I=new ee.GeometryAttributes;r.position&&(I.position=new $.GeometryAttribute({componentDatatype:X.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:f})),r.normal&&(I.normal=new $.GeometryAttribute({componentDatatype:X.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:h})),r.tangent&&(I.tangent=new $.GeometryAttribute({componentDatatype:X.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:g})),r.bitangent&&(I.bitangent=new $.GeometryAttribute({componentDatatype:X.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:y})),r.st&&(I.st=new $.GeometryAttribute({componentDatatype:X.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:v}));var R=c/3;c-=6*(p+1);var q=te.IndexDatatype.createTypedArray(R,c),M=0;for(l=0;l<R-2;l+=2){var N=l,W=l+2,B=K.Cartesian3.fromArray(f,3*N,ae),U=K.Cartesian3.fromArray(f,3*W,re);if(!K.Cartesian3.equalsEpsilon(B,U,j.CesiumMath.EPSILON10)){var J=l+1,Y=l+3;q[M++]=J,q[M++]=N,q[M++]=Y,q[M++]=Y,q[M++]=N,q[M++]=W}}return new $.Geometry({attributes:I,indices:q,primitiveType:$.PrimitiveType.TRIANGLES,boundingSphere:new Q.BoundingSphere.fromVertices(f)})}},function(e,t){return Z.defined(t)&&(e=c.unpack(e,t)),e._ellipsoid=K.Ellipsoid.clone(e._ellipsoid),c.createGeometry(e)}});
