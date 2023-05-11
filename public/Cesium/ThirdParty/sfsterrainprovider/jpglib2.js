// JavaScript source code

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Copyright 2011 notmasteryet
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)


var JpegImage = (function jpegImage() {
    "use strict";

    var bits_dc_luminance = new Uint8Array(
      [ /* 0-base */  0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
    var val_dc_luminance = new Uint8Array(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0x0a, 0x0b]);
    var bits_dc_chrominance = new Uint8Array(
      [ /* 0-base */  0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    var val_dc_chrominance = new Uint8Array(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0x0a, 0x0b]);

    var bits_ac_luminance = new Uint8Array(
      [ /* 0-base */ 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d]);

    var val_ac_luminance = new Uint8Array([0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
          0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
          0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
          0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
          0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
          0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
          0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
          0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
          0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
          0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
          0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
          0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
          0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
          0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
          0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
          0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
          0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
          0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
          0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
          0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
          0xf9, 0xfa]);
    "1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250"


    var bits_ac_chrominance = new Uint8Array(
      [ /* 0-base */  0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77]);
    var val_ac_chrominance = new Uint8Array(
      [0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
          0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
          0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
          0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
          0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34,
          0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
          0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38,
          0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
          0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
          0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
          0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
          0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
          0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
          0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
          0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
          0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
          0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2,
          0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
          0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
          0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
          0xf9, 0xfa]);



    var dctZigZag = new Int32Array([
       0,
       1, 8,
      16, 9, 2,
       3, 10, 17, 24,
      32, 25, 18, 11, 4,
       5, 12, 19, 26, 33, 40,
      48, 41, 34, 27, 20, 13, 6,
       7, 14, 21, 28, 35, 42, 49, 56,
      57, 50, 43, 36, 29, 22, 15,
      23, 30, 37, 44, 51, 58,
      59, 52, 45, 38, 31,
      39, 46, 53, 60,
      61, 54, 47,
      55, 62,
      63
    ]);

    var dctCos1 = 4017   // cos(pi/16)
    var dctSin1 = 799   // sin(pi/16)
    var dctCos3 = 3406   // cos(3*pi/16)
    var dctSin3 = 2276   // sin(3*pi/16)
    var dctCos6 = 1567   // cos(6*pi/16)
    var dctSin6 = 3784   // sin(6*pi/16)
    var dctSqrt2 = 5793   // sqrt(2)
    var dctSqrt1d2 = 2896  // sqrt(2) / 2


    function constructor() {
    }





    function buildHuffmanTable(codeLengths, values) {

        var k = 0, code = [], i, j, length = 16;
        while (length > 0 && !codeLengths[length - 1])
            length--;
        code.push({ children: [], index: 0 });
        var p = code[0], q;
        for (i = 0; i < length; i++) {
            for (j = 0; j < codeLengths[i]; j++) {
                p = code.pop();
                p.children[p.index] = values[k];
                while (p.index > 0) {
                    p = code.pop();
                }
                p.index++;
                code.push(p);
                while (code.length <= i) {
                    code.push(q = { children: [], index: 0 });
                    p.children[p.index] = q.children;
                    p = q;
                }
                k++;
            }

            if (i + 1 < length) {
                // p here points to last code
                code.push(q = { children: [], index: 0 });
                p.children[p.index] = q.children;
                p = q;
            }
        }

        return code[0].children;
    }

    function decodeScan(data, offset,
                        frame, components, resetInterval,
                        spectralStart, spectralEnd,
                        successivePrev, successive) {
        var precision = frame.precision;
        var samplesPerLine = frame.samplesPerLine;
        var scanLines = frame.scanLines;
        var mcusPerLine = frame.mcusPerLine;
        var progressive = frame.progressive;
        var maxH = frame.maxH, maxV = frame.maxV;

        var startOffset = offset, bitsData = 0, bitsCount = 0;


        function readBit() {

            if (bitsCount > 0) {
                bitsCount--;
                return (bitsData >> bitsCount) & 1;
            }
            bitsData = data[offset++];
            if (bitsData == 0xFF) {
                var nextByte = data[offset++];
                if (nextByte) {
                    throw "unexpected marker: " + ((bitsData << 8) | nextByte).toString(16);
                }
                // unstuff 0
            }
            bitsCount = 7;
            return bitsData >>> 7;
        }
        function decodeHuffman(tree) {
            var node = tree, bit;

            while ((bit = readBit()) !== null) {
                node = node[bit];
                if (typeof node === 'number')
                    return node;
                if (typeof node !== 'object')
                    throw "invalid huffman sequence";
            }
            return null;
        }
        function receive(length) {
            var n = 0;
            while (length > 0) {
                var bit = readBit();
                if (bit === null) return;
                n = (n << 1) | bit;
                length--;
            }
            return n;
        }
        function receiveAndExtend(length) {
            var n = receive(length);
            if (n >= 1 << (length - 1))
                return n;
            return n + (-1 << length) + 1;
        }
        function decodeBaseline(component, zz) {
            var t = decodeHuffman(component.huffmanTableDC);
            var diff = t === 0 ? 0 : receiveAndExtend(t);
            zz[0] = (component.pred += diff);
            var k = 1;
            while (k < 64) {

                var rs = decodeHuffman(component.huffmanTableAC);
                var s = rs & 15, r = rs >> 4;
                if (s === 0) {
                    if (r < 15)
                        break;
                    k += 16;
                    continue;
                }
                k += r;
                var z = dctZigZag[k];
                zz[z] = receiveAndExtend(s);
                k++;
            }
        }
        function decodeDCFirst(component, zz) {
            var t = decodeHuffman(component.huffmanTableDC);
            var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
            zz[0] = (component.pred += diff);
        }
        function decodeDCSuccessive(component, zz) {
            zz[0] |= readBit() << successive;
        }
        var eobrun = 0;
        function decodeACFirst(component, zz) {
            if (eobrun > 0) {
                eobrun--;
                return;
            }
            var k = spectralStart, e = spectralEnd;
            while (k <= e) {
                var rs = decodeHuffman(component.huffmanTableAC);
                var s = rs & 15, r = rs >> 4;
                if (s === 0) {
                    if (r < 15) {
                        eobrun = receive(r) + (1 << r) - 1;
                        break;
                    }
                    k += 16;
                    continue;
                }
                k += r;
                var z = dctZigZag[k];
                zz[z] = receiveAndExtend(s) * (1 << successive);
                k++;
            }
        }
        var successiveACState = 0, successiveACNextValue;
        function decodeACSuccessive(component, zz) {
            var k = spectralStart, e = spectralEnd, r = 0;
            while (k <= e) {
                var z = dctZigZag[k];
                switch (successiveACState) {
                    case 0: // initial state
                        var rs = decodeHuffman(component.huffmanTableAC);
                        var s = rs & 15, r = rs >> 4;
                        if (s === 0) {
                            if (r < 15) {
                                eobrun = receive(r) + (1 << r);
                                successiveACState = 4;
                            } else {
                                r = 16;
                                successiveACState = 1;
                            }
                        } else {
                            if (s !== 1)
                                throw "invalid ACn encoding";
                            successiveACNextValue = receiveAndExtend(s);
                            successiveACState = r ? 2 : 3;
                        }
                        continue;
                    case 1: // skipping r zero items
                    case 2:
                        if (zz[z])
                            zz[z] += (readBit() << successive);
                        else {
                            r--;
                            if (r === 0)
                                successiveACState = successiveACState == 2 ? 3 : 0;
                        }
                        break;
                    case 3: // set value for a zero item
                        if (zz[z])
                            zz[z] += (readBit() << successive);
                        else {
                            zz[z] = successiveACNextValue << successive;
                            successiveACState = 0;
                        }
                        break;
                    case 4: // eob
                        if (zz[z])
                            zz[z] += (readBit() << successive);
                        break;
                }
                k++;
            }
            if (successiveACState === 4) {
                eobrun--;
                if (eobrun === 0)
                    successiveACState = 0;
            }
        }
        function decodeMcu(component, decode, mcu, row, col) {
            var mcuRow = (mcu / mcusPerLine) | 0;
            var mcuCol = mcu % mcusPerLine;
            var blockRow = mcuRow * component.v + row;
            var blockCol = mcuCol * component.h + col;
            decode(component, component.blocks[blockRow][blockCol]);
        }
        function decodeBlock(component, decode, mcu) {
            var blockRow = (mcu / component.blocksPerLine) | 0;
            var blockCol = mcu % component.blocksPerLine;
            decode(component, component.blocks[blockRow][blockCol]);
        }

        var componentsLength = components.length;
        var component, i, j, k, n;
        var decodeFn;
        if (progressive) {
            if (spectralStart === 0)
                decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
            else
                decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
        } else {
            decodeFn = decodeBaseline;
        }

        var mcu = 0, marker;
        var mcuExpected;
        if (componentsLength == 1) {
            mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
        } else {
            mcuExpected = mcusPerLine * frame.mcusPerColumn;
        }
        if (!resetInterval) resetInterval = mcuExpected;

        var h, v;
        while (mcu < mcuExpected) {
            // reset interval stuff
            for (i = 0; i < componentsLength; i++)
                components[i].pred = 0;
            eobrun = 0;

            if (componentsLength == 1) {
                component = components[0];
                for (n = 0; n < resetInterval; n++) {
                    decodeBlock(component, decodeFn, mcu);
                    mcu++;
                }
            } else {
                for (n = 0; n < resetInterval; n++) {
                    for (i = 0; i < componentsLength; i++) {
                        component = components[i];
                        h = component.h;
                        v = component.v;
                        for (j = 0; j < v; j++) {
                            for (k = 0; k < h; k++) {
                                decodeMcu(component, decodeFn, mcu, j, k);
                            }
                        }
                    }
                    mcu++;

                    // If we've reached our expected MCU's, stop decoding
                    if (mcu === mcuExpected) break;
                }
            }

            // find marker
            bitsCount = 0;
            marker = (data[offset] << 8) | data[offset + 1];
            if (marker < 0xFF00) {
                throw "marker was not found";
            }

            if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
                offset += 2;
            }
            else
                break;
        }

        return offset - startOffset;
    }

    function buildComponentData(frame, component) {
        var lines = [];
        var blocksPerLine = component.blocksPerLine;
        var blocksPerColumn = component.blocksPerColumn;
        var samplesPerLine = blocksPerLine << 3;
        var R = new Int32Array(64), r = new Uint8Array(64);

        // A port of poppler's IDCT method which in turn is taken from:
        //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
        //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
        //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
        //   988-991.
        function quantizeAndInverse(zz, dataOut, dataIn) {
            var qt = component.quantizationTable;
            var v0, v1, v2, v3, v4, v5, v6, v7, t;
            var p = dataIn;
            var i;

            // dequant
            for (i = 0; i < 64; i++)
                p[i] = zz[i] * qt[i];

            // inverse DCT on rows
            for (i = 0; i < 8; ++i) {
                var row = 8 * i;

                // check for all-zero AC coefficients
                if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 &&
                    p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 &&
                    p[7 + row] == 0) {
                    t = (dctSqrt2 * p[0 + row] + 512) >> 10;
                    p[0 + row] = t;
                    p[1 + row] = t;
                    p[2 + row] = t;
                    p[3 + row] = t;
                    p[4 + row] = t;
                    p[5 + row] = t;
                    p[6 + row] = t;
                    p[7 + row] = t;
                    continue;
                }

                // stage 4
                v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
                v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
                v2 = p[2 + row];
                v3 = p[6 + row];
                v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
                v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
                v5 = p[3 + row] << 4;
                v6 = p[5 + row] << 4;

                // stage 3
                t = (v0 - v1 + 1) >> 1;
                v0 = (v0 + v1 + 1) >> 1;
                v1 = t;
                t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
                v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
                v3 = t;
                t = (v4 - v6 + 1) >> 1;
                v4 = (v4 + v6 + 1) >> 1;
                v6 = t;
                t = (v7 + v5 + 1) >> 1;
                v5 = (v7 - v5 + 1) >> 1;
                v7 = t;

                // stage 2
                t = (v0 - v3 + 1) >> 1;
                v0 = (v0 + v3 + 1) >> 1;
                v3 = t;
                t = (v1 - v2 + 1) >> 1;
                v1 = (v1 + v2 + 1) >> 1;
                v2 = t;
                t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                v7 = t;
                t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                v6 = t;

                // stage 1
                p[0 + row] = v0 + v7;
                p[7 + row] = v0 - v7;
                p[1 + row] = v1 + v6;
                p[6 + row] = v1 - v6;
                p[2 + row] = v2 + v5;
                p[5 + row] = v2 - v5;
                p[3 + row] = v3 + v4;
                p[4 + row] = v3 - v4;
            }

            // inverse DCT on columns
            for (i = 0; i < 8; ++i) {
                var col = i;

                // check for all-zero AC coefficients
                if (p[1 * 8 + col] == 0 && p[2 * 8 + col] == 0 && p[3 * 8 + col] == 0 &&
                    p[4 * 8 + col] == 0 && p[5 * 8 + col] == 0 && p[6 * 8 + col] == 0 &&
                    p[7 * 8 + col] == 0) {
                    t = (dctSqrt2 * dataIn[i + 0] + 8192) >> 14;
                    p[0 * 8 + col] = t;
                    p[1 * 8 + col] = t;
                    p[2 * 8 + col] = t;
                    p[3 * 8 + col] = t;
                    p[4 * 8 + col] = t;
                    p[5 * 8 + col] = t;
                    p[6 * 8 + col] = t;
                    p[7 * 8 + col] = t;
                    continue;
                }

                // stage 4
                v0 = (dctSqrt2 * p[0 * 8 + col] + 2048) >> 12;
                v1 = (dctSqrt2 * p[4 * 8 + col] + 2048) >> 12;
                v2 = p[2 * 8 + col];
                v3 = p[6 * 8 + col];
                v4 = (dctSqrt1d2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048) >> 12;
                v7 = (dctSqrt1d2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048) >> 12;
                v5 = p[3 * 8 + col];
                v6 = p[5 * 8 + col];

                // stage 3
                t = (v0 - v1 + 1) >> 1;
                v0 = (v0 + v1 + 1) >> 1;
                v1 = t;
                t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
                v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
                v3 = t;
                t = (v4 - v6 + 1) >> 1;
                v4 = (v4 + v6 + 1) >> 1;
                v6 = t;
                t = (v7 + v5 + 1) >> 1;
                v5 = (v7 - v5 + 1) >> 1;
                v7 = t;

                // stage 2
                t = (v0 - v3 + 1) >> 1;
                v0 = (v0 + v3 + 1) >> 1;
                v3 = t;
                t = (v1 - v2 + 1) >> 1;
                v1 = (v1 + v2 + 1) >> 1;
                v2 = t;
                t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                v7 = t;
                t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                v6 = t;

                // stage 1
                p[0 * 8 + col] = v0 + v7;
                p[7 * 8 + col] = v0 - v7;
                p[1 * 8 + col] = v1 + v6;
                p[6 * 8 + col] = v1 - v6;
                p[2 * 8 + col] = v2 + v5;
                p[5 * 8 + col] = v2 - v5;
                p[3 * 8 + col] = v3 + v4;
                p[4 * 8 + col] = v3 - v4;
            }

            // convert to 8-bit integers
            for (i = 0; i < 64; ++i) {
                var sample = 128 + ((p[i] + 8) >> 4);
                dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
            }
        }

        var i, j;
        for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
            var scanLine = blockRow << 3;
            for (i = 0; i < 8; i++)
                lines.push(new Uint8Array(samplesPerLine));
            for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
                quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);

                var offset = 0, sample = blockCol << 3;
                for (j = 0; j < 8; j++) {
                    var line = lines[scanLine + j];
                    for (i = 0; i < 8; i++)
                        line[sample + i] = r[offset++];
                }
            }
        }
        return lines;
    }

    function clampTo8bit(a) {
        return a < 0 ? 0 : a > 255 ? 255 : a;
    }

    constructor.prototype = {
        load: function load(path) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = (function () {
                // TODO catch parse error
                var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
                this.parse(data);
                if (this.onload)
                    this.onload();
            }).bind(this);
            xhr.send(null);
        },
        parse: function parse(data, buildtables) {
            var offset = 0, length = data.length;

            function readUint16() {
                var value = (data[offset] << 8) | data[offset + 1];
                offset += 2;
                return value;
            }
            function readDataBlock() {
                var length = readUint16();
                var array = data.subarray(offset, offset + length - 2);
                offset += array.length;
                return array;
            }
            function prepareComponents(frame) {
                var maxH = 0, maxV = 0;
                var component, componentId;
                for (componentId in frame.components) {
                    if (frame.components.hasOwnProperty(componentId)) {
                        component = frame.components[componentId];
                        if (maxH < component.h) maxH = component.h;
                        if (maxV < component.v) maxV = component.v;
                    }
                }
                var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
                var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
                for (componentId in frame.components) {
                    if (frame.components.hasOwnProperty(componentId)) {
                        component = frame.components[componentId];
                        var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / maxH);
                        var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines / 8) * component.v / maxV);
                        var blocksPerLineForMcu = mcusPerLine * component.h;
                        var blocksPerColumnForMcu = mcusPerColumn * component.v;
                        var blocks = [];
                        for (var i = 0; i < blocksPerColumnForMcu; i++) {
                            var row = [];
                            for (var j = 0; j < blocksPerLineForMcu; j++)
                                row.push(new Int32Array(64));
                            blocks.push(row);
                        }
                        component.blocksPerLine = blocksPerLine;
                        component.blocksPerColumn = blocksPerColumn;
                        component.blocks = blocks;
                    }
                }
                frame.maxH = maxH;
                frame.maxV = maxV;
                frame.mcusPerLine = mcusPerLine;
                frame.mcusPerColumn = mcusPerColumn;
            }
            var jfif = null;
            var adobe = null;
            var pixels = null;
            var frame, resetInterval;
            var quantizationTables = [], frames = [];
            var huffmanTablesAC = [], huffmanTablesDC = [];
            var fileMarker = readUint16();

            if (fileMarker != 0xFFD8) { // SOI (Start of Image)
                throw "SOI not found";
            }

            // get quality and which from data
            var quality = data[5];

            if (quality <= 0 || quality > 100)   // should not happen
                quality = 90;
            //getW Which tables
            var whichTbl = 0;
            whichTbl = data[4]; // I don't think we need it (ask Ofer)

            var luminance_quantizationTable,
                chrominance_quantizationTable;

            //create quantization tables manually
            if (quality >= 0) {
                luminance_quantizationTable = createQuantizationTables(quality, 0); // 1 for luminance
                chrominance_quantizationTable = createQuantizationTables(quality, 1); // 0 for chrominance
            }

            //fill in quantization table from luminance (because we only need greyScale for elevation)
            // quantizationTables = luminance_quantizationTable;
            if (buildtables) {

                //restore markers
                data[2] = 0xFF;
                data[3] = 0xE0;
                data[4] = 0x00;
                data[5] = 0x10;
                data[6] = 0x4A;
                data[7] = 0x46;
                data[8] = 0x49;
                data[9] = 0x46;

                if (whichTbl & 1) {
                    quantizationTables[0] = luminance_quantizationTable;
                    quantizationTables[1] = chrominance_quantizationTable;
                }
                if (whichTbl & 2) {
                    huffmanTablesDC[0] = buildHuffmanTable(bits_dc_luminance, val_dc_luminance);
                    huffmanTablesAC[0] = buildHuffmanTable(bits_ac_luminance, val_ac_luminance);
                    huffmanTablesDC[1] = buildHuffmanTable(bits_dc_chrominance, val_dc_chrominance);
                    huffmanTablesAC[1] = buildHuffmanTable(bits_ac_chrominance, val_ac_chrominance);
                }


            }


            //function calcCodeLength(bits)
            //{
            //    var nsymbols = 0;
            //    for (var len = 0; len < 16; len++)
            //        nsymbols += bits[len];

            //    return nsymbols;
            //}


            //  huffmanTablesDC[0] = buildHuffmanTable(bits_dc_luminance, val_dc_luminance);
            //  huffmanTablesAC[0] = buildHuffmanTable(bits_ac_luminance, val_ac_luminance);
            //  huffmanTablesDC[1] = buildHuffmanTable(bits_dc_chrominance, val_dc_chrominance);
            //  huffmanTablesAC[1] = buildHuffmanTable(bits_ac_chrominance, val_ac_chrominance);


            fileMarker = readUint16();
            while (fileMarker != 0xFFD9) { // EOI (End of image)
                var i, j, l;
                switch (fileMarker) {
                    case 0xFF00: break;
                    case 0xFFE0: // APP0 (Application Specific)
                    case 0xFFE1: // APP1
                    case 0xFFE2: // APP2
                    case 0xFFE3: // APP3
                    case 0xFFE4: // APP4
                    case 0xFFE5: // APP5
                    case 0xFFE6: // APP6
                    case 0xFFE7: // APP7
                    case 0xFFE8: // APP8
                    case 0xFFE9: // APP9
                    case 0xFFEA: // APP10
                    case 0xFFEB: // APP11
                    case 0xFFEC: // APP12
                    case 0xFFED: // APP13
                    case 0xFFEE: // APP14
                    case 0xFFEF: // APP15
                    case 0xFFFE: // COM (Comment)
                        var appData = readDataBlock();

                        if (fileMarker === 0xFFE0) {

                            if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 &&
                              appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
                                jfif = {
                                    version: { major: appData[5], minor: appData[6] },
                                    densityUnits: appData[7],
                                    xDensity: (appData[8] << 8) | appData[9],
                                    yDensity: (appData[10] << 8) | appData[11],
                                    thumbWidth: appData[12],
                                    thumbHeight: appData[13],
                                    thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                                };
                            }
                        }
                        // TODO APP1 - Exif
                        if (fileMarker === 0xFFEE) {
                            if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F &&
                              appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
                                adobe = {
                                    version: appData[6],
                                    flags0: (appData[7] << 8) | appData[8],
                                    flags1: (appData[9] << 8) | appData[10],
                                    transformCode: appData[11]
                                };
                            }
                        }
                        break;

                    case 0xFFDB: // DQT (Define Quantization Tables)
                        var quantizationTablesLength = readUint16();
                        var quantizationTablesEnd = quantizationTablesLength + offset - 2;
                        while (offset < quantizationTablesEnd) {
                            var quantizationTableSpec = data[offset++];
                            var tableData = new Int32Array(64);
                            if ((quantizationTableSpec >> 4) === 0) { // 8 bit values
                                for (j = 0; j < 64; j++) {
                                    var z = dctZigZag[j];
                                    tableData[z] = data[offset++];
                                }
                            } else if ((quantizationTableSpec >> 4) === 1) { //16 bit
                                for (j = 0; j < 64; j++) {
                                    var z = dctZigZag[j];
                                    tableData[z] = readUint16();
                                }
                            } else
                                throw "DQT: invalid table spec";
                            quantizationTables[quantizationTableSpec & 15] = tableData;
                        }
                        break;

                    case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
                    case 0xFFC1: // SOF1 (Start of Frame, Extended DCT)
                    case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
                        readUint16(); // skip data length
                        frame = {};
                        frame.extended = (fileMarker === 0xFFC1);
                        frame.progressive = (fileMarker === 0xFFC2);
                        frame.precision = data[offset++];
                        frame.scanLines = readUint16();
                        frame.samplesPerLine = readUint16();
                        frame.components = {};
                        frame.componentsOrder = [];
                        var componentsCount = data[offset++], componentId;
                        var maxH = 0, maxV = 0;
                        for (i = 0; i < componentsCount; i++) {
                            componentId = data[offset];
                            var h = data[offset + 1] >> 4;
                            var v = data[offset + 1] & 15;
                            var qId = data[offset + 2];
                            frame.componentsOrder.push(componentId);
                            frame.components[componentId] = {
                                h: h,
                                v: v,
                                quantizationIdx: qId
                            };
                            offset += 3;
                        }
                        prepareComponents(frame);
                        frames.push(frame);
                        break;

                    case 0xFFC4: // DHT (Define Huffman Tables)
                        var huffmanLength = readUint16();
                        for (i = 2; i < huffmanLength;) {
                            var huffmanTableSpec = data[offset++];
                            var codeLengths = new Uint8Array(16);
                            var codeLengthSum = 0;
                            for (j = 0; j < 16; j++, offset++)
                                codeLengthSum += (codeLengths[j] = data[offset]);
                            var huffmanValues = new Uint8Array(codeLengthSum);
                            for (j = 0; j < codeLengthSum; j++, offset++)
                                huffmanValues[j] = data[offset];
                            i += 17 + codeLengthSum;

                            ((huffmanTableSpec >> 4) === 0 ?
                                huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] =
                              buildHuffmanTable(codeLengths, huffmanValues);
                        }
                        break;

                    case 0xFFDD: // DRI (Define Restart Interval)
                        readUint16(); // skip data length
                        resetInterval = readUint16();
                        break;

                    case 0xFFDA: // SOS (Start of Scan)
                        var scanLength = readUint16();
                        var selectorsCount = data[offset++];
                        var components = [], component;
                        for (i = 0; i < selectorsCount; i++) {
                            component = frame.components[data[offset++]];
                            var tableSpec = data[offset++];
                            component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
                            component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
                            components.push(component);
                        }
                        var spectralStart = data[offset++];
                        var spectralEnd = data[offset++];
                        var successiveApproximation = data[offset++];
                        var processed = decodeScan(data, offset,
                          frame, components, resetInterval,
                          spectralStart, spectralEnd,
                          successiveApproximation >> 4, successiveApproximation & 15);
                        offset += processed;
                        break;
                    default:
                        if (data[offset - 3] == 0xFF &&
                            data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
                            // could be incorrect encoding -- last 0xFF byte of the previous
                            // block was eaten by the encoder
                            offset -= 3;
                            break;
                        }
                        throw "unknown JPEG marker " + fileMarker.toString(16);
                }
                fileMarker = readUint16();
            }
            if (frames.length != 1)
                throw "only single frame JPEGs supported";


            // set each frame's components quantization table

            for (var i = 0; i < frames.length; i++) {
                var cp = frames[i].components;
                for (var j in cp) {
                    cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
                    delete cp[j].quantizationIdx;
                }
            }

            this.width = frame.samplesPerLine;
            this.height = frame.scanLines;
            this.jfif = jfif;
            this.adobe = adobe;
            this.components = [];
            for (var i = 0; i < frame.componentsOrder.length; i++) {
                var component = frame.components[frame.componentsOrder[i]];
                this.components.push({
                    lines: buildComponentData(frame, component),
                    scaleX: component.h / frame.maxH,
                    scaleY: component.v / frame.maxV
                });
            }
        },
        getData: function getData(width, height) {
            var scaleX = this.width / width, scaleY = this.height / height;

            var component1, component2, component3, component4;
            var component1Line, component2Line, component3Line, component4Line;
            var x, y;
            var offset = 0;
            var Y, Cb, Cr, K, C, M, Ye, R, G, B;
            var colorTransform;
            var dataLength = width * height * this.components.length;
            var data = new Uint8Array(dataLength);
            switch (this.components.length) {
                case 1:
                    component1 = this.components[0];
                    for (y = 0; y < height; y++) {
                        component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
                        for (x = 0; x < width; x++) {
                            Y = component1Line[0 | (x * component1.scaleX * scaleX)];

                            data[offset++] = Y;
                        }
                    }
                    break;
                case 2:
                    // PDF might compress two component data in custom colorspace
                    component1 = this.components[0];
                    component2 = this.components[1];
                    for (y = 0; y < height; y++) {
                        component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
                        component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
                        for (x = 0; x < width; x++) {
                            Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                            data[offset++] = Y;
                            Y = component2Line[0 | (x * component2.scaleX * scaleX)];
                            data[offset++] = Y;
                        }
                    }
                    break;
                case 3:
                    // The default transform for three components is true
                    colorTransform = true;
                    // The adobe transform marker overrides any previous setting
                    if (this.adobe && this.adobe.transformCode)
                        colorTransform = true;
                    else if (typeof this.colorTransform !== 'undefined')
                        colorTransform = !!this.colorTransform;

                    component1 = this.components[0];
                    component2 = this.components[1];
                    component3 = this.components[2];
                    for (y = 0; y < height; y++) {
                        component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
                        component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
                        component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
                        for (x = 0; x < width; x++) {
                            if (!colorTransform) {
                                R = component1Line[0 | (x * component1.scaleX * scaleX)];
                                G = component2Line[0 | (x * component2.scaleX * scaleX)];
                                B = component3Line[0 | (x * component3.scaleX * scaleX)];
                            } else {
                                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];

                                R = clampTo8bit(Y + 1.402 * (Cr - 128));
                                G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                                B = clampTo8bit(Y + 1.772 * (Cb - 128));
                            }

                            data[offset++] = R;
                            data[offset++] = G;
                            data[offset++] = B;
                        }
                    }
                    break;
                case 4:
                    if (!this.adobe)
                        throw 'Unsupported color mode (4 components)';
                    // The default transform for four components is false
                    colorTransform = false;
                    // The adobe transform marker overrides any previous setting
                    if (this.adobe && this.adobe.transformCode)
                        colorTransform = true;
                    else if (typeof this.colorTransform !== 'undefined')
                        colorTransform = !!this.colorTransform;

                    component1 = this.components[0];
                    component2 = this.components[1];
                    component3 = this.components[2];
                    component4 = this.components[3];
                    for (y = 0; y < height; y++) {
                        component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
                        component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
                        component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
                        component4Line = component4.lines[0 | (y * component4.scaleY * scaleY)];
                        for (x = 0; x < width; x++) {
                            if (!colorTransform) {
                                C = component1Line[0 | (x * component1.scaleX * scaleX)];
                                M = component2Line[0 | (x * component2.scaleX * scaleX)];
                                Ye = component3Line[0 | (x * component3.scaleX * scaleX)];
                                K = component4Line[0 | (x * component4.scaleX * scaleX)];
                            } else {
                                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
                                K = component4Line[0 | (x * component4.scaleX * scaleX)];

                                C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                                M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                                Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
                            }
                            data[offset++] = 255 - C;
                            data[offset++] = 255 - M;
                            data[offset++] = 255 - Ye;
                            data[offset++] = 255 - K;
                        }
                    }
                    break;
                default:
                    throw 'Unsupported color mode';
            }
            return data;
        },
        copyToImageData: function copyToImageData(imageData) {
            var width = imageData.width, height = imageData.height;
            var imageDataArray = imageData.data;
            var data = this.getData(width, height);
            var i = 0, j = 0, x, y;
            var Y, K, C, M, R, G, B;
            switch (this.components.length) {
                case 1:
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            Y = data[i++];
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = 255;
                        }
                    }
                    break;
                case 3:
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            R = data[i++];
                            G = data[i++];
                            B = data[i++];

                            imageDataArray[j++] = R;
                            imageDataArray[j++] = G;
                            imageDataArray[j++] = B;
                            imageDataArray[j++] = 255;
                        }
                    }
                    break;
                case 4:
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            C = data[i++];
                            M = data[i++];
                            Y = data[i++];
                            K = data[i++];

                            R = 255 - clampTo8bit(C * (1 - K / 255) + K);
                            G = 255 - clampTo8bit(M * (1 - K / 255) + K);
                            B = 255 - clampTo8bit(Y * (1 - K / 255) + K);

                            imageDataArray[j++] = R;
                            imageDataArray[j++] = G;
                            imageDataArray[j++] = B;
                            imageDataArray[j++] = 255;
                        }
                    }
                    break;
                default:
                    throw 'Unsupported color mode';
            }
        }
    };

    return constructor;
})();





