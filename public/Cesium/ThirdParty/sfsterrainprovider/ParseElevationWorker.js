importScripts('zlib.js');
importScripts('png.js');
importScripts('ElevDecompress.js');
importScripts('jpglib2.js');


self.addEventListener('message', function (e) {

    var data = e.data;
    
    data.rejected = false; 
    //data.zeroLevel = false; //for rejected data (when using MPT) - There are 6 mpt requests at the begining that should not be parsed for elevation. Nevertheless, we MUST NOT mark them as unavailiable tiles. 

    if (isPNG(data)) {
        var png = new PNG(new Uint8Array(data.buffer));

        //postMessage(JSON.stringify({ type: 'debug', msg: data.deferedId + " 1" }));
        var pixels = png.decodePixels();
        var out = new Int16Array(pixels.length / 2);

        for (var i = 0; i < pixels.length / 2; i++) {

            out[i] = (pixels[i * 2] << 8 | pixels[i * 2 + 1]);
            // -1 is null value, do not change
            if (out[i] != 65535) // -1 sint16
                out[i] = out[i] * 0.3048;
        }
        data.buffer = out;
        postMessage(data/*, [data.buffer.buffer]*/);
    }
    else if (isMPT(data)) {
        var bBoxSize = 96;
        var dv = new DataView(data.buffer);
        var dataBeginOffset = dv.getUint32(64, true);
        var dataSize = dv.getUint32(68, true);
        var extend = dv.getUint32(72, true);
        var parts = dv.getUint32(76, true);
        var sizeColor = (dv.getUint32(bBoxSize + 4, true) & 0xffffff) - (dv.getUint32(bBoxSize + 0, true) & 0xffffff);
        var sizeElevation = (dv.getUint32(bBoxSize + 8, true) & 0xffffff) - (dv.getUint32(bBoxSize + 4, true) & 0xffffff);
        var dataStreamBegin = bBoxSize + sizeColor + dataBeginOffset;
        var channelOffset = (dv.getUint32(dataStreamBegin + 0, true) & 0x00FFFFFF); //16
        var channelType = dv.getUint32(dataStreamBegin + 4, true);
        var channelData = String.fromCharCode((channelType) >> 24);
        var dataStartPoint = dataStreamBegin + channelOffset;
        var dataEndPoint = dataStartPoint + sizeElevation;

        if (channelData == 'N') {                                                                // PNG16.8
            var result = PNG16_8Decompress(data.buffer.slice(dataStartPoint, dataEndPoint));
            data.buffer = result;
            postMessage(data);
        }
        else if (channelData == 'B') {                                                              //JPEG
            var result = JPEGDecompress(data.buffer.slice(dataStartPoint, dataEndPoint));
            var out = new Float32Array(256*256);
           
            for (var i = 0; i < (256*256); i++) {
                out[i] = result[i];
            }

            // // for (var i = 0; i < 256 * 256; i++) {
            //     var value = Math.fmod(result[i], Math.pow(2, 32));
            //     if (value != 65535) {
            //         out[i] = value;
            //     }
            // }
            data.buffer = out;
            postMessage(data);
        }
        else if (channelData == 'A') {                                                              //PNG16
            var out = PNGDecompress(data.buffer.slice(dataStartPoint, dataEndPoint));
            data.buffer = out;
            postMessage(data);

        } else {  // debugging and other formats currently not supported
            
            data.rejected = true;
            postMessage(data);
            //var len = this.heightMapWidth * this.heightMapHeight;
            //var buf = new Int16Array(len);
            //var val = 0;
            //for (var i = 0; i < len; i++)
            //    buf[i] = val;

            //data.buffer = buf;
            //postMessage(data/*, [data.buffer.buffer]*/);
        }
    }
 
    else {

        // I dont know. reject.

        data.rejected = true;
        postMessage(data);
    }
               

});


