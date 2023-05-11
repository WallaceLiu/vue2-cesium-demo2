
(function () {


    var JPEGElevDecompress;

    JPEGElevDecompress = (function () {

        //fmod javascript
        Math.fmod = function (a, b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

        //constants
        aPRE_LINEBLOCKS = 16;
        aPRE_BLOCKSIZE = 16;
        aPRE_MINBITS = 4;
        aPRE_MAXBITS = 4;

        function JPEGElevDecompress() {

            //private members 
            this.m_arrfmin = new Float32Array(aPRE_LINEBLOCKS * aPRE_LINEBLOCKS);
            this.m_arrfmax = new Float32Array(aPRE_LINEBLOCKS * aPRE_LINEBLOCKS);

            this.floatBufferOut = new Float32Array(256 * 256);

        }

        JPEGElevDecompress.prototype.Decompress = function () {

            var minval = 0;
            var maxval = 0;


        }


        //function for decompression using the min max prelist method 
        JPEGElevDecompress.prototype.ElevDecompress = function (buffer8, prelist, minval, maxval) {
       //     maxval = (maxval - minval) * 10 + minval;
            var xx, yy;
            var prepos = 0;
            var kmin;
            var kmax;
            var delta = maxval - minval;

            var smalldelta = delta / ((1 << aPRE_MINBITS));
            var blockid = 0;

            for (yy = 0 ; yy < aPRE_LINEBLOCKS; yy++) {
                for (xx = 0; xx < aPRE_LINEBLOCKS; xx++) {
                    if (aPRE_MINBITS == 4 && aPRE_MAXBITS == 4) {
                        var num = prelist[prepos++];
                        kmin = num & 0xf;
                        kmax = num >> 4;
                    } else if (aPRE_MINBITS <= 8 && aPRE_MAXBITS <= 8) {
                        kmin = prelist[prepos++];
                        kmax = prelist[prepos++];
                    } else
                        console.error("Error - jpeg decompression");

                    var real_min = minval + smalldelta * kmin;
                    var smalldelta2 = (maxval - real_min) / ((1 << (2 * aPRE_MAXBITS)));
                    this.m_arrfmin[blockid] = real_min;

                    var real_max = real_min + smalldelta2 * ((kmax + 1) * (kmax + 1));
                    this.m_arrfmax[blockid] = real_max;

                    blockid++;
                }
            }

            blockid = 0;

            for (yy = 0; yy < aPRE_LINEBLOCKS; yy++) {

                for (xx = 0; xx < aPRE_LINEBLOCKS; xx++) {

                    var real_min = this.m_arrfmin[blockid];
                    var real_max = this.m_arrfmax[blockid];
                    var scale = (real_max - real_min) / 255.0;

                    if (real_min < scale && scale > 0.0) {
                        real_min += Math.fmod(Math.abs(real_min), scale);
                    }
                    var offset = real_min;

                    var add = xx * aPRE_BLOCKSIZE + yy * aPRE_BLOCKSIZE * 256;

                    for (var y = 0; y < aPRE_BLOCKSIZE; y++) {
                        for (var x = 0; x < aPRE_BLOCKSIZE; x++) {

                            var h8 = buffer8.data[add*4];
                            var height = h8 * scale + offset;
                            this.floatBufferOut.buffer[add] = height;
                            add++;
                        }
                        add += 256 - aPRE_BLOCKSIZE;
                    }
                    blockid++;
                }
            }
            return this.floatBufferOut.buffer;
        }
        return JPEGElevDecompress;
    })();

    this.JPEGElevDecompress = JPEGElevDecompress;

}).call(this);