function decode(arr, useTArray, buildtables) {
    var decoder = new JpegImage();
    decoder.parse(arr, buildtables);

    var image = {
        compNum: decoder.components.length,
        width: decoder.width,
        height: decoder.height,
        data: useTArray ?
          new Uint8Array(decoder.width * decoder.height * 4) :
          new Buffer(decoder.width * decoder.height * 4)
    };

    decoder.copyToImageData(image);

    return image;
}


function createQuantizationTables(quality, type) {


    var luminance_basic_table = [
        16, 11, 10, 16, 24, 40, 51, 61,
        12, 12, 14, 19, 26, 58, 60, 55,
        14, 13, 16, 24, 40, 57, 69, 56,
        14, 17, 22, 29, 51, 87, 80, 62,
        18, 22, 37, 56, 68, 109, 103, 77,
        24, 35, 55, 64, 81, 104, 113, 92,
        49, 64, 78, 87, 103, 121, 120, 101,
        72, 92, 95, 98, 112, 100, 103, 99
    ];
    var chrominance_basic_table = [
        17, 18, 24, 47, 99, 99, 99, 99,
        18, 21, 26, 66, 99, 99, 99, 99,
        24, 26, 56, 99, 99, 99, 99, 99,
        47, 66, 99, 99, 99, 99, 99, 99,
        99, 99, 99, 99, 99, 99, 99, 99,
        99, 99, 99, 99, 99, 99, 99, 99,
        99, 99, 99, 99, 99, 99, 99, 99,
        99, 99, 99, 99, 99, 99, 99, 99
    ];



    var tempQuantizationTable = new Uint32Array(64);

    if (quality <= 0) quality = 1;
    if (quality > 100) quality = 100;

    if (quality < 50)
        quality = 5000 / quality;
    else
        quality = 200 - quality * 2;


    var basic_table;
    basic_table = [luminance_basic_table, chrominance_basic_table][type];


    for (var i = 0; i < 64; i++) {
        temp = parseInt((basic_table[i] * quality + 50) / 100);
        if (temp <= 0)
            temp = 1;
        if (temp > 32767)
            temp = 32767; // why 12 bits?
        if (true && temp > 255)
            temp = 255;
        tempQuantizationTable[i] = temp;

    }

    return tempQuantizationTable;
}