function isPNG(data) {

    if (data.buffer.byteLength > 2) {
        var PNGArray = new Uint8Array(data.buffer.byteLength > 0 ? data.buffer.slice(1, 4) : 0);
        var _isPNG = ((PNGArray.length == 0) || (PNGArray[0] == 'P'.charCodeAt() && PNGArray[1] == 'N'.charCodeAt() && PNGArray[2] == 'G'.charCodeAt()));
        return _isPNG;
    }
    return false;
}

function isMPT(data) {

    if (data.buffer.byteLength > 80) {
        var bBoxSize = 96;
        var dv = new DataView(data.buffer);
        var dataBeginOffset = dv.getUint32(64, true);
        var dataSize = dv.getUint32(68, true);
        var extend = dv.getUint32(72, true);
        var parts = dv.getUint32(76, true);

        if (parts == 1) // There should be only one part
            return true;
        else
            return false;
    }
    return false;
}


//fmod
Math.fmod = function (a, b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

//random buffer should not be used... only for debugging
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//decompress JPEG - use jpglib2.js
function JPEGDecompress(array) {

    var minval = 0;
    var maxval = 0;
    var m_prelist;

    var byteArray = new Uint8Array(array);

    var dvJPEG = new DataView(byteArray.buffer);
    minval = dvJPEG.getFloat32(0,true); 
    maxval = dvJPEG.getFloat32(4, true);

    m_prelist = byteArray.slice(8, 8 + 256);   //  2* sizeof(float) + PRE_LISTSIZE

    var buffer8 = byteArray.slice(256 + 8, byteArray.byteLength);

    var jpegDecompressed = decode(buffer8, true, 1);

    if (!isNaN(jpegDecompressed.data[0])) {
        var jpegElev = new JPEGElevDecompress();
        var result = jpegElev.ElevDecompress(jpegDecompressed, m_prelist, minval, maxval);
        return result;
    } else {

      console.error("Error while JPEG Decompressing");
    }

}

//decompress png - use png.js library
function PNGDecompress(array) {

    var byteArray = new Uint8Array(array);

    var dvPNG = new DataView(array);

    var min = dvPNG.getFloat32(0, true);
    var max = dvPNG.getFloat32(4, true);
    var delta = max - min;

    var slicedArray = byteArray.slice(8, byteArray.buffer.byteLength);

    var png = new PNG(new Uint8Array(slicedArray));
    var pixels = png.decodePixels();


    var out = new Float32Array(pixels.length / 2);
    
    var dvwords = new DataView(pixels.buffer);
 

    for (var i = 0; i < pixels.length / 2; i++) {
        out[i] = dvwords.getUint16(i * 2);
        //out[i] = ( pixels[i*2]<<8 | pixels[i*2+1] );    
        // if (out[i] != 65535) // -1 sint
            out[i] = out[i] * delta/65535.0 + min;
    }

    return out;
}



// decompress PNG16.8 
function PNG16_8Decompress(array) {
    var sizeOne = 0;
    var sizeTwo = 0;

    var byteArray = new Uint8Array(array);

    var dv168 = new DataView(byteArray.buffer);

    sizeOne = dv168.getUint32(0,true);
    sizeTwo = dv168.getUint32(4,true);

    var channelSizeN = 8 + sizeOne + sizeTwo;

    //first buffer (words)
    var firstBuffer = byteArray.slice(8, 8 + sizeOne);
    var firstPNG = new PNG(new Uint8Array(firstBuffer));
    var pixels = firstPNG.decodePixels();
    var pixels1View = new DataView(pixels.buffer);

    //second buffer (bytes)
    var secondBuffer = byteArray.slice(8 + sizeOne,channelSizeN);
    var secondPNG = new PNG(new Uint8Array(secondBuffer));
    var pixels2 = secondPNG.decodePixels();
    var pixels2View = new DataView(pixels.buffer);

    var floatArray = new Float32Array(256*256);
    var feet2meter = 0.3048;
    for (var iii = 0; iii < 256; iii++)
        for (var jjj = 0; jjj < 256 ; jjj++) {
            floatArray[jjj + iii * 256] = (pixels1View.getInt16((jjj + iii * 256)*2) + pixels2[jjj + iii * 256] / 256) * feet2meter;
        }
    return floatArray;
}

