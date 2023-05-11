define(["exports","./Transforms-f88f3a93","./Cartesian2-8646c5a1","./Check-24483042","./when-54335d57","./EllipsoidTangentPlane-a0edf2aa","./Math-d6182036","./Plane-e1340a9c"],function(a,P,b,t,N,g,w,y){"use strict";function A(a,t){this.center=b.Cartesian3.clone(N.defaultValue(a,b.Cartesian3.ZERO)),this.halfAxes=P.Matrix3.clone(N.defaultValue(t,P.Matrix3.ZERO))}A.packedLength=b.Cartesian3.packedLength+P.Matrix3.packedLength,A.pack=function(a,t,e){return e=N.defaultValue(e,0),b.Cartesian3.pack(a.center,t,e),P.Matrix3.pack(a.halfAxes,t,e+b.Cartesian3.packedLength),t},A.unpack=function(a,t,e){return t=N.defaultValue(t,0),N.defined(e)||(e=new A),b.Cartesian3.unpack(a,t,e.center),P.Matrix3.unpack(a,t+b.Cartesian3.packedLength,e.halfAxes),e};var T=new b.Cartesian3,R=new b.Cartesian3,I=new b.Cartesian3,E=new b.Cartesian3,L=new b.Cartesian3,z=new b.Cartesian3,S=new P.Matrix3,U={unitary:new P.Matrix3,diagonal:new P.Matrix3};A.fromPoints=function(a,t){if(N.defined(t)||(t=new A),!N.defined(a)||0===a.length)return t.halfAxes=P.Matrix3.ZERO,t.center=b.Cartesian3.ZERO,t;for(var e=a.length,n=b.Cartesian3.clone(a[0],T),r=1;r<e;r++)b.Cartesian3.add(n,a[r],n);var i=1/e;b.Cartesian3.multiplyByScalar(n,i,n);var s,o=0,C=0,c=0,u=0,l=0,d=0;for(r=0;r<e;r++)o+=(s=b.Cartesian3.subtract(a[r],n,R)).x*s.x,C+=s.x*s.y,c+=s.x*s.z,u+=s.y*s.y,l+=s.y*s.z,d+=s.z*s.z;C*=i,c*=i,u*=i,l*=i,d*=i;var h=S;h[0]=o*=i,h[1]=C,h[2]=c,h[3]=C,h[4]=u,h[5]=l,h[6]=c,h[7]=l,h[8]=d;var h=P.Matrix3.computeEigenDecomposition(h,U),h=P.Matrix3.clone(h.unitary,t.halfAxes),x=P.Matrix3.getColumn(h,0,E),M=P.Matrix3.getColumn(h,1,L),m=P.Matrix3.getColumn(h,2,z),f=-Number.MAX_VALUE,p=-Number.MAX_VALUE,g=-Number.MAX_VALUE,w=Number.MAX_VALUE,y=Number.MAX_VALUE,O=Number.MAX_VALUE;for(r=0;r<e;r++)s=a[r],f=Math.max(b.Cartesian3.dot(x,s),f),p=Math.max(b.Cartesian3.dot(M,s),p),g=Math.max(b.Cartesian3.dot(m,s),g),w=Math.min(b.Cartesian3.dot(x,s),w),y=Math.min(b.Cartesian3.dot(M,s),y),O=Math.min(b.Cartesian3.dot(m,s),O);x=b.Cartesian3.multiplyByScalar(x,.5*(w+f),x),M=b.Cartesian3.multiplyByScalar(M,.5*(y+p),M),m=b.Cartesian3.multiplyByScalar(m,.5*(O+g),m),h=b.Cartesian3.add(x,M,t.center);b.Cartesian3.add(h,m,h);h=I;return h.x=f-w,h.y=p-y,h.z=g-O,b.Cartesian3.multiplyByScalar(h,.5,h),P.Matrix3.multiplyByScale(t.halfAxes,h,t.halfAxes),t};var d=new b.Cartesian3,h=new b.Cartesian3;function O(a,t,e,n,r,i,s,o,C,c,u){var l=(u=!N.defined(u)?new A:u).halfAxes;P.Matrix3.setColumn(l,0,t,l),P.Matrix3.setColumn(l,1,e,l),P.Matrix3.setColumn(l,2,n,l),(e=d).x=(r+i)/2,e.y=(s+o)/2,e.z=(C+c)/2;n=h;n.x=(i-r)/2,n.y=(o-s)/2,n.z=(c-C)/2;C=u.center,e=P.Matrix3.multiplyByVector(l,e,e);return b.Cartesian3.add(a,e,C),P.Matrix3.multiplyByScale(l,n,l),u}var v=new b.Cartographic,V=new b.Cartesian3,B=new b.Cartographic,_=new b.Cartographic,k=new b.Cartographic,W=new b.Cartographic,D=new b.Cartographic,q=new b.Cartesian3,X=new b.Cartesian3,j=new b.Cartesian3,Z=new b.Cartesian3,G=new b.Cartesian3,F=new b.Cartesian2,Y=new b.Cartesian2,H=new b.Cartesian2,J=new b.Cartesian2,K=new b.Cartesian2,Q=new b.Cartesian3,$=new b.Cartesian3,aa=new b.Cartesian3,ta=new b.Cartesian3,ea=new b.Cartesian2,na=new b.Cartesian3,ra=new b.Cartesian3,ia=new b.Cartesian3,sa=new y.Plane(b.Cartesian3.UNIT_X,0);A.fromRectangle=function(a,t,e,n,r){if(t=N.defaultValue(t,0),e=N.defaultValue(e,0),n=N.defaultValue(n,b.Ellipsoid.WGS84),a.width<=w.CesiumMath.PI){var i=b.Rectangle.center(a,v),s=n.cartographicToCartesian(i,V),o=new g.EllipsoidTangentPlane(s,n),C=o.plane,c=i.longitude,u=a.south<0&&0<a.north?0:i.latitude,l=b.Cartographic.fromRadians(c,a.north,e,B),d=b.Cartographic.fromRadians(a.west,a.north,e,_),h=b.Cartographic.fromRadians(a.west,u,e,k),x=b.Cartographic.fromRadians(a.west,a.south,e,W),M=b.Cartographic.fromRadians(c,a.south,e,D),m=n.cartographicToCartesian(l,q),f=n.cartographicToCartesian(d,X),p=n.cartographicToCartesian(h,j),s=n.cartographicToCartesian(x,Z),i=n.cartographicToCartesian(M,G),u=o.projectPointToNearestOnPlane(m,F),c=o.projectPointToNearestOnPlane(f,Y),l=o.projectPointToNearestOnPlane(p,H),h=o.projectPointToNearestOnPlane(s,J),M=o.projectPointToNearestOnPlane(i,K),p=-(m=Math.min(c.x,l.x,h.x)),i=Math.max(c.y,u.y),l=Math.min(h.y,M.y);return d.height=x.height=t,f=n.cartographicToCartesian(d,X),s=n.cartographicToCartesian(x,Z),c=Math.min(y.Plane.getPointDistance(C,f),y.Plane.getPointDistance(C,s)),O(o.origin,o.xAxis,o.yAxis,o.zAxis,m,p,l,i,c,e,r)}u=0<a.south,h=a.north<0,M=u?a.south:h?a.north:0,d=b.Rectangle.center(a,v).longitude,x=b.Cartesian3.fromRadians(d,M,e,n,Q);x.z=0;f=Math.abs(x.x)<w.CesiumMath.EPSILON10&&Math.abs(x.y)<w.CesiumMath.EPSILON10?b.Cartesian3.UNIT_X:b.Cartesian3.normalize(x,$),s=b.Cartesian3.UNIT_Z,o=b.Cartesian3.cross(f,s,aa);C=y.Plane.fromPointNormal(x,f,sa);d=b.Cartesian3.fromRadians(d+w.CesiumMath.PI_OVER_TWO,M,e,n,ta);m=-(p=b.Cartesian3.dot(y.Plane.projectPointOntoPlane(C,d,ea),o)),i=b.Cartesian3.fromRadians(0,a.north,h?t:e,n,na).z,l=b.Cartesian3.fromRadians(0,a.south,u?t:e,n,ra).z;n=b.Cartesian3.fromRadians(a.east,M,e,n,ia);return O(x,o,s,f,m,p,l,i,c=y.Plane.getPointDistance(C,n),0,r)},A.clone=function(a,t){if(N.defined(a))return N.defined(t)?(b.Cartesian3.clone(a.center,t.center),P.Matrix3.clone(a.halfAxes,t.halfAxes),t):new A(a.center,a.halfAxes)},A.intersectPlane=function(a,t){var e=a.center,n=t.normal,r=a.halfAxes,i=n.x,s=n.y,a=n.z,r=Math.abs(i*r[P.Matrix3.COLUMN0ROW0]+s*r[P.Matrix3.COLUMN0ROW1]+a*r[P.Matrix3.COLUMN0ROW2])+Math.abs(i*r[P.Matrix3.COLUMN1ROW0]+s*r[P.Matrix3.COLUMN1ROW1]+a*r[P.Matrix3.COLUMN1ROW2])+Math.abs(i*r[P.Matrix3.COLUMN2ROW0]+s*r[P.Matrix3.COLUMN2ROW1]+a*r[P.Matrix3.COLUMN2ROW2]),t=b.Cartesian3.dot(n,e)+t.distance;return t<=-r?P.Intersect.OUTSIDE:r<=t?P.Intersect.INSIDE:P.Intersect.INTERSECTING};var x=new b.Cartesian3,M=new b.Cartesian3,m=new b.Cartesian3,c=new b.Cartesian3;A.distanceSquaredTo=function(a,t){var e=b.Cartesian3.subtract(t,a.center,d),n=a.halfAxes,r=P.Matrix3.getColumn(n,0,x),i=P.Matrix3.getColumn(n,1,M),s=P.Matrix3.getColumn(n,2,m),o=b.Cartesian3.magnitude(r),t=b.Cartesian3.magnitude(i),a=b.Cartesian3.magnitude(s);b.Cartesian3.normalize(r,r),b.Cartesian3.normalize(i,i),b.Cartesian3.normalize(s,s);n=c;n.x=b.Cartesian3.dot(e,r),n.y=b.Cartesian3.dot(e,i),n.z=b.Cartesian3.dot(e,s);var C,s=0;return n.x<-o?s+=(C=n.x+o)*C:n.x>o&&(s+=(C=n.x-o)*C),n.y<-t?s+=(C=n.y+t)*C:n.y>t&&(s+=(C=n.y-t)*C),n.z<-a?s+=(C=n.z+a)*C:n.z>a&&(s+=(C=n.z-a)*C),s};var f=new b.Cartesian3,p=new b.Cartesian3;A.computePlaneDistances=function(a,t,e,n){N.defined(n)||(n=new P.Interval);var r=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,s=a.center,o=a.halfAxes,C=P.Matrix3.getColumn(o,0,x),c=P.Matrix3.getColumn(o,1,M),u=P.Matrix3.getColumn(o,2,m),l=b.Cartesian3.add(C,c,f);b.Cartesian3.add(l,u,l),b.Cartesian3.add(l,s,l);a=b.Cartesian3.subtract(l,t,p),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i);return b.Cartesian3.add(s,C,l),b.Cartesian3.add(l,c,l),b.Cartesian3.subtract(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.add(s,C,l),b.Cartesian3.subtract(l,c,l),b.Cartesian3.add(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.add(s,C,l),b.Cartesian3.subtract(l,c,l),b.Cartesian3.subtract(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.subtract(s,C,l),b.Cartesian3.add(l,c,l),b.Cartesian3.add(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.subtract(s,C,l),b.Cartesian3.add(l,c,l),b.Cartesian3.subtract(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.subtract(s,C,l),b.Cartesian3.subtract(l,c,l),b.Cartesian3.add(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),b.Cartesian3.subtract(s,C,l),b.Cartesian3.subtract(l,c,l),b.Cartesian3.subtract(l,u,l),b.Cartesian3.subtract(l,t,a),o=b.Cartesian3.dot(e,a),r=Math.min(o,r),i=Math.max(o,i),n.start=r,n.stop=i,n};var e=new P.BoundingSphere;A.isOccluded=function(a,t){a=P.BoundingSphere.fromOrientedBoundingBox(a,e);return!t.isBoundingSphereVisible(a)},A.prototype.intersectPlane=function(a){return A.intersectPlane(this,a)},A.prototype.distanceSquaredTo=function(a){return A.distanceSquaredTo(this,a)},A.prototype.computePlaneDistances=function(a,t,e){return A.computePlaneDistances(this,a,t,e)},A.prototype.isOccluded=function(a){return A.isOccluded(this,a)},A.equals=function(a,t){return a===t||N.defined(a)&&N.defined(t)&&b.Cartesian3.equals(a.center,t.center)&&P.Matrix3.equals(a.halfAxes,t.halfAxes)},A.prototype.clone=function(a){return A.clone(this,a)},A.prototype.equals=function(a){return A.equals(this,a)},a.OrientedBoundingBox=A});