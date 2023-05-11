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
define(["exports","./when-a55a8a4c","./Check-bc1d37d9","./Math-d7cbfcf6","./WebGLConstants-4c11ee5f"],function(e,a,i,E,r){"use strict";var t={UNSIGNED_BYTE:r.WebGLConstants.UNSIGNED_BYTE,UNSIGNED_SHORT:r.WebGLConstants.UNSIGNED_SHORT,UNSIGNED_INT:r.WebGLConstants.UNSIGNED_INT,getSizeInBytes:function(e){switch(e){case t.UNSIGNED_BYTE:return Uint8Array.BYTES_PER_ELEMENT;case t.UNSIGNED_SHORT:return Uint16Array.BYTES_PER_ELEMENT;case t.UNSIGNED_INT:return Uint32Array.BYTES_PER_ELEMENT}throw new i.DeveloperError("indexDatatype is required and must be a valid IndexDatatype constant.")},fromSizeInBytes:function(e){switch(e){case 2:return t.UNSIGNED_SHORT;case 4:return t.UNSIGNED_INT;case 1:return t.UNSIGNED_BYTE;default:throw new i.DeveloperError("Size in bytes cannot be mapped to an IndexDatatype")}},validate:function(e){return a.defined(e)&&(e===t.UNSIGNED_BYTE||e===t.UNSIGNED_SHORT||e===t.UNSIGNED_INT)},createTypedArray:function(e,r){if(!a.defined(e))throw new i.DeveloperError("numberOfVertices is required.");return new(e>=E.CesiumMath.SIXTY_FOUR_KILOBYTES?Uint32Array:Uint16Array)(r)},createTypedArrayFromArrayBuffer:function(e,r,t,n){if(!a.defined(e))throw new i.DeveloperError("numberOfVertices is required.");if(!a.defined(r))throw new i.DeveloperError("sourceArray is required.");if(!a.defined(t))throw new i.DeveloperError("byteOffset is required.");return new(e>=E.CesiumMath.SIXTY_FOUR_KILOBYTES?Uint32Array:Uint16Array)(r,t,n)}},n=Object.freeze(t);e.IndexDatatype=n});
