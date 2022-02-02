
//文件 - IAnim.js
/**
 * Created by 七夕小雨 on 2016/11/7.
 */

function IAnim(bmps, z, viewport){
    /**
     * 是否重复播放动画
     */
    this.isLoop = false;
    /**
     * 动画播放的spriet对象
     */
    this.sanim = null;

    var statr = false;
    var bitmaps = new Array();
    var speed = 1;
    var index = 0;
    var speed_now = 1;
    var finishAnim = null;
    var onFrameAnim = {};
    var times = 0;

    var am = this;

    Object.defineProperty(this, "x", {
        get: function () {
            return am.sanim.x;
        },
        set: function (value) {
            am.sanim.x = value;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return am.sanim.y;
        },
        set: function (value) {
            am.sanim.y = value;
        }
    });

    Object.defineProperty(this, "z", {
        get: function () {
            return am.z;
        },
        set: function (value) {
            am.sanim.z = value;
        }
    });


    if(viewport == undefined){
        init(bmps,z,null);
    }else{
        init(bmps,z,viewport);
    }

    Object.defineProperty(this, "onload", {
        set: function (fc) {
            am.sanim.onload = function(){
                fc(am);
            }
        }
    });

    function init( bmps, z, viewport,fc){
        statr = false;
        am.isLoop = false;
        am.sanim = new ISprite(bmps[0],viewport);
        am.sanim.z = z;
        index = -1;
        bitmaps = bmps;
    }

    this.setPlaytimes = function(times){
        this.times = times;
    };

    this.setIndex = function(index){
        this.sanim.setBitmap(bitmaps[index]);
    };

    this.setXY = function(x,y){
        this.sanim.x = x;
        this.sanim.y = y;
    };

    this.setSpeed = function(s){
        speed = s;
        speed_now = s;
    };

    this.start = function () {
        statr = true;
        this.sanim.visible = true;
        this.sanim.setBitmap(bitmaps[0]);
        if(index >= bitmaps.length){
            index = -1;
        }
    };

    this.stop = function(){
        statr = false;
        this.sanim.visible = false;
        index = -1;
    };

    this.setBitmaps = function(bmps, isDispose){
        this.stop();
        if(isDispose){
            bitmaps = [];
        }
        bitmaps = bmps;
    };

    this.update = function(){
        if(!statr) return;
        if(speed_now > 0){
            speed_now -= 1;
            if(speed_now == 0){
                speed_now = speed;
                index += 1;
                if(index < bitmaps.length){
                    if(onFrameAnim[index] != null){
                        onFrameAnim[index](am);
                    }
                    this.sanim.setBitmap(bitmaps[index]);
                }else{
                    if(this.isLoop){
                        index = 0;
                        this.sanim.setBitmap(bitmaps[index]);
                    }else{
                        if(times > 0){
                            times -= 1;
                            index = 0;
                            return;
                        }
                        statr = false;
                        index = -1;
                        this.sanim.visible = false;
                        if(finishAnim != null){
                            finishAnim(am);
                        }
                    }
                }

            }
        }
    };


    this.pause = function(){
        statr = false;
    };

    this.isFinishd = function(){
        return !statr;
    };

    /**
     * 动画内存释放
     */
    this.dispose = function(){
        this.sanim.disposeMin();
        bitmaps = [];
    };

    this.disposeMin = function(){
        this.sanim.disposeMin();
    };

    this.setOnFinishAnim = function(ofa){
        finishAnim = ofa;
    };

    this.setOnFrameAnim = function(ofa,frame){
        onFrameAnim[frame] = ofa;
    };

    this.removeFrameAnim = function(frame){
        delete onFrameAnim[frame];
    };

    this.clearFrameAnim = function(){
        onFrameAnim = {};
    }

}

//文件 - IAudio.js
/**
 * Created by 七夕小雨 on 2016/11/7.
 */
function IAudio(){}

IAudio.bgm = null;
IAudio.bgs = null;
IAudio.se = null;
IAudio.voice = null;

IAudio.bgmText = "";
IAudio.bgsText = "";

IAudio.init = function(){};

IAudio.playSE = function(  fileName,  Volume){
    var fn = "";
    if(typeof(fileMap) != "undefined" && fileMap != null){
        fn = fileMap[fileName.replace("\\","/")];
        if(fn == null) fn = fileName;
    }else{
        fn = fileName;
    }
    if(IAudio.se != null){
        IAudio.se.stop();
        IAudio.se.unload();
    }
    IAudio.se = new Howl({
        src:[fn],
        autoplay:true,
        volume:Volume / 100
    });

};

IAudio.stopSE = function () {
    if(IAudio.se == null) return;
    IAudio.se.stop();
};

IAudio.playBGM = function(fileName,  Volume){
    var fn = "";
    if(typeof(fileMap) != "undefined" && fileMap != null){
        fn = fileMap[fileName.replace("\\","/")];
        if(fn == null) fn = fileName;
    }else{
        fn = fileName;
    }
    if(fn == IAudio.bgmText){
        IAudio.bgm.volume(Volume / 100);
        return;
    }
    if(IAudio.bgm != null){
        IAudio.bgm.stop();
        IAudio.bgm.unload();
    }
    IAudio.bgm = new Howl({
        src:[fn],
        loop:true,
        autoplay:true,
        volume:Volume / 100
    });
    IAudio.bgmText = fn;

};

IAudio.BGMCallBack = function(){
    if(IAudio.bgm == null) return;
    IAudio.bgm.play();
};

IAudio.stopBGM = function () {
    if(IAudio.bgm == null) return;
    IAudio.bgm.pause();
    IAudio.bgmText = "";
};

IAudio.BGMFade = function (time) {
    if(IAudio.bgm == null) return;
    IAudio.bgm.fade(IAudio.bgm.volume(),0,time * 1000);
};

IAudio.playVoice = function(  fileName,  Volume) {
    var fn = "";
    if(typeof(fileMap) != "undefined" && fileMap != null){
        fn = fileMap[fileName.replace("\\","/")];
        if(fn == null) fn = fileName;
    }else{
        fn = fileName;
    }
    if(IAudio.voice != null){
        IAudio.voice.stop();
        IAudio.voice.unload();
    }
    IAudio.voice = new Howl({
        src:[fn],
        autoplay:true,
        volume:Volume / 100
    });
};

IAudio.stopVoice = function () {
    if(IAudio.voice == null) return;
    IAudio.voice.stop();
};

IAudio.playBGS = function(fileName,  Volume){
    var fn = "";
    if(typeof(fileMap) != "undefined" && fileMap != null){
        fn = fileMap[fileName.replace("\\","/")];
        if(fn == null) fn = fileName;
    }else{
        fn = fileName;
    }
    if(fn == IAudio.bgsText){
        IAudio.bgs.volume(Volume / 100);
        return;
    }
    if(IAudio.bgs != null){
        IAudio.bgs.stop();
        IAudio.bgs.unload();
    }
    IAudio.bgs = new Howl({
        src:[fn],
        loop:true,
        autoplay:true,
        volume:Volume / 100
    });
    IAudio.bgsText = fn;
};

IAudio.stopBGS = function () {
    if(IAudio.bgs == null) return;
    IAudio.bgs.play();
};

IAudio.BGSFade = function (time) {
    if(IAudio.bgs == null) return;
    IAudio.bgs.fade(IAudio.bgs.volume(),0,time * 1000);
};

IAudio.update = function(){};



//var bgm = null;
//var se = null;
//var bgs = null;
//var voice = null;
//
//var bgmFTN = 0;
//var bgmFTM = 0;
//var bgmYV = 0;
//
//var bgsFTN = 0;
//var bgsFTM = 0;
//var bgsYV = 0;
//
//var bgmText = "";
//var bgsText = "";
//
//function IAudio(){}
//
//IAudio.cache =[];
//
//IAudio.isAuidoC = false;
//
//IAudio.seBuff = null;
//IAudio.seGainNode = null;
//
//IAudio.bgmBuff = null;
//IAudio.bgmGainNode = null;
//
//window.AudioContext = window.AudioContext || window.webkitAudioContext;
//if(!window.AudioContext){
//    IAudio.isAuidoC = false;
//}else{
//    IAudio.isAuidoC = true;
//}
//
//IAudio.init = function(){
//    if(IAudio.isAuidoC){
//        bgm    =  new AudioContext();
//        se = new AudioContext();
//    }else{
//        bgm    =  document.getElementById("bgm_audio");
//        se = null;
//    }
//    bgs    =  document.getElementById("bgs_audio");
//    voice  =  document.getElementById("voice_audio");
//};
//
//IAudio.playSE = function(  fileName,  Volume){
//    if(se == null) return;
//    var fn = "";
//    if(typeof(fileMap) != "undefined" && fileMap != null){
//        fn = fileMap[fileName.replace("\\","/")]
//    }else{
//        fn = fileName;
//    }
//
//    IAudio.seGainNode = se[se.createGain ? "createGain" :"createGainNode"]();
//    IAudio.seGainNode.connect(se.destination);
//    if(Volume == null){
//        Volume = 80;
//    }
//    IAudio.seGainNode.gain.value = (Volume / 100);
//    var cache = IAudio.FindCache(fn);
//    if(cache != null){
//        IAudio.PlayBuff(cache.buffer);
//    }else{
//        var xhr = new XMLHttpRequest();
//        xhr.abort();
//        xhr.open("get",fn);
//        xhr.responseType = "arraybuffer";
//        xhr.onload = function(){
//
//            IAudio.DecodeAudioData(fn,xhr.response);
//        };
//        xhr.send();
//    }
//
//    //se.src = IVal.baseMusicPath + fileName;
//    //se.load();
//    //se.volume = Volume / 100;
//    //se.play()
//};
//
//IAudio.stopSE = function () {
//    if(IAudio.seBuff != null){
//        IAudio.seBuff[IAudio.seBuff.start ? "stop" : "noteOff"](0)
//    }
//};
//
//
//IAudio.playBGM = function(fileName,  Volume){
//    var fn = "";
//    if(typeof(fileMap) != "undefined" && fileMap != null){
//        fn = fileMap[fileName.replace("\\","/")]
//    }else{
//        fn = fileName;
//    }
//    bgmFTM = 0;
//    bgmFTN = 0;
//    if(IAudio.isAuidoC){
//        if(fn == bgmText){
//            IAudio.bgmGainNode.gain.value = (Volume / 100);
//            return;
//        }
//        IAudio.bgmGainNode = bgm[bgm.createGain ? "createGain" :"createGainNode"]();
//        IAudio.bgmGainNode.connect(bgm.destination);
//        if(Volume == null){
//            Volume = 80;
//        }
//        IAudio.bgmGainNode.gain.value = (Volume / 100);
//        var cache = IAudio.FindCache(fn);
//        if(cache != null){
//            IAudio.PlayBuff(cache.buffer);
//        }else{
//            var xhr = new XMLHttpRequest();
//            xhr.abort();
//            xhr.open("get",fn);
//            xhr.responseType = "arraybuffer";
//            xhr.onload = function(){
//                IAudio.DecodeAudioData(fn,xhr.response);
//            };
//            xhr.send();
//        }
//    }else{
//        if(fn == bgmText){
//            bgm.volume = Volume / 100;
//            return;
//        }
//        bgm.src = IVal.baseMusicPath + fn;
//        bgmText = fn;
//        bgm.load();
//        bgm.volume = Volume / 100;
//        bgm.loop = "loop";
//        bgm.play();
//    }
//};
//
//IAudio.BGMCallBack = function(){
//    bgm.play();
//};
//
//IAudio.stopBGM = function () {
//    bgm.pause();
//    bgm.src = "";
//    bgmText = "";
//};
//
//IAudio.BGMFade = function (time) {
//    bgmFTN = time * IVal.FPS;
//    bgmFTM = time * IVal.FPS;
//    bgmYV = bgm.volume * 100
//};
//
//IAudio.playVoice = function(  fileName,  Volume) {
//    var fn = "";
//    if(typeof(fileMap) != "undefined" && fileMap != null){
//        fn = fileMap[fileName.replace("\\","/")]
//    }else{
//        fn = fileName;
//    }
//    voice.src = IVal.baseMusicPath + fn;
//    voice.load();
//    voice.volume = Volume / 100;
//    voice.play()
//};
//
//IAudio.stopVoice = function () {
//    voice.pause();
//};
//
//
//
//IAudio.playBGS = function(fileName,  Volume){
//    var fn = "";
//    if(typeof(fileMap) != "undefined" && fileMap != null){
//        fn = fileMap[fileName.replace("\\","/")]
//    }else{
//        fn = fileName;
//    }
//    bgsFTM = 0;
//    bgsFTN = 0;
//    if(fn == bgsText){
//        bgs.volume = Volume / 100;
//        return;
//    }
//    bgs.src = IVal.baseMusicPath + fn;
//    bgsText = fn;
//    bgs.load();
//    bgs.volume = Volume / 100;
//    bgs.loop = "loop";
//    bgs.play()
//};
//
//IAudio.stopBGS = function () {
//    bgs.pause();
//    bgs.src = "";
//    bgsText = "";
//
//};
//
//
//
//IAudio.BGSFade = function (time) {
//    bgsFTM = time * IVal.FPS;
//    bgsFTN = time * IVal.FPS;
//    bgsYV = bgs.volume * 100
//};
//
//function updateBGMFade(){
//    if(bgmFTM <= 0) return;
//    if(bgmFTN <= 0){
//        bgmFTM = 0;
//        return;
//    }
//    bgmFTN -= 1;
//    var vn = bgmYV * (bgmFTN / bgmFTM);
//    bgm.volume = vn / 100;
//
//}
//
//function updateBGSFade(){
//    if(bgsFTM <= 0) return;
//    if(bgsFTN <= 0){
//        bgsFTN = 0;
//        return;
//    }
//    bgsFTN -= 1;
//    var vn = bgsYV * (bgsFTN / bgsFTM);
//    bgs.volume = vn / 100;
//}
//
//IAudio.update = function(){
//    updateBGMFade();
//    updateBGSFade();
//};
//
//IAudio.FindCache = function(fileName){
//    for(var i = 0;i<IAudio.cache.length;i++){
//        if(IAudio.cache[i].file == fileName){
//            var audio = IAudio.cache[i];
//            IAudio.cache.remove(audio);
//            IAudio.cache.unshift(audio);
//            return audio;
//        }
//    }
//};
//
//IAudio.PlayBuff = function(buffer){
//    IAudio.seBuff = se.createBufferSource();
//    IAudio.seBuff.buffer = buffer;
//    IAudio.seBuff.connect(IAudio.seGainNode);
//    IAudio.seBuff[IAudio.seBuff.start ? "start" : "noteOn"](0);  //播放
//};
//
//IAudio.DecodeAudioData = function(fileName,arrayBuff){
//    se.decodeAudioData(arrayBuff,function(buffer){
//        IAudio.cache.unshift({
//            file : fileName,
//            buffer : buffer
//        });
//        if(IAudio.cache.length > 20){
//            IAudio.cache.pop();
//        }
//        IAudio.PlayBuff(buffer);
//    },function(err){
//        log(err);
//    });
//};
//
function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
    return ua.match(/MicroMessenger/i) == 'micromessenger';
}
if(isWeiXin()){
    //console.log(" 是来自微信内置浏览器")
}else{
    //console.log("不是来自微信内置浏览器")
}





//文件 - IBitmap.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function IBitmap(){}

IBitmap.GetPointPixel = function(img,x,y){
    ncanvas.width = img.width;
    ncanvas.height = img.height;
    ncont.clearRect(0,0,img.width,img.height);
    ncont.drawImage(img, 0, 0,img.width,img.height);
    var color = ncont.getImageData(x,y,1,1);
    return new IColor(color.data[0],color.data[1],color.data[2],color.data[3]);
};

IBitmap.ABitmap = function(path){
    var image = new Image();
    //image.crossOrigin = "anonymous";
    image.src = "res/" + path;

    return callImage(image);
};

IBitmap.WBitmap = function(path){
    var image = new Image();
    //image.crossOrigin = "anonymous";
    image.src = path;
    return callImage(image);
};

IBitmap.CBitmap = function(width,height){
    //ncanvas.width = width;
    //ncanvas.height = height;
    //ncont.clearRect(0,0,width,height);
    //var image = new Image();
    //image.src = ncanvas.toDataURL("image/png");
    //return image;
    return new CBmp(width,height);
};

IBitmap.toGrayscale = function(image){
    var img = new Image();
    img.src = image.src;
    img.alt = "tg";
    return img;
};

IBitmap.toGrayscaleDo = function(image){
    tcanvas.width = image.width;
    tcanvas.height = image.height;
    tcont.clearRect(0,0,image.width,image.height);
    tcont.drawImage(image,0,0);
    var canvasData = tcont.getImageData(0, 0, tcanvas.width, tcanvas.height);
    for ( var x = 0; x < canvasData.width; x++) {
        for (var y = 0; y < canvasData.height; y++) {
            var idx = (x + y * canvasData.width) * 4;
            var r = canvasData.data[idx];
            var g = canvasData.data[idx + 1];
            var b = canvasData.data[idx + 2];

            // calculate gray scale value
            var gray = .299 * r + .587 * g + .114 * b;

            // assign gray scale value
            canvasData.data[idx] = gray; // Red channel
            canvasData.data[idx + 1] = gray; // Green channel
            canvasData.data[idx + 2] = gray; // Blue channel
            canvasData.data[idx + 3] = 255; // Alpha channel
            // add black border
            if(x < 8 || y < 8 || x > (canvasData.width - 8) || y > (canvasData.height - 8))
            {
                canvasData.data[idx] = 0;
                canvasData.data[idx + 1] = 0;
                canvasData.data[idx + 2] = 0;
            }
        }
    }
    tcont.putImageData(canvasData, 0, 0); // at coords 0,0
    var img = new Image();
    //image.crossOrigin = "anonymous";
    img.src = tcanvas.toDataURL("image/png");
    return img;
};

function callImage(image){
    if(image.complete){
        return image;
    }else if(image.error != null){
        return null;
    }
    return image;
}

function CBmp(width,height){
    this.width = width;
    this.height = height;
}
//文件 - IBitmapCof.js
/**
 * Created by 七夕小雨 on 2018/6/11.
 */
function IBCof(bitmap,x,y,width,height){
    this.bitmap = bitmap;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.dispose = function(){
        this.bitmap = null;
    }
}
//文件 - IBox.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function IBox(vp){

    var hashMap = {};
    var keys = [];

    this.getSize = function () {
        var length = 0;
        for(var key in hashMap){
            var list = hashMap[key];
            for(var i = 0;i<list.length;i++){
                if(list[i] instanceof ISprite || list[i] instanceof  IDraw){
                    length += 1;
                }else{
                    length += list[i].zbox.getSize();
                }
            }
        }
        return length;
    };

    function sortNumber(a,b) {
        return a - b
    }

    this.add = function (plane) {
        if(hashMap[plane.z] == null){
            hashMap[plane.z] = [];
            keys = getKeys(hashMap).sort(sortNumber);
        }
        hashMap[plane.z].push(plane);
    };

    function getKeys(entry) {
        var keys = [];
        for (var prop in entry) {
            keys.push(prop);
        }
        return keys;
    }

    this.setZ = function(p,z){
        if(p.isNoZ(z)){
            return;
        }
        var pp = hashMap[p.getOldZ()];
        pp.remove(p);
        if(pp.length <= 0){
            delete hashMap[p.getOldZ()];
            keys = getKeys(hashMap).sort(sortNumber);
        }
        if(hashMap[z] == null){
            hashMap[z] = [];
            keys = getKeys(hashMap).sort(sortNumber);
        }
        p.setZ(z);
        hashMap[z].push(p);
        p.updateZ();
    };

    this.remove = function(p){
        hashMap[p.getOldZ()].remove(p);
    };

    this.getAll = function(){
        return hashMap;
    };


    this.update = function(){
        if(keys == null){return}
        //for(var i = 0;i < keys.length;i++){
        for(var i = keys.length - 1;i >= 0;i--){
            var list = hashMap[keys[i]];
            for(var j = list.length - 1;j>=0;j--){
                list[j].update();
            }
        }

    }
}
//文件 - IButton.js
/**
 * Created by 七夕小雨 on 2016/11/7.
 */

function IButton(bmp1,bmp2,txt,viewport,isNeedDraw){

    var image = [];
    var enableBitmap = null;
    var back = null;
    var draw1 = null;
    var draw2 = null;
    var name = "";
    var enable = false;
    var mouseOn = false;
    var index = 0;
    this.tag = null;
    var isMoved = false;
    var isNoUp = false;

    var x = 0;
    var y = 0;
    var z = 0;
    var zoomX = 0;
    var zoomY = 0;

    var opacity = 0;

    this.click = IVal.dSound;

    var type = -1;
    var sNum = 1.0;

    var oldZoom;


    this.drawTitle = function( str, x, y){
        if(x == undefined){
            x = -1;
        }
        if(y == undefined){
            y = -1;
        }
        draw1.clearBitmap();
        var w = IFont.getWidth(str, IVal.FontSize);
        var h = IFont.getHeight(str, IVal.FontSize);
        if(x == -1 && y == -1){
            draw1.drawText( str, (draw1.width - w) /2, (draw1.height - h) / 2);
        }else{
            draw1.drawText( str, x, y);
        }
        draw1.updateBitmap();
    };

    this.drawTitleQ = function( str, color, size){
        draw1.clearBitmap();
        var w = IFont.getWidth(str, size);
        var h = IFont.getHeight(str, size);
        draw1.drawTextQ(str, (draw1.width - w) /2, (draw1.height - h) / 2,color,size);
        draw1.updateBitmap();
    };

    var _sf = this;

    if(txt == undefined){
        txt = "";
    }
    name = txt;
    if(viewport == undefined){
        viewport = null;
    }
    if(isNeedDraw == undefined){
        isNeedDraw = false;
    }

    image[0] = bmp1;
    image[1] = bmp2;


    Object.defineProperty(this, "onload", {
        set: function (fc) {
            back.onload = function(){
                if(isNeedDraw){
                    draw2.width = back.width;
                    draw2.height = back.height;
                }
                if(name.length > 0){
                    draw1.width = back.width;
                    draw1.height = back.height;
                    draw1.clearBitmap();
                    _sf.drawTitleQ(name,IVal.FontColor,IVal.FontSize);
                }
                fc(_sf);
            }
        }
    });

    back = new ISprite(image[0],viewport);
    if(isNeedDraw){
        draw2 = new ISprite(IBitmap.CBitmap(back.width, back.height),viewport);
    }
    if(name.length > 0){
        draw1 = new ISprite(IBitmap.CBitmap(back.width, back.height),viewport);
        _sf.drawTitleQ(name,IVal.FontColor,IVal.FontSize);
    }
    enable = true;
    this.z = 0;

    this.toSimple = function(tp,sn){
        type = tp;
        sNum = sn;
        if(tp >= 0){
            back.yx = 0.5;
            back.yy = 0.5;
            if(draw2 != null){
                draw2.yx = 0.5;
                draw2.yy = 0.5;
            }else if(draw1 != null){
                draw1.yx = 0.5;
                draw1.yy = 0.5;
            }
        }
    };

    this.setYXYY = function(yx,yy){
        back.yx = yx;
        back.yy = yy;
        if(draw2 != null){
            draw2.yx = yx;
            draw2.yy = yy;
        }else if(draw1 != null){
            draw1.yx = yx;
            draw1.yy = yy;
        }
    };

    this.setBitmap = function( bmp1, bmp2, dispose){
        if(dispose){
            image[0] = null;
            image[1] = null;
        }
        image[0] = bmp1;
        image[1] = bmp2;
        back.setBitmap(image[0]);
        isMoved = false;
    };

    this.getSprite = function () {
        return draw2;
    };

    this.getText = function () {
        return draw1;
    };

    this.exchange = function(){
        var bmp = image[0];
        image[0] = image[1];
        image[1] = bmp;
    };


    this.dispose = function(){
        if(draw1 != null)draw1.dispose();
        if(draw2 != null)draw2.dispose();
        if(image[0] != null) {
            image[0] = null;
        }
        if(image[1] != null) {
            image[1] = null;
        }
        if(enableBitmap != null) {
            enableBitmap = null;
        }
        image = [];
        back.dispose();
    };

    this.disposeMin = function(){
        if(draw1 != null)draw1.disposeMin();
        if(draw2 != null)draw2.disposeMin();
        back.disposeMin();
    };

    this.isSelected = function(){
        return back.isSelected();
    };

    this.setEnableBitmap = function( bmp){
        enableBitmap = bmp;
    };

    this.setEnable = function( b){
        if(enableBitmap == null) return;
        enable = b;
        if(!b){
            back.setBitmap(enableBitmap);
        }else{
            back.setBitmap(image[0]);
        }
        isMoved = false;
    };

    this.getEnable = function(){
        return enable;
    };

    this.isClick = function(){
        if(!back.visible) return false;
        if(!enable) return false;
        var f = back.isSelectTouch() == 2;
        if(f && this.click != null) this.click.play();
        return f;
    };

    this.isDown = function(){
        return back.isSelected() && IInput.up;
    };

    this.isOn = function(){
        return mouseOn;
    };

    this.cancelSelect = function(){
        if(!mouseOn) return;
        mouseOn  = false;
        var bmp = image[mouseOn ? 1: 0];
        if(bmp != back.getBitmap()){
            back.setBitmap(bmp);
        }
    };

    this.getBack = function(){
        return back;
    };

    this.getX = function(){
        return back.x;
    };

    this.getY = function(){
        return back.y;
    };

    this.getZ = function(){
        return back.z;
    };

    this.setX = function(x){
        back.x = x;
        if(draw1 != null) draw1.x = x;
        if(draw2 != null) draw2.x = x;
    };

    this.setY = function(y){
        back.y = y;
        if(draw1 != null) draw1.y = y;
        if(draw2 != null) draw2.y = y;
    };

    this.setZ = function(z){
        back.z = z;
        if(draw1 != null) draw1.z = z + 2;
        if(draw2 != null) draw2.z = z + 1;
    };

    this.setZoomX = function(x){
        back.zoomX = x;
        if(draw1 != null) draw1.zoomX = x;
        if(draw2 != null) draw2.zoomX = x;
    };

    this.setZoomY = function(y){
        back.zoomY = y;
        if(draw1 != null) draw1.zoomY = y;
        if(draw2 != null) draw2.zoomY = y;
    };

    this.setVisible = function(v){
        back.visible = v;
        if(draw1 != null) draw1.visible = v;
        if(draw2 != null) draw2.visible = v;
    };

    this.width = function(){
        return back.width;
    };

    this.height = function(){
        return back.height;
    };

    this.setOpactiy = function(o){
        back.opacity = o;
        if(draw1 != null) draw1.opacity = o;
        if(draw2 != null) draw2.opacity = o;
    };

    Object.defineProperty(this, "x", {
        get: function () {
            return back.x;
        },
        set: function (value) {
            back.x = value;
            if(draw1 != null) draw1.x = value;
            if(draw2 != null) draw2.x = value;

        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return back.y;
        },
        set: function (value) {
            back.y = value;
            if(draw1 != null) draw1.y = value;
            if(draw2 != null) draw2.y = value;

        }
    });

    Object.defineProperty(this, "z", {
        get: function () {
            return back.z;
        },
        set: function (value) {
            back.z = value;
            if(draw1 != null) draw1.z = value + 1;
            if(draw2 != null) draw2.z = value + 2;

        }
    });

    Object.defineProperty(this, "zoomX", {
        get: function () {
            return back.zoomX;
        },
        set: function (value) {
            back.zoomX = value;
            if(draw1 != null) draw1.zoomX = value;
            if(draw2 != null) draw2.zoomX = value;

        }
    });

    Object.defineProperty(this, "zoomY", {
        get: function () {
            return back.zoomY;
        },
        set: function (value) {
            back.zoomY = value;
            if(draw1 != null) draw1.zoomY = value;
            if(draw2 != null) draw2.zoomY = value;

        }
    });

    Object.defineProperty(this, "visible", {
        get: function () {
            return back.visible;
        },
        set: function (value) {
            back.visible = value;
            if(draw1 != null) draw1.visible = value;
            if(draw2 != null) draw2.visible = value;

        }
    });

    Object.defineProperty(this, "opacity", {
        get: function () {
            return back.opacity;
        },
        set: function (value) {
            back.opacity = value;
            if(draw1 != null) draw1.opacity = value;
            if(draw2 != null) draw2.opacity = value;

        }
    });

    Object.defineProperty(this, "width", {
        get: function () {
            return back.width;
        },
        set: function (value) {}
    });

    Object.defineProperty(this, "height", {
        get: function () {
            return back.height;
        },
        set: function (value) {}
    });

    this.fade = function(bo, eo, frame){
        back.fade(bo,eo,frame);
        if(draw1 != null) draw1.fade(bo,eo,frame);
        if(draw2 != null) draw2.fade(bo,eo,frame);
    };

    this.fadeTo = function(o, frame){
        back.fadeTo(o, frame);
        if(draw1 != null) draw1.fadeTo(o, frame);
        if(draw2 != null) draw2.fadeTo(o, frame);
    };

    this.slide = function(bx, by,ex,ey, frame){
        back.slide(bx,by,ex,ey,frame);
        if(draw1 != null) draw1.slide(bx,by,ex,ey,frame);
        if(draw2 != null) draw2.sslide(bx,by,ex,ey,frame);
    };

    this.slideTo = function( x, y, frame){
        back.slideTo(x, y, frame);
        if(draw1 != null) draw1.slideTo(x , y , frame);
        if(draw2 != null) draw2.slideTo(x , y , frame);
    };

    this.scale = function( bzx, bzy,ezx,ezy, frame){
        back.scale(bzx,bzy,ezx,ezy,frame);
        if(draw1 != null) draw1.scale(bzx,bzy,ezx,ezy,frame);
        if(draw2 != null) draw2.scale(bzx,bzy,ezx,ezy,frame);
    };

    this.scaleTo = function( zx, zy, frame){
        back.scaleTo(zx, zy, frame);
        if(draw1 != null) draw1.scaleTo(zx ,zy , frame);
        if(draw2 != null) draw2.scaleTo(zx , zy , frame);
    };

    this.setAction = function(action,args){

        back.addAction.apply(back,arguments);
        if(draw1 != null) draw1.addAction.apply(draw1,arguments);
        if(draw2 != null) draw2.addAction.apply(draw2,arguments)
    };

    this.setActLoop = function( loop){
        back.actionLoop = loop;
        if(draw1 != null) draw1.actionLoop = loop;
        if(draw2 != null) draw2.actionLoop = loop;
    };

    this.getActLoop = function(){
        return back.actionLoop;
    };

    this.update = function(){
        if(!enable) return false;
        if(!back.visible) return false;
        var stutas = back.isSelectTouch();
        if(stutas == 2){
            if(this.click != null) this.click.play();
            return true;
        }
        mouseOn = isMoved || stutas == 1;
        if(type == -1){
            var bmp = image[mouseOn ? 1: 0];
            if(bmp != back.getBitmap()){
                back.setBitmap(bmp);
            }
        }else if(type == 0){
            var zoom = mouseOn ? sNum : 1.0;
            if(back.zoomX != zoom){
                back.zoomX = back.zoomY = zoom;
                if(draw1 != null){
                    draw1.zoomX = draw1.zoomY = zoom;
                }
                if(draw2 != null){
                    draw2.zoomX = draw2.zoomY = zoom;
                }
            }
        }
        return false;

    };


}
//文件 - ICheck.js
/**
 * Created by 七夕小雨 on 2016/11/8.
 */


function ICheck(bmp1,bmp2,txt,vp,select){

    var image = [];
    var checks = [];
    var back = null;
    var text = txt;
    var draw1 = null;
    this.mouseOn = false;
    var selected = false;
    var tempSelect = false;
    var tempMouseOn = false;
    this.tag = null;

    this.click = IVal.dSound;

    if(txt == undefined){
        text = "";
    }
    text = txt;
    if(vp == undefined){
        vp = null;
    }
    if(select == undefined){
        select = false;
    }
    selected = select;

    image = [bmp1,bmp2];

    this.drawTitle = function( str, x, y){
        if(x == undefined){
            x = -1;
        }
        if(y == undefined){
            y = -1;
        }
        draw1.clearBitmap();
        var w = IFont.getWidth(str, IVal.FontSize);
        var h = IFont.getHeight(str, IVal.FontSize);
        if(x == -1 && y == -1){
            draw1.drawText( str, (draw1.width - w) /2, (draw1.height - h) / 2);
        }else{
            draw1.drawText( str, x, y);
        }
        draw1.updateBitmap();
    }

    this.drawTitleQ = function( str, color, size){
        draw1.clearBitmap();
        var w = IFont.getWidth(str, size);
        var h = IFont.getHeight(str, size);
        draw1.drawTextQ(str, (draw1.width - w) /2, (draw1.height - h) / 2,color,size);
        draw1.updateBitmap();
    }

    var _sf = this;

    Object.defineProperty(this, "onload", {
        set: function (fc) {
            back.onload = function(){
                if(text.length > 0){
                    draw1.width = back.width;
                    draw1.height = back.height;
                    _sf.drawTitleQ(text,IVal.FontColor,IVal.FontSize);
                }
                fc(_sf);
            }
        }
    });

    back = new ISprite(selected ? image[0] : image[1],vp);
    tempSelect = false;
    tempMouseOn = false;

    if(text.length > 0){
        draw1 = new ISprite(IBitmap.CBitmap(back.width, back.height),vp);
        _sf.drawTitleQ(text,IVal.FontColor,IVal.FontSize);
    }

    this.getX = function(){
        return back.x;
    };

    this.getY = function(){
        return back.y;
    };

    this.setX = function( x){
        back.x = x;
        if(draw1 != null){
            draw1.x = x;
        }
    };

    this.setY = function(y){
        back.y = y;
        if(draw1 != null){
            draw1.y = y;
        }
    };

    this.setZ = function(z){
        back.z = z;
        if(draw1 != null){
            draw1.z = z + 1;
        }
    };

    this.getWidth = function(){
        return back.width;
    };

    this.getHeight = function(){
        return back.height;
    };

    this.getText = function(){
        return draw1;
    };

    this.getBack = function(){
        return back;
    };

    this.setVisible = function( v){
        back.visible = v;
        if(draw1 != null){
            draw1.visible = v;
        }
    };


    this.setOpacity = function( o){
        back.opacity = o;
        if(draw1 != null){
            draw1.opacity = o;
        }
    };

    Object.defineProperty(this, "x", {
        get: function () {
            return back.x;
        },
        set: function (value) {
            back.x = value;
            if(draw1 != null) draw1.x = value;

        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return back.y;
        },
        set: function (value) {
            back.y = value;
            if(draw1 != null) draw1.y = value;

        }
    });

    Object.defineProperty(this, "z", {
        get: function () {
            return back.z;
        },
        set: function (value) {
            back.z = value;
            if(draw1 != null) draw1.z = value + 1;

        }
    });

    Object.defineProperty(this, "zoomX", {
        get: function () {
            return back.zoomX;
        },
        set: function (value) {
            back.zoomX = value;
            if(draw1 != null) draw1.zoomX = value;

        }
    });

    Object.defineProperty(this, "zoomY", {
        get: function () {
            return back.zoomY;
        },
        set: function (value) {
            back.zoomY = value;
            if(draw1 != null) draw1.zoomY = value;

        }
    });

    Object.defineProperty(this, "visible", {
        get: function () {
            return back.visible;
        },
        set: function (value) {
            back.visible = value;
            if(draw1 != null) draw1.visible = value;

        }
    });

    Object.defineProperty(this, "opacity", {
        get: function () {
            return back.opacity;
        },
        set: function (value) {
            back.opacity = value;
            if(draw1 != null) draw1.opacity = value;
        }
    });

    Object.defineProperty(this, "width", {
        get: function () {
            return back.width;
        },
        set: function (value) {}
    });

    Object.defineProperty(this, "height", {
        get: function () {
            return back.height;
        },
        set: function (value) {}
    });

    this.fade = function(bo, eo, frame){
        back.fade(bo,eo,frame);
        if(draw1 != null) draw1.fade(bo,eo,frame);
    };

    this.fadeTo = function(o, frame){
        back.fadeTo(o, frame);
        if(draw1 != null) draw1.fadeTo(o, frame);
    };

    this.slide = function(bx, by,ex,ey, frame){
        back.slide(bx,by,ex,ey,frame);
        if(draw1 != null) draw1.slide(bx,by,ex,ey,frame);
    };

    this.slideTo = function( x, y, frame){
        back.slideTo(x, y, frame);
        if(draw1 != null) draw1.slideTo(x , y , frame);
    };

    this.scale = function( bzx, bzy,ezx,ezy, frame){
        back.scale(bzx,bzy,ezx,ezy,frame);
        if(draw1 != null) draw1.scale(bzx,bzy,ezx,ezy,frame);
    };

    this.scaleTo = function( zx, zy, frame){
        back.scaleTo(zx, zy, frame);
        if(draw1 != null) draw1.scaleTo(zx ,zy , frame);
    };

    this.setAction = function(action,args){
        back.addAction.apply(back,arguments);
        if(draw1 != null) draw1.addAction.apply(draw1,arguments);
    };

    this.width = function(){
        return sprBack.width;
    };

    this.height = function(){
        return sprBack.height;
    };

    this.setZoomX = function( zoomX){
        back.zoomX = zoomX;
        if(draw1 !=  null){
            draw1.zoomX = zoomX;
        }
    };

    this.setZoomY = function( zoomY){
        back.zoomY = zoomY;
        if(draw1 !=  null){
            draw1.zoomY = zoomY;
        }
    };

    this.setActLoop = function( loop){
        back.actionLoop = loop;
        if(draw1 != null) draw1.actionLoop = loop;
    };

    this.getActLoop = function(){
        return back.actionLoop;
    };

    this.setOtherCheck = function(ck){
        checks = ck;
    };

    this.dispose = function(){
        if(draw1 != null)draw1.dispose();
        if(image[0] != null) {
            image[0] = null;
        }
        if(image[1] != null) {
            image[1] = null;
        }
        image = [];
        back.dispose();
    };

    this.disposeMin = function(){
        if(draw1 != null)draw1.disposeMin();
        back.disposeMin();
    };

    this.setSelected = function( s) {
        selected = s;
    };

    this.clickBox = function(){
        if(checks != null){
            for(var i = 0;i<checks.length;i++){
                checks[i].setSelected(false);
            }
        }
        if(this.click != null) this.click.play();
        selected = true;
    };

    this.isClick = function(){
        return this.mouseOn;
    };

    this.isMouseOn = function(){
        return back.isSelect() && IInput.up;
    };

    function updateMoveOn(){
        if(tempSelect != selected || tempMouseOn != this.mouseOn){
            if(selected){
                back.setBitmap(image[1]);
                tempMouseOn = this.mouseOn;
                tempSelect = selected;
            }else{
                var btm = image[this.mouseOn ? 1 : 0];
                if(btm != back.getBitmap()){
                    back.setBitmap(btm);
                }
                tempMouseOn = this.mouseOn;
                tempSelect = selected;
            }
        }
    }

    this.update = function(){
        if(!back.visible) return;
        updateMoveOn();
        this.mouseOn = back.isSelectTouch() == 2;
        if(this.mouseOn){
            this.clickBox();

            return true;
        }
        return false;

    }


}
//文件 - IColor.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */
function IColor() {
    this.R = 0;
    this.G = 0;
    this.B = 0;
    this.A = 0;

    if(arguments.length == 1){
        var arg = arguments[0].split(",");
        if(arg.length == 4){
            this.R = parseInt(arg[0]);
            this.G = parseInt(arg[1]);
            this.B = parseInt(arg[2]);
            this.A = parseInt(arg[3]);
        }else if(arg.length == 3){
            this.R = parseInt(arg[0]);
            this.G = parseInt(arg[1]);
            this.B = parseInt(arg[2]);
            this.A = 255;
        }
    }else if (arguments.length == 4) {
        this.R = arguments[0];
        this.G = arguments[1];
        this.B = arguments[2];
        this.A = arguments[3];
    } else if(arguments.length == 3){
        this.R = arguments[0];
        this.G = arguments[1];
        this.B = arguments[2];
        this.A = 255;
    }

    this.JColor = function(){
        var a = parseFloat(this.A) / 255.0;
        return "rgba(" + this.R +"," +this.G +"," + this.B + "," + a +")";
    };

    this.TColor = function(){
        return "\\c[" + this.R +"," +this.G +"," + this.B + "]";
    }

}

IColor.Black = function () {
    return new IColor(0, 0, 0);
};

IColor.White = function () {
    return new IColor(255, 255, 255);
};

IColor.Red = function () {
    return new IColor(255, 0, 0);
};

IColor.Blue = function () {
    return new IColor(0, 0, 255);
};

IColor.Green = function () {
    return new IColor(0, 255, 0);
};

IColor.Transparent = function () {
    return new IColor(0, 0, 0, 0);
};

IColor.CreatColor = function (r, g, b) {
    return new IColor(r, g, b, 255);
};

//文件 - IDraw.js
/**
 * Created by 七夕小雨 on 2018/7/26.
 */
function IDraw(viewprot){

    this.plane = IPlane;
    this.plane();
    delete this.plane;

    var _sf = this;

    var drawList = [];
    this.width = 1;
    this.height = 1;

    this.lighter = false;
    this.black = false;

    var ctx = cont;

    this.viewport = viewprot;

    if (viewprot == null) {
        this.fbox = box;
    }else{
        this.fbox = viewprot.zbox;
    }
    this.fbox.add(this);

    this.mode = IDraw.colorMode.none;


    this.drawRect = function(c,width,height){
        var r = new IRect(0,0,width,height);
        drawList.push({
            type : 0,
            color : c,
            rect : r
        });
        if(width > _sf.width){
            _sf.width = width;
        }
        if(height > _sf.height){
            _sf.height = height;
        }
    };

    this.drawLineGra = function(sX,sY,eX,eY,colors,width,height){
        var r = new IRect(0,0,width,height);
        var my_gradient = ctx.createLinearGradient(sX,sY,eX,eY);
        for(var i = 0;i<colors.length;i++){
            my_gradient.addColorStop(colors[i].num , colors[i].color.JColor());
        }

        drawList.push({
            type : 1,
            grd : my_gradient,
            rect : r
        });
        if(width > _sf.width){
            _sf.width = width;
        }
        if(height > _sf.height){
            _sf.height = height;
        }
    };

    this.drawRadialGra = function(sX, sY, sR, eX, eY, eR,colors,width,height){
        var grdCirle = ctx.createRadialGradient(sX, sY, sR, eX, eY, eR);
        var r = new IRect(0,0,width,height);
        //(xStart,yStart,radiusStart)起点圆的中心点坐标和半径，（xEnd,yEnd,radiusEnd）终点圆的中心点坐标和半径
        for(var i = 0;i<colors.length;i++){
            grdCirle.addColorStop(colors[i].num , colors[i].color.JColor());
        }
        drawList.push({
            type : 2,
            grd : grdCirle,
            rect : r
        });
        if(width > _sf.width){
            _sf.width = width;
        }
        if(height > _sf.height){
            _sf.height = height;
        }
    };

    this.AllImage = function(image,width,height){
        var r = new IRect(0,0,width,height);
        drawList.push({
            type : 3,
            image : image,
            rect : r
        });
    };

    this.update = function(){
        this.updatebase();
        var tempRt1 = this.viewport != null ? this.viewport.GetRect() : new IRect(0,0,IVal.GWidth,IVal.GHeight);
        if(this.opacity > 0 && this.visible) {
            var tx = this.x;
            var ty = this.y;
            if(this.viewport != null){
                tx += this.viewport.x + this.viewport.ox;
                ty += this.viewport.y + this.viewport.oy;
            }
            var tempRt2 = new IRect(tx,ty,tx + this.width * this.zoomX,ty + this.height * this.zoomY);
            var sw = tempRt2.intersects(tempRt1);
            if(sw == false){
                return;
            }
            IVal.updateNumSp += 1;
            ctx.save();
            ctx.globalCompositeOperation = this.mode;
            ctx.translate(tx, ty);
            ctx.rotate(Math.PI / 180 * this.angle);
            ctx.scale(this.zoomX,this.zoomY);
            ctx.globalAlpha = this.opacity;

            for(var i = 0; i < drawList.length;i++){
                var draw = drawList[i];
                if(draw.type == 0){//画个块
                    ctx.fillStyle = draw.color;
                    ctx.fillRect(draw.rect.left,draw.rect.top,draw.rect.width,draw.rect.height);
                }else if(draw.type == 1){//线性渐变
                    ctx.fillStyle = draw.grd;
                    ctx.fillRect(draw.rect.left,draw.rect.top,draw.rect.width,draw.rect.height);
                }else if(draw.type == 2){//径向渐变
                    ctx.fillStyle = draw.grd;
                    ctx.fillRect(draw.rect.left,draw.rect.top,draw.rect.width,draw.rect.height);
                }else if(draw.type == 3){
                    ctx.fillStyle = ctx.createPattern(draw.image,"repeat");
                    ctx.rect(draw.rect.left,draw.rect.top,draw.rect.width,draw.rect.height);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    };

    this.clear = function(){
        drawList = [];
    };

    this.dispose = function(){
        this.fbox.remove(this);
        drawList = [];
    }
}

IDraw.colorMode = {
    add : "lighter",
    reduce : "destination-out",
    none : "source-over"
};
//文件 - IFont.js
/**
 * Created by 七夕小雨 on 2016/11/7.
 */

function IFont(){

}

IFont.getWidth = function(txt,size){
    cont.font = size + "px "+IVal.FontName;
    return cont.measureText(txt).width;
};


IFont.getHeight = function (txt,size) {
    //var spanDom = document.getElementById("textSize");
    //spanDom.style.fontFamily = IVal.FontName;
    //spanDom.style.fontSize = size;
    //
    //spanDom.innerHTML = txt;
    cont.font = size + "px "+IVal.FontName;
    //var h = cont.measureText("口").width * (size / 18);
    var h = cont.measureText("口").width + 1 ;
    return h;
    //var h = spanDom.offsetHeight;
    //spanDom.innerHTML = "";
    //return h;
    //return size * 1;
};

IFont.toGroups = function(text){
    var args = [];
    var last = "";
    var gStr = "";
    var wait = false;
    for(var i = 0;i<text.length;i++){
        var min = text.substr(i,1);
        if(min == "["){
            wait = true;
        }
        if(min == "]" && wait){
            wait = false;
        }
        if((IFont.LastSymbol.indexOf(last) >= 0 && !wait) || IFont.NoneSymbol.indexOf(last) >= 0
            || (IFont.CheckText(last) && IFont.CheckText(min))){
            args.push(gStr);
            gStr = min;
        }else{
            gStr += min;
        }
        if(i == text.length - 1){
            args.push(gStr);
        }
        last = min;
    }

    return args;
};

IFont.CheckText = function(str){
    var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u3040-\\u309F\\u30A0-\\u30FF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u0E00-\\u0E7F]+","g");
    if(reg.test(str)){
        return true;
    }
    return false;
};

IFont.LastSymbol = ["!",")",",",".",":",";","?","]","}","¨","·","ˇ","ˉ","―","‖","’","”","…","∶","、","。","〃",
    "々","〉","》","」","』","】","〕","〗","！","＂","＇","）","，","．","：","；","？","］","｀","｜","｝","～","￠"];

IFont.NoneSymbol = [" ","   ","　"];
//文件 - IInput.js
function IInput() {
}

IInput.down = false;

IInput.Tlong = false;

IInput.move = false;

IInput.up = false;

IInput.tx = 0;
IInput.dx = 0;
IInput.x = 0;
IInput.ty = 0;
IInput.dy = 0;
IInput.y = 0;
IInput.mouseButton = 0;

IInput.touches = [];

IInput.BackButton = false;
IInput.HomeButton = false;
IInput.MenuButton = false;


IInput.keyCodeAry = [];
IInput.keyCodeDelAry = [];

IInput.keyDown = false;
IInput.keyUp = false;


IInput.isKeyDown = function(keyCode){
	for (var i = 0; i < IInput.keyCodeAry.length; i++) {
		var key = IInput.keyCodeAry[i];
		if(key == keyCode){
			if(IInput.keyCodeDelAry.indexOf(keyCode) < 0){
				IInput.keyCodeDelAry.push(keyCode);
			}
			//IInput.keyCodeAry.splice(i, 1);
			return true;
		}
	}
	return false;
};

IInput.isKeyPress = function(keyCode){
	for (var i = 0; i < IInput.keyCodeAry.length; i++) {
		var key = IInput.keyCodeAry[i];
		if(key == keyCode){
			return true;
		}
	}
	return false;
};

IInput.RecoveryKey = function(){
	for(var i = 0;i<IInput.keyCodeDelAry.length;i++){
		var index = IInput.keyCodeAry.indexOf(IInput.keyCodeDelAry[i]);
		if(index >= 0){
			IInput.keyCodeAry.splice(index, 1);
		}
	}
	IInput.keyCodeDelAry = [];
};
//文件 - IInputBox.js
/**
 * Created by 七夕小雨 on 2021/6/7.
 */
function IInputBox(w,h,backGround,borderColor,padding_w,padding_h){

    var x = 0,y = 0;//对应画布的X，Y坐标
    var fontSize = 14;//设置对应的字号
    var fontColor = new IColor(255,255,255);


    var align = 0;

    var width = 150;
    var height = 14;

    if2dNotZoomCanvas = true;

    //实例化CnavasInput对象
    var input = new CanvasInput({
        canvas: canvas,
        boxShadow : "none",
        innerShadow :  "none",
        padding_w: padding_w,
        padding_h :padding_h,
        width: w,
        height : h,
        backgroundColor : backGround.JColor(),
        borderColor : borderColor.JColor(),
        borderWidth : 2
    });

    //设置x坐标
    Object.defineProperty(this, "x", {
        get: function () {
            return x;
        },
        set: function (value) {
            x = value;
            input.x(x);
        }
    });

    //设置y坐标
    Object.defineProperty(this, "y", {
        get: function () {
            return y;
        },
        set: function (value) {
            y = value;
            input.y(y);
        }
    });

    Object.defineProperty(this, "fontSize", {
        get: function () {
            return fontSize;
        },
        set: function (value) {
            fontSize = value;
            input.fontSize(fontSize);
        }
    });

    Object.defineProperty(this, "fontColor", {
        get: function () {
            return fontColor;
        },
        set: function (value) {
            fontColor = value;
            var tempColor16 = "#" + fontColor.R.toString(16) + fontColor.G.toString(16) + fontColor.B.toString(16);
            input.fontColor(tempColor16);
        }
    });

    Object.defineProperty(this, "align", {
        get: function () {
            return align;
        },
        set: function (value) {
            align = value;
            input.align(align);
        }
    });

    Object.defineProperty(this, "width", {
        get: function () {
            return width;
        },
        set: function (value) {
            width = value;
            input.width(width);
        }
    });

    Object.defineProperty(this, "height", {
        get: function () {
            return height;
        },
        set: function (value) {
            height = value;
            input.height(height);
        }
    });


    this.update = function(){
        input.render();
    };

    this.setBorderRadius = function(radius){
        input.borderRadius(radius)
    };

    this.setBackgroundColor = function(color){
        input.backgroundColor(color.JColor());
        input.borderColor(color.JColor());
    };

    this.setFontSize = function(size){
        input.fontSize(size);
    };

    this.setText = function(text){
        input.value(text);
    };

    this.getText = function(){
        return input._value;
    };

    this.focus = function(){
        input.focus(0);
    };

    this.blur = function(){
        input.blur(0);
    };

    this.dispose = function(){
        if2dNotZoomCanvas = false;
        input.destroy();
    }



}
//文件 - ILine.js
/**
 * Created by 七夕小雨 on 2021/2/19.
 */
function ILine(){

    this.point1 = new IPoint(0,0);
    this.point2 = new IPoint(1,1);

    if(arguments.length == 4){
        this.point1.x = arguments[0];
        this.point1.y = arguments[1];
        this.point2.x = arguments[2];
        this.point2.y = arguments[3];
    }else if(arguments.length == 2 && arguments[0] instanceof IPoint && arguments[1] instanceof IPoint){
        this.point1 = arguments[0];
        this.point2 = arguments[1];
    }


}

//判断两个线段是否相交
ILine.IsSegmentsIntersectant = function(lineA, lineB) {
    var abc = (lineA.point1.x - lineB.point1.x) * (lineA.point2.y - lineB.point1.y) -
        (lineA.point1.y - lineB.point1.y) * (lineA.point2.x - lineB.point1.x);
    var abd = (lineA.point1.x - lineB.point2.x) * (lineA.point2.y - lineB.point2.y) - (
        lineA.point1.y - lineB.point2.y) * (lineA.point2.x - lineB.point2.x);
    if (abc * abd >= 0) {
        return false;
    }
    var cda = (lineB.point1.x - lineA.point1.x) * (lineB.point2.y - lineA.point1.y) -
        (lineB.point1.y - lineA.point1.y) * (lineB.point2.x - lineA.point1.x);
    var cdb = cda + abc - abd;
    return !(cda * cdb >= 0);
};
//文件 - IParticle.js
/**
 * Created by 七夕小雨 on 2016/11/9.
 */
function IParticle(bitmaps , num,tm,tp,viewport){
    var sprites = [];

    this.line = 0;
    this.dir = 0;
    this.rect = new IRect(0,0,10,10);

    this.radii = 10;

    this.x = 0;
    this.y = 0;

    var type = tp;
    var time = tm;

    var pos = 0;

    for(var i = 0;i<num;i++){
        sprites[i] = new ISprite(bitmaps[pos],viewport);
        sprites[i].x = this.rect.left + rand(0,this.rect.width);
        sprites[i].y = this.rect.top + rand(0,this.rect.height);
        sprites[i].opacity = 0;
        if(tp == 1){
            sprites[i].yx = 0.5;
            sprites[i].yy = 0.5;
        }
        pos = i % bitmaps.length;
    }

    this.changeParticle = function(bitmaps, num, tim, tp, viewport){
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].disposeMin();
        }

        pos = 0;
        type = tp;
        time = tim;
        sprites = new Array(num);
        for (i = 0; i < sprites.length; i++) {
            sprites[i] = new ISprite(bitmaps[pos],viewport);
            sprites[i].x = this.rect.left + rand(0,this.rect.width);
            sprites[i].y = this.rect.top + rand(0,this.rect.height);
            sprites[i].opacity = 0;
            pos = i % bitmaps.length;
        }
    };

    Object.defineProperty(this, "z", {
        get: function () {
            return sprites[0].z;
        },
        set: function (value) {
            for (var i = 0; i < sprites.length; i++) {
                sprites[i].z = value;
            }
        }
    });

    this.dispose = function(){
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].dispose();
        }
        sprites = null;
    };

    this.play = function(){
        if(sprites == null)return;
        for (var i = 0; i < sprites.length; i++) {
            if(sprites[i].isAnim()) continue;
            if(type == 0){
                var ftime = (time / 2)  + rand(0,time);
                sprites[i].opacity = 1.0;
                sprites[i].fadeTo(0, ftime);
                sprites[i].x = this.rect.left + rand(0,this.rect.width);
                sprites[i].y = this.rect.top + rand(0,this.rect.height);
                sprites[i].zoomY = sprites[i].zoomX = 1.0 - 0.5 * Math.random();
                switch (this.dir) {
                    case 0:
                        sprites[i].slideTo(sprites[i].x, sprites[i].y - this.line, ftime);
                        break;
                    case 1:
                        sprites[i].slideTo(sprites[i].x, sprites[i].y + this.line, ftime);
                        break;
                    case 2:
                        sprites[i].slideTo(sprites[i].x - this.line, sprites[i].y, ftime);
                        break;
                    case 3:
                        sprites[i].slideTo(sprites[i].x + this.line, sprites[i].y, ftime);
                        break;
                    case 4:
                        sprites[i].slideTo(sprites[i].x - this.line, sprites[i].y - this.line, ftime);
                        break;
                    case 5:
                        sprites[i].slideTo(sprites[i].x + this.line, sprites[i].y - this.line, ftime);
                        break;
                    case 6:
                        sprites[i].slideTo(sprites[i].x - this.line, sprites[i].y + this.line, ftime);
                        break;
                    case 7:
                        sprites[i].slideTo(sprites[i].x + this.line, sprites[i].y + this.line, ftime);
                        break;
                }
            }else if(type == 1){
                var d = rand(0,360);
                var angle = Math.PI * d  / 180.0;
                var endx = this.x + parseInt(Math.cos(angle) * this.radii);
                var endy = this.y + parseInt(Math.sin(angle) * this.radii);
                sprites[i].opacity = 1.0;
                sprites[i].angle = rand(0,360);
                ftime = (time / 2)  + rand(0,time);
                sprites[i].slide(this.x, this.y, endx, endy, ftime);
                sprites[i].fadeTo(0, ftime);
                sprites[i].zoomY = sprites[i].zoomX = 1.0 - 0.5 * Math.random();
                sprites[i].scaleTo(0.1, 0.1, ftime);
            }
        }
    };

    this.update = function(){
        this.play();
    }


}

//文件 - IPlane.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function IPlane(){

    this.fbox = null;

    this.x = 0;
    this.y = 0;
    var z = 0;
    this.zoomX = 1.0;
    this.zoomY = 1.0;

    this.angle = 0;
    this.opacity = 1.0;
    this.visible = true;
    this.mirror = false;

    this.tempZ = 0;
    this.wait = 0;
    this.actionList = [];
    this.tempActionList = [];
    this.actionLoop = false;

    this.color = IColor.Transparent();

    this.speedX = 0;
    this.aSpeedX = 0;
    this.speedY = 0;
    this.aSpeedY = 0;
    //颜色相关
    var colorFrames = 0;
    var endColorA = 0;
    var diffColorA = 0;
    var tempColorA = 0;
    //渐变相关
    var fadeFrames = 0;
    var endOpactiy = 0;
    var diffO = 0;
    var tmpOpacity = 0;
    //缩放相关
    var scaleFrames = 0;
    var endZoomX = 0;
    var endZoomY = 0;
    var diffZoomX = 0;
    var diffZoomY = 0;
    var tmpZoomX = 0;
    var tmpZoomY = 0;
    //位移相关
    var slideFrames = 0;
    var endX = 0;
    var endY = 0;
    var diffX = 0;
    var diffY = 0;
    var tmpX = 0;
    var tmpY = 0;
    //旋转相关
    var tmpRotateSpeed = 0;
    var tempAngel = 0.0;
    var endAngel = 0.0;
    var diffAngel = 0.0;
    var rotateFrames = 0.0;
    // 抛物线
    var tmpA = 0;
    var tmpB = 0;
    var tmpC = 0;
    var PstartX = 0;
    var diffPX = 0;
    var tmpPX = 0;
    var tmpYBase = 0;
    var LeftPX = false;
    var parabolaFrames = 0;

    this.tag = null;

    var pl = this;
    var isPause = false;

    var onEndAction;
    var onEndActionOne;
    var onEndFade;
    var onEndFlash;
    var onEndParabola;
    var onEndRotae;
    var onEndScale;
    var onEndSlide;
    var onEndWait;


    Object.defineProperty(this, "z", {
        get: function () {
            return z;
        },
        set: function (value) {
            if(pl.fbox != null){
                pl.fbox.setZ(pl,value);
            }

        }
    });

    this.updatebase = function(){
        if(isPause) return;
        updateFlash();
        updateFade();
        updateScale();
        updateSlide();
        updateRotate();
        rotateUpdate();
        parabolaupdate();
        if(this.wait > 0){
            this.wait -= 1;
            if(this.wait <= 0){
                if(onEndWait != null){
                    onEndWait(pl);
                }
            }
            return;
        }
        if(this.actionList.length > 0){
            this.actionList[0].doThis();
            this.actionList.splice(0,1);
            if(onEndActionOne != null && this.actionList.length <= 0){
                onEndActionOne(pl);
            }
            if(this.actionList.length == 0){
                if(onEndAction != null && this.actionList.length <= 0){
                    onEndAction(pl);
                }
            }
        }
        if(this.actionLoop && this.actionList.length == 0){
            for(var i = 0;i<this.tempActionList.length;i++){
                var action = this.tempActionList[i];
                this.actionList.push(action);
            }
        }


    };

    this.endAction = function(){
        this.actionList = [];
        this.tempActionList = [];
        this.actionLoop = false;
    };
    
    this.isAnim = function () {
        return fadeFrames > 0 || slideFrames > 0 || scaleFrames > 0 || rotateFrames > 0 || this.wait > 0 || this.actionList.length > 0;
    };

    this.pauseAnim = function(){
        fadeFrames = 0;
        slideFrames = 0;
        scaleFrames = 0;
        rotateFrames = 0;
        colorFrames = 0;
        this.wait = 0;
        this.actionList = [];
        this.stopRotate();
    };

    this.pause = function () {
        isPause = true;
    };

    this.restart = function(){
        isPause = false;
    };

    this.isPause = function(){
        return isPause;
    };
    
    this.stopAnim = function () {
        if(fadeFrames > 0){
            fadeFrames = 0;
            this.opacity = endOpactiy;
        }
        if(slideFrames > 0){
            slideFrames = 0;
            this.x = endX;
            this.y = endY;
        }
        if(scaleFrames > 0){
            scaleFrames = 0;
            this.zoomX = endZoomX;
            this.zoomY = endZoomY;
        }
        if(rotateFrames > 0){
            rotateFrames = 0;
            this.angle = endAngel;
        }
        if(colorFrames > 0){
            colorFrames = 0;
            this.color.A = 0;
        }
        this.stopRotate();
    };

    this.setZ = function(tz){
        z = tz;
    };

    this.updateZ = function(){
        return this.tempZ = this.z;
    };

    this.getOldZ = function(){
        return this.tempZ;
    };

    this.isNoZ = function(z){
        return this.tempZ  == z;
    };

    this.fade = function(bOpacity,eOpacity,frames){
        if(frames <= 0){
            this.opacity = eOpacity;
        }else{
            fadeFrames = frames;
            endOpactiy = eOpacity;
            diffO = (eOpacity - bOpacity) /  parseFloat(frames);
            tmpOpacity = bOpacity;
            this.opacity = bOpacity;
        }
    };

    this.fadeTo = function (eOpacity, frames) {
        this.fade(this.opacity,eOpacity,frames);
    };

    function updateFade(){
        if(pl.visible == false || fadeFrames <=0) {
            return;
        }
        fadeFrames -= 1;
        if(fadeFrames <= 0){
            pl.opacity = endOpactiy;
            if(onEndFade != null && pl.actionList.length <= 0){
                onEndFade(pl);
            }
        }else{
            tmpOpacity += diffO;
            pl.opacity = tmpOpacity;
        }
    }


    this.slide = function(bX,bY,eX,eY,frames){
        if(frames <= 0){
            this.x = eX;
            this.y = eY;
        }else{
            slideFrames = frames;
            endX = eX;
            endY = eY;
            diffX = ((endX - bX) /  parseFloat(frames));
            diffY = (endY - bY) /  parseFloat(frames);
            tmpX = bX;
            tmpY = bY;
            this.x = bX;
            this.y = bY;
        }
    };

    this.slideTo = function (eX, eY, frames) {
        this.slide(this.x,this.y,eX,eY,frames);
    };

    function updateSlide(){
        if(slideFrames <= 0) return;
        slideFrames -= 1;
        if(slideFrames <= 0){
            pl.x = endX;
            pl.y = endY;
            if(onEndSlide != null && pl.actionList.length <= 0){
                onEndSlide(pl);
            }
        }else{
            tmpX += diffX;
            tmpY += diffY;
            pl.x = tmpX;
            pl.y = tmpY;
        }
    }


    this.scale = function(bzx,bzy,ezx,ezy,frames){
        if(frames <= 0){
            this.zoomX = bzx;
            this.zoomY = bzy;
        }else{
            scaleFrames = frames;
            endZoomX = ezx;
            endZoomY = ezy;
            diffZoomX = (endZoomX - bzx) / parseFloat(frames);
            diffZoomY = (endZoomY - bzy) /  parseFloat(frames);
            tmpZoomX = bzx;
            tmpZoomY = bzy;
            this.zoomX = bzx;
            this.zoomY = bzy;
        }
    };

    this.scaleTo = function(ezx,ezy,frames){
        this.scale(this.zoomX, this.zoomY, ezx, ezy, frames);
    };

    function updateScale(){
        if(scaleFrames <= 0) return;
        scaleFrames -= 1;
        if(scaleFrames <= 0){
            pl.zoomX = endZoomX;
            pl.zoomY = endZoomY;
            if(onEndScale != null && pl.actionList.length <= 0){
                onEndScale(pl);
            }
        }else{
            tmpZoomX += diffZoomX;
            tmpZoomY += diffZoomY;
            pl.zoomX = tmpZoomX;
            pl.zoomY = tmpZoomY;
        }
    }

    this.startRotate = function(speed){
        tmpRotateSpeed = speed;
    };

    this.stopRotate = function () {
        tmpRotateSpeed = 0;
    };

    function updateRotate(){
        if(tmpRotateSpeed == 0){
            return;
        }
        pl.angle = (pl.angle + tmpRotateSpeed) % 720;
    }

    /**
     * 旋转角度（推荐使用rotateTo方法）
     * @param bAngle 起始的旋转方法
     * @param eAngle 结束的旋转方法
     * @param frames 时间
     */
     this.rotate = function(bAngle, eAngle, frames){
        if(frames <= 0){
            this.angle = eAngle;
        }else{
            rotateFrames = frames;
            endAngel = eAngle;
            diffAngel = (eAngle - bAngle) / (frames * 1.0);
            if(diffAngel == 0) {
                diffAngel = 1;
                rotateFrames = 0;
            }
            tempAngel = bAngle;
            this.angle = bAngle;
        }
    };

    /**
     * 从当前角度旋转至某旋转
     * @param eAngle 结束的角度
     * @param frames 时间
     */
    this.rotateTo = function( eAngle, frames){
        this.rotate(this.angle, eAngle, frames);
    };

    function rotateUpdate(){
        if(rotateFrames <= 0) return;
        rotateFrames -= 1;
        if(rotateFrames <= 0){
            pl.angle = endAngel;
            if(onEndRotae != null && pl.actionList.length <= 0){
                onEndRotae(pl);
            }
        }else{
            tempAngel += diffAngel;
            pl.angle = tempAngel;
        }
    }

    /**
     * 精灵闪烁
     * @param color 闪烁颜色
     * @param frames 帧数
     */
    this.flash = function (color, frames) {
        if(frames <= 0){
            this.color = IColor.Transparent();
        }else{
            this.color = color;
            colorFrames = frames;
            endColorA = 0;
            diffColorA = (endColorA - color.A) /  parseFloat(frames);
            tempColorA = color.A;
            this.color.A = tempColorA;
        }
    };

    function updateFlash(){
        if(colorFrames <= 0) return;
        colorFrames -= 1;
        if(colorFrames <= 0){
            pl.color.A = endColorA;
        }else{
            tempColorA += diffColorA;
            pl.color.A = tempColorA;
        }
    }


    /**
     * 抛物线
     * 可以添加参数自行测试
     * @param xRoat X轴斜率（>0朝下，<0朝上  推荐绝对值|0.1~0.05|的参数）
     * @param height 抛物线高度
     * @param frames 完成抛物线所需的时间
     * @param left 左右朝向 true：左 false 右
     * @param cycle 周期1为一个周期 2为2个周期（从A1点到A2为一个周期，如果还需要继续往下坠落需要增加周期）
     */
    this.parabola = function( xRoat, height, frames, left, cycle){
        tmpA = xRoat;
        tmpB = height;
        tmpC = this.y;
        PstartX = -1 * Math.sqrt(tmpB / tmpA);
        LeftPX = left;
        parabolaFrames = frames;
        tmpPX = -Math.abs(PstartX);
        diffPX = (Math.abs(PstartX) * (2 + cycle)) / parabolaFrames;
        tmpYBase = (tmpA * tmpPX * tmpPX + tmpB);
    };

    function parabolaupdate(){
        if(parabolaFrames <= 0) return;
        parabolaFrames -= 1;
        if(parabolaFrames <= 0){
            if(onEndParabola != null && pl.actionList.length <= 0){
                onEndParabola(pl);
            }
        }
        tmpPX += diffPX;
        var tmpY = (int) ((tmpA * tmpPX * tmpPX + tmpB) - tmpYBase);
        if(LeftPX){
            pl.x += diffPX;
        }else{
            pl.x -= diffPX;
        }
        pl.y = tmpC + tmpY;
    }


    this.addAction = function(){
        var action = new actionDo(arguments);
        this.actionList.push(action);
        this.tempActionList.push(action);
    };

    function actionDo(){
        var argmen = arguments[0];
        var ac = argmen[0];
        var args = [];
        for(var i = 1;i<argmen.length;i++){
            args[i - 1] = argmen[i];
        }

        this.doThis = function(){
            switch (ac){
                case 4:
                    pl.wait = args[0];
                    break;
                case 2:
                    if(args.length == 3){
                        pl.slideTo(args[0],args[1],args[2]);
                    }else if(args.length == 5){
                        pl.slide(args[0],args[1],args[2],args[3],args[4])
                    }
                    break;
                case 5:
                    if(args.length == 3){
                        pl.scaleTo(args[0],args[1],args[2]);
                    }else if(args.length == 5){
                        pl.scale(args[0],args[1],args[2],args[3],args[4])
                    }
                    break;
                case 1:
                    if(args.length == 2){
                        pl.fadeTo(args[0],args[1]);
                    }else if(args.length == 3){
                        pl.fade(args[0],args[1],args[2])
                    }
                    break;
                case 3:
                    if(args.length == 1){
                        pl.startRotate(args[0]);
                    }else if(args.length == 2){
                        pl.rotateTo(args[0],args[1])
                    }else if(args.length == 3){
                        pl.rotate(args[0],args[1],args[2])
                    }
                    break;
                default :
                    break;
            }
        }
    }


    this.setOnEndSlide = function(e){
        onEndSlide = e;
    };

   this.setOnEndFade = function(e){
        onEndFade = e;
    };

    this.setOnEndScale = function(e){
        onEndScale = e;
    };

    this.setOnEndRotae = function(e){
        onEndRotae = e;
    };

    this.setOnEndFlash = function(e){
        onEndFlash = e;
    };

    this.setOnEndParabola = function(e){
        onEndParabola = e;
    };

   this.setOnEndActionOne = function(e){
        onEndActionOne = e;
    };

    this.setOnEndAction = function(e){
        onEndAction = e;
    };

    this.setOnEndWait = function(e){
        onEndWait = e;
    }

}

var action = {
    fade:1,
    move:2,
    rotate:3,
    wait:4,
    zoom:5
};

//文件 - IPoint.js
/**
 * Created by 七夕小雨 on 2021/2/19.
 */
function IPoint(x,y){
    this.x = x;
    this.y = y;
}

IPoint.pointInPolygon = function(point, vs) {

    var x = point.x, y = point.y;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
};

IPoint.pointInPolygonXY = function(x,y, vs) {

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
};
//文件 - IPolygon.js
/**
 * Created by 七夕小雨 on 2021/2/19.
 */
function IPolygon(points){

    var _sf = this;
    if(points != null){
        this.points = points;
    }else{
        this.points = [];
    }

    this.addPoint = function(point){
        _sf.points.push(point);

    };

    this.insertPoint = function(index,point){
        _sf.points.splice(index,0,point);
    };

    this.delPoint = function(index,point){
        _sf.points.splice(index,1);
    };

}

//判断多边形是否重合
IPolygon.isPolygonsOverlap = function(plyA, plyB) {
    return IPolygon.IsPolygonsIntersectant(plyA, plyB) || IPolygon.IsPointInPolygonBidirectional(plyA, plyB);
};

IPolygon.IsPolygonsIntersectant = function(plyA, plyB) {//面面
    for (var i = 0, il = plyA.points.length; i < il; i++) {
        for (var j = 0, jl = plyB.points.length; j < jl; j++) {
            const segA = new ILine(plyA.points[i],plyA.points[i === il - 1 ? 0 : i + 1]);
            const  segB = new ILine(plyB.points[j],plyB.points[j === jl - 1 ? 0 : j + 1]);
            if (ILine.IsSegmentsIntersectant(segA, segB)) {
                return true;
            }
        }
    }
    return false;
};

IPolygon.IsPointInPolygonBidirectional = function(plyA, plyB) {//面面
    var a = false,b = false;
    a = IPolygon.IsPointInPolygon(plyA,plyB);
    if (!a) {
        b = IPolygon.IsPointInPolygon(plyB,plyA);
    }
    return a || b;
};

IPolygon.IsPointInPolygon = function(plyA,plyB){
    for(var i = 0;i<plyA.points.length;i++){
        if(IPoint.pointInPolygon(plyA.points[i],plyB)){
            return true;
        }
    }
    return false;
};


//文件 - IRect.js
/**
 * Created by 七夕小雨 on 2016/11/4.
 */

function IRect(l,t,r,b){

    var _sf = this;
    this.polygon = null;
    this.left = l;
    this.top = t;
    this.right = r;
    this.bottom = b;

    Object.defineProperty(this,"centerX",{
        get:function(){
            return parseInt(_sf.left + _sf.width / 2);
        }
    });

    Object.defineProperty(this,"centerY",{
        get:function(){
            return parseInt(_sf.top + _sf.height / 2);
        }
    });

    Object.defineProperty(this, "x", {
        get: function () {
            return _sf.left;
        },
        set: function (value) {
            var w = _sf.width;
            _sf.left = value;
            _sf.right = value + w;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return _sf.top;
        },
        set: function (value) {
            var h = _sf.height;
            _sf.top = value;
            _sf.bottom = value + h;
        }
    });

    Object.defineProperty(this,"width",{
        get : function(){
            return Math.abs(_sf.right - _sf.left);
        },
        set : function(value){
            _sf.right = _sf.left + value;
        }
    });

    Object.defineProperty(this,"height",{
        get : function(){
            return Math.abs(_sf.bottom - _sf.top);
        },
        set : function(value){
            _sf.bottom = _sf.top + value;
        }
    });

    this.toPolygon = function(){
        if(_sf.polygon == null){
            _sf.polygon = new IPolygon();
            _sf.polygon.addPoint(new IPoint(_sf.left,_sf.top));
            _sf.polygon.addPoint(new IPoint(_sf.right,_sf.top));
            _sf.polygon.addPoint(new IPoint(_sf.right,_sf.bottom));
            _sf.polygon.addPoint(new IPoint(_sf.left,_sf.bottom));
        }else{
            _sf.polygon.points[0].x = _sf.left;_sf.polygon.points[0].y = _sf.top;
            _sf.polygon.points[1].x = _sf.right;_sf.polygon.points[1].y = _sf.top;
            _sf.polygon.points[2].x = _sf.right;_sf.polygon.points[2].y = _sf.bottom;
            _sf.polygon.points[3].x = _sf.left;_sf.polygon.points[3].y = _sf.bottom;
        }
        return _sf.polygon;
    };


    this.intersects = function(){
        var r = null;
        if(arguments.length == 1){
            r = arguments[0];
        }else if(arguments.length == 4){
            r = new IRect(arguments[0],arguments[1],arguments[2],arguments[3]);
        }
        if(r == null){
            return false;
        }

        //var maxX,maxY,minX,minY;

        var r1 = r;
        var r2 = this;

        //maxX = rect1.left + rect1.width >= rect2.left+rect2.width ? rect1.left+rect1.width : rect2.left+rect2.width;
        //maxY = rect1.top + rect1.height >= rect2.top+rect2.height ? rect1.top+rect1.height : rect2.top+rect2.height;
        //minX = rect1.left <= rect2.left ? rect1.left : rect2.left;
        //minY = rect1.top <= rect2.top ? rect1.top : rect2.top;
        //
        //return maxX - minX <= rect1.width+rect2.width && maxY - minY <= rect1.height + rect2.height;

        return !(r1.left > r2.right || r1.top > r2.bottom || r2.left > r1.right || r2.top > r1.bottom);
    };

    this.contains = function(){
        var r = null;
        if(arguments.length == 1){
            r = arguments[0];
        }else if(arguments.length == 4){
            r = new IRect(arguments[0],arguments[1],arguments[2],arguments[3]);
        }
        //如果要包含就要看看谁比较大了,如果都没有大的就包含失败
        var thisbig = false;
        if(this.width >= r.width && this.height >= r.height){
            thisbig = true;
        }else if(r.width >= this.width && r.height >= this.right){
            thisbig = false;
        }else{
            r = null;
        }
        if(r != null){
            if(thisbig){
                return r.left >= this.left && r.right <= this.right && r.top >= this.top && r.bottom >= this.bottom;
            }else{
                return this.left >= r.left && this.right <= r.right && this.top >= r.top && this.bottom >= r.bottom;
            }
        }

        if(r == null){
            return false;
        }
    };


    function pointIsIn(x,y,r){
        return x >= r.left && x <= r.right && y>= r.top && y <= r.bottom;
    }


}
//文件 - IRWFile.js
/**
 * Created by 七夕小雨 on 2016/11/8.
 */

function IRWFile(file,type,code,tag){
    if(file == undefined){
        return;
    }
    if(type == null){
        type = 0;
    }
    var readData = new ArrayBuffer();
    this.onload = null;
    var rd = null;

    var irw = this;

    var oReq = new XMLHttpRequest();
    oReq.open("GET", file, true);
    if(code != null){
        oReq.overrideMimeType("text/html;charset=" + code);
    }
    if(type == 0){
        oReq.responseType = "arraybuffer";
    }else{
        oReq.responseType = "text";
    }
    oReq.onload = function (oEvent) {
        if(type == 0){
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                readData = arrayBuffer;
            }
            rd = new DataStream(readData);
            if(irw.onload != null){
                irw.onload();
            }
        }else{
            if(irw.onload != null){
                irw.onload(oReq.response,tag);
            }
        }
    };
    oReq.send(null);

    this.readShort = function(){
        return rd.readInt16();
    };

    this.readInt = function(){
        return rd.readInt32();
    };

    this.readLong = function(){
        return rd.readFloat64();
    };

    this.readString = function(){
        return rd.readStringE();
    };

    this.readBool = function(){
        var a = rd.readInt8();
        return a != 0;
    };

    this.readMS = function (length) {
        return rd.readString(length,"UTF-8");
    };

    function stringToBytes ( str ) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++ ) {
            ch = str.charCodeAt(i);  // get char
            st = [];                 // set up "stack"
            do {
                st.push( ch & 0xFF );  // push byte to stack
                ch = ch >> 8;          // shift value down by 1 byte
            }
            while ( ch );
            // add stack contents to result
            // done because chars have "wrong" endianness
            re = re.concat( st.reverse() );
        }
        // return an array of bytes
        return re;
    }

}


IRWFile.SaveKV = function(key,value){
    var json = JSON.stringify(value);
    localStorage.setItem(key, json);
};

IRWFile.LoadKV = function(key){
    return JSON.parse(localStorage.getItem(key));
};
//文件 - IScrollbar.js
/**
 * Created by 七夕小雨 on 2016/11/8.
 */

function IScrollbar( bmp1, bmp2, v, m,vp,bmp3,icon){

    var viewport = null;
    var viewprotMiddle = null;
    var image = [];
    var back = null;
    var top = null;
    var middle = null;
    var iconS = null;

    var iconDx = 0;
    var iconDy = 0;
    var value = 0;
    var value2 = 0;
    this.dir = 0;

    var tempValue = -1;
    var tempValue2 = -1;
    var valueType = 0;
    var tempMax = 0;
    var max = 0;

    var tmpValue = 0;
    var endValue = 0;
    var diffValue = 0;
    var valueFrames = 0;

    this.tag = null;
    var sb = this;

    if(bmp1 == undefined || bmp2 == undefined) return;
    if(bmp1 == null || bmp2 == null) return;
    image = [bmp1,bmp2];
    value = v || 0;
    max = m || 100;


    viewport = new IViewport(0, 0, image[0].width, image[0].height + 5,vp);
    viewprotMiddle = new IViewport(0, 0, image[0].width, image[0].height + 5,vp);
    back = new ISprite(image[0],vp);
    top = new ISprite(image[1],viewport);

    if(bmp3 != null){
        middle = new ISprite(bmp3,viewprotMiddle);
    }
    if(icon != null){
        iconS = new ISprite(icon,vp)
    }

    if(image[1].complete){
        viewport.width = image[1].width;
        viewport.height = image[1].height + 5;
        viewprotMiddle.width = image[1].width;
        viewprotMiddle.height = image[1].height;
        top.width = image[1].width;
        top.height = image[1].height;
        top.onload = function(){};
        reDrawBar();

    }else{
        image[1].onload = function(){
            viewport.width = image[1].width;
            viewport.height = image[1].height + 5;
            viewprotMiddle.width = image[1].width;
            viewprotMiddle.height = image[1].height;
            top.width = image[1].width;
            top.height = image[1].height;
            top.onload = function(){};
            reDrawBar();
        }
    }

    Object.defineProperty(this, "onload", {
        set: function (fc) {
            back.onload = function(){
                fc(sb);
            }
        }
    });

    reDrawBar();

    this.setIconPoint = function(dx,dy){
        iconDx = dx;
        iconDy = dy;
        sb.setX(sb.getX());
        sb.setY(sb.getY());
    };

    this.setX = function(x){
        back.x = x;
        viewport.x = x;
        if(middle != null){
            viewprotMiddle.x = x;
        }
        if(iconS != null){
            iconS.x = x + iconDx;
        }
    };

    this.getX = function(){
        return back.x;
    };

    this.setY = function(y){
        back.y = y;
        viewport.y = y;
        if(middle != null){
            viewprotMiddle.y = y;
        }
        if(iconS != null){
            iconS.y = y + iconDy;
        }
    };

    this.getY = function(){
        return back.y;
    };

    this.setZ = function(z){
        back.z = z;
        top.z = z + 3;
        viewport.z = z + 3;
        if(middle != null){
            viewprotMiddle.z = z + 2;
        }
        if(iconS != null){
            iconS.z = z + 5;
        }
    };



    Object.defineProperty(this, "x", {
        get: function () {
            return back.x;
        },
        set: function (value) {
            sb.setX(value);

        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return back.y;
        },
        set: function (value) {
            sb.setY(value);

        }
    });

    Object.defineProperty(this, "z", {
        get: function () {
            return back.z;
        },
        set: function (value) {
            sb.setZ(value);
        }
    });

    Object.defineProperty(this, "zoomX", {
        get: function () {
            return back.zoomX;
        },
        set: function (value) {
            back.zoomX = value;
            if(viewport != null) viewport.zoomX = value;
            if(middle != null){
                middle.zoomX = value;
            }
            if(iconS != null){
                iconS.zoomX = value;
            }
        }
    });

    Object.defineProperty(this, "zoomY", {
        get: function () {
            return back.zoomY;
        },
        set: function (value) {
            back.zoomY = value;
            if(viewport != null) viewport.zoomY = value;
            if(middle != null){
                middle.zoomY = value;
            }
            if(iconS != null){
                iconS.zoomY = value;
            }

        }
    });

    Object.defineProperty(this, "visible", {
        get: function () {
            return back.visible;
        },
        set: function (value) {
            back.visible = value;
            if(viewport != null) viewport.visible = value;
            if(middle != null){
                middle.visible = value;
            }
            if(iconS != null){
                iconS.visible = value;
            }

        }
    });

    Object.defineProperty(this, "opacity", {
        get: function () {
            return back.opacity;
        },
        set: function (value) {
            sb.setOpactiy(value);
        }
    });

    Object.defineProperty(this, "width", {
        get: function () {
            return back.width;
        },
        set: function (value) {}
    });

    Object.defineProperty(this, "height", {
        get: function () {
            return back.height;
        },
        set: function (value) {}
    });

    this.width = function(){
        return back.width;
    };

    this.height = function(){
        return back.height;
    };

    this.setOpactiy = function(o){
        back.opacity = o;
        top.opacity = o;
        if(middle != null){
            middle.opacity = o;
        }
        if(iconS != null){
            iconS.opacity = o;
        }
    };

    this.fade = function(bo, eo, frame){
        back.fade(bo,eo,frame);
        if(top != null) top.fade(bo,eo,frame);
        if(viewprotMiddle != null) viewprotMiddle.fade(bo,eo,frame);
        if(iconS != null) iconS.fade(bo,eo,frame);
    };

    this.fadeTo = function(o, frame){
        back.fadeTo(o, frame);
        if(top != null) top.fadeTo(o, frame);
        if(viewprotMiddle != null) viewprotMiddle.fadeTo(o, frame);
        if(iconS != null) iconS.fadeTo(o, frame);
    };

    this.slide = function(bx, by,ex,ey, frame){
        back.slide(bx,by,ex,ey,frame);
        if(viewport != null) viewport.slide(bx,by,ex,ey,frame);
        if(viewprotMiddle != null) viewprotMiddle.slide(bx,by,ex,ey,frame);
        if(iconS != null) iconS.slide(bx,by,ex,ey,frame);
    };

    this.slideTo = function( x, y, frame){
        back.slideTo(x, y, frame);
        if(viewport != null) viewport.slideTo(x , y , frame);
        if(viewprotMiddle != null) viewprotMiddle.slideTo(x , y , frame);
        if(iconS != null) iconS.slideTo(x , y , frame);
    };

    this.scale = function( bzx, bzy,ezx,ezy, frame){
        back.scale(bzx,bzy,ezx,ezy,frame);
        if(viewport != null) viewport.scale(bzx,bzy,ezx,ezy,frame);
        if(viewprotMiddle != null) viewprotMiddle.scale(bzx,bzy,ezx,ezy,frame);
        if(iconS != null) iconS.scale(bzx,bzy,ezx,ezy,frame);
    };

    this.scaleTo = function( zx, zy, frame){
        back.scaleTo(zx, zy, frame);
        if(viewport != null) viewport.scaleTo(zx ,zy , frame);
        if(viewprotMiddle != null) viewprotMiddle.scaleTo(zx ,zy , frame);
        if(iconS != null) iconS.scaleTo(zx ,zy , frame);
    };

    this.setAction = function(action,args){
        back.addAction.apply(back,arguments);
        if(viewport != null) viewport.addAction.apply(viewport,arguments);
        if(viewprotMiddle != null) viewprotMiddle.addAction.apply(viewprotMiddle,arguments);
        if(iconS != null) iconS.addAction.apply(iconS,arguments);
    };

    this.setActLoop = function( loop){
        back.actionLoop = loop;
        if(viewport != null) viewport.actionLoop = loop;
        if(viewprotMiddle != null) viewprotMiddle.actionLoop = loop;
        if(iconS != null) iconS.actionLoop = loop;
    };

    this.getActLoop = function(){
        return back.actionLoop;
    };

    this.dispose = function(){
        this.disposeMin();
        viewport.dispose();
        viewprotMiddle.dispose();
        if(image[0] != null) {
            image[0] = null;
        }
        if(image[1] != null) {
            image[1] = null;
        }
        image = [];
    };

    this.disposeMin = function(){
        back.disposeMin();
        top.disposeMin();
        if(middle != null){
            middle.disposeMin();
        }
        if(iconS != null){
            iconS.disposeMin();
        }
    };

    this.setValue = function( val, m){
        value = val;
        max = m;
    };

    this.isClick = function(){
        if(!back.visible){
            return false;
        }
        var f = IInput.up && back.isSelect();
        if(f){
            IInput.up = false;
        }
        return f;
    };

    this.update = function () {
        if(!back.visible) return;
        updateValueAnim();
        reDrawBar();
        reDrawMiddleBar();
    };

    this.touchValue = function(){
        if(IInput.y > back.y && IInput.y <= back.y + back.height && IInput.x >= back.x && IInput.x <= back.x + back.width){
            value = (IInput.x - back.x) * max / back.width
        }
    };

    this.valueAnim = function( bValue, eValue, frames){
        if(bValue > eValue){
            valueType = 1;
            value = eValue;
            if(frames <= 0){
                value2 = eValue;
            }else{
                valueFrames = frames;
                endValue = eValue;
                diffValue = (eValue - bValue) / (frames);
                tmpValue = bValue;
                value2 = bValue;
            }
        }else{
            valueType = 0;
            value2 = eValue;
            if(frames <= 0){
                value = eValue;
            }else{
                valueFrames = frames;
                endValue = eValue;
                diffValue = (eValue - bValue) / (frames);
                tmpValue = bValue;
                value = bValue;
            }
        }

    };

    this.valueAnimTo = function( eValue, frames){
        this.valueAnim(value,eValue,frames);
    };

    function updateValueAnim(){
        if(valueFrames <= 0) return;
        valueFrames -= 1;
        if(valueType == 0){
            if(valueFrames <= 0){
                value = endValue;
            }else{
                tmpValue += diffValue;
                value = parseInt(tmpValue);
            }
        }else if(valueType == 1){
            if(valueFrames <= 0){
                value2 = endValue;
            }else{
                tmpValue += diffValue;
                value2 = parseInt(tmpValue);
            }
        }

    }

    function reDrawBar(){
        if(top.height == 0 && top.width == 0) return;
        if(tempValue != value || tempMax != max){
            tempMax = max;
            tempValue = value;
            var zt = Math.min(max,value);
            if(sb.dir == 1){
                viewport.x = parseInt(back.x + top.width -  ((top.width * zt) / max));
                viewport.ox = parseInt(-(top.width - (top.width * zt) / max));
                viewport.width = parseInt((top.width * zt) / max);
            }else if(sb.dir == 2){
                viewport.width = top.width;
                viewport.height = parseInt((top.height * zt / max));
            }else if(sb.dir == 3){
                viewport.width = top.width;
                viewport.y = parseInt(back.y + top.height -  ((top.height * zt) / max));
                viewport.oy = parseInt(-(top.height -  ((top.height * zt) / max)));
                viewport.height = parseInt((top.height * zt) / max);
            }else{
                viewport.width = parseInt((top.width * zt) / max);
            }
        }
    }

    function reDrawMiddleBar(){
        if(top.height == 0 && top.width == 0) return;
        if(tempValue2 != value2 || tempMax != max){
            tempMax = max;
            tempValue2 = value2;
            var zt = Math.min(max,value2);
            if(sb.dir == 1){
                viewprotMiddle.x = parseInt(back.x + top.width -  ((top.width * zt) / max));
                viewprotMiddle.ox = parseInt(-(top.width - (top.width * zt) / max));
                viewprotMiddle.width = parseInt((top.width * zt) / max);
            }else if(sb.dir == 2){
                viewprotMiddle.width = top.width;
                viewprotMiddle.height = parseInt((top.height * zt / max));
            }else if(sb.dir == 3){
                viewprotMiddle.width = top.width;
                viewprotMiddle.y = parseInt(back.y + top.height -  ((top.height * zt) / max));
                viewprotMiddle.oy = parseInt(-(top.height -  ((top.height * zt) / max)));
                viewprotMiddle.height = parseInt((top.height * zt) / max);
            }else{
                viewprotMiddle.width = parseInt((top.width * zt) / max);
            }
        }
    }
}

IScrollbar.Dir = {
    Left : 0,
    Right : 1,
    Down : 2,
    Up : 3
};
//文件 - ISound.js
/**
 * Created by 七夕小雨 on 2018-1-26.
 */
function ISound(p,v){
    var path =p;
    var volume = v;

    this.play = function(){
        if(path == undefined || path.length <= 0) return;
        IAudio.playSE(path,v);
    }
}
//文件 - ISprite.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function ISprite(bitmap,vp){
    this.plane = IPlane;
    this.plane();
    delete this.plane;

    this.width = 0;
    this.height = 0;
    this.lighter = false;

    this.RWidth = 0;
    this.RHeight = 0;

    this.yy = 0;
    this.yx = 0;

    this.image = null;
    this.tempimage = null;

    this.tiling = false;

    this.viewport = null;
    this.activity = false;

    this.lineSpacing = 1.3;
    this.blendType = 0;

    var sp = this;

    var canDraw = false;
    var cCof = false;

    var bCof = null;

    var drawList = [];

    var bdrawcache = {};

    var touchId = -2;
    var isTouch = false;

    var rect = new IRect(1,1,1,1);
    var recttemp = new IRect(0,0,1,1);

    var webDx = 1;
    var webDy = 0;


    Object.defineProperty(this, "onload", {
        set: function (fc) {
            if(sp.image == null){
                fc(sp);
                return;
            }
            if (sp.image.complete) {
                sp.width = bitmap.width;
                sp.height = bitmap.height;
                canDraw = true;
                bitmap.onload = null;
                fc(sp);
            } else {
                //this.visible = false;
                sp.image.onload = function () {
                    sp.width = bitmap.width;
                    sp.height = bitmap.height;
                    canDraw = true;
                    bitmap.onload = null;
                    fc(sp);
                }
            }
        }
    });

    if(arguments.length >= 3){
        this.image = new Image();
        this.image.src = tcanvas.toDataURL("image/png");
        this.width = arguments[0];
        this.height = arguments[1];
        drawList.push({
            tp :3,
            rect:new IRect(0,0,arguments[0],arguments[1]),
            color:arguments[2]
        })
    }else {

        if (vp != undefined && vp instanceof  IViewport) {
            this.viewport = vp;
        }
        if(bitmap instanceof CBmp){
            this.image = null;
            this.width = bitmap.width;
            this.height = bitmap.height;
        }else if(bitmap instanceof  IBCof){
            bCof = bitmap;
            this.image = bCof.bitmap;
            this.width = bCof.width;
            this.height = bCof.height;
            cCof = true;
        }else{
            this.image = bitmap;
            if (this.image.complete) {
                this.width = this.image.width;
                this.height = this.image.height;
                canDraw = true;
            } else {
                if(bitmap.onload != null){
                    var temp = bitmap.onload;
                    bitmap.onload = function () {
                        temp();
                        sp.width = bitmap.width;
                        sp.height = bitmap.height;
                        bitmap.onload = null;
                        canDraw = true;
                    };
                }else{
                    bitmap.onload = function () {
                        sp.width = bitmap.width;
                        sp.height = bitmap.height;
                        bitmap.onload = null;
                        canDraw = true;
                    };
                }

            }
        }

    }
    if (this.viewport == null) {
        this.fbox = box;
    }else{
        this.fbox = this.viewport.zbox;
    }
    this.fbox.add(this);

    this.update = function(){
        this.updatebase();
        sp.speedX += sp.aSpeedX;
        sp.speedY += sp.aSpeedY;
        sp.x += sp.speedX;
        sp.y += sp.speedY;
        this.activity = false;
        var tempRt1 = this.viewport != null ? this.viewport.GetRect() : IVal.SceneRect;

        if(this.opacity > 0 && this.visible) {

            if(this.width == 0 && this.height == 0){
                if(this.image != null  && this.image.complete){
                    this.width = this.image.width;
                    this.height = this.image.height;
                }else{
                    return;
                }
            }

            var dx = this.width * this.yx;
            var dy = this.height * this.yy;

            var tx = this.x - dx;
            var ty = this.y - dy;
            if(this.viewport != null){
                tx += this.viewport.x + this.viewport.ox;
                ty += this.viewport.y + this.viewport.oy;
            }
            if(sp.tiling) {
                this.width = this.RWidth;
                this.height = this.RHeight;
            }
            var tww = Math.abs(this.width * this.zoomX);
            var thh = Math.abs(this.height * this.zoomY);
            if(this.angle != 0){
                recttemp.left = tx - tww;
                recttemp.top = ty - thh;
                recttemp.right = tx + (tww * 2);
                recttemp.bottom = ty +(thh * 2);
            }else{
                recttemp.left = tx;
                recttemp.top = ty;
                recttemp.right = tx + tww;
                recttemp.bottom = ty + thh;
            }

            var sw = recttemp.intersects(tempRt1);
            if(sw == false){
                return;
            }
            this.activity = true;
            IVal.updateNumSp += 1;
            cont.save();
            if(sp.lighter){
                cont.globalCompositeOperation = "lighter";
            }else{
                //cont.globalCompositeOperation = "source-over";
                cont.globalCompositeOperation = "destination-over";
            }

            cont.translate(tx + dx, ty + dy);
            cont.rotate(Math.PI / 180 * this.angle);
            cont.scale(this.zoomX,this.zoomY);
            cont.translate(-dx, -dy);

            if(this.image != null && this.image.alt == "tg"){
                cont.globalAlpha = this.opacity * 0.6;
            }else{
                cont.globalAlpha = this.opacity;
            }

            if(this.mirror){
                cont.transform(-1,0,0, 1,this.width,0);
            }

            for(var i = drawList.length - 1;i>= 0;i--){
                var dw = drawList[i];
                if(dw.tp == 1){//绘制图片
                    try{
                        if(dw.bmp != null && dw.bmp instanceof  Image && dw.bmp.complete){
                            cont.drawImage(dw.bmp,dw.x,dw.y);
                        }
                    }catch(e){
                        log(e);
                        log(dw.bmp.src);
                    }


                }else if(dw.tp == 2){//绘制矩形图片
                    try{
                        if(dw.bmp != null && dw.bmp instanceof  Image && dw.bmp.complete){
                            cont.drawImage(dw.bmp,dw.x,dw.y,dw.width,dw.height);
                        }
                    }catch(e){
                        log(e);
                        log(dw.bmp.src);
                    }


                }else if(dw.tp == 3){//绘制矩形
                    cont.fillStyle = dw.color.JColor();
                    cont.fillRect(dw.rect.left,dw.rect.top,dw.rect.width,dw.rect.height);
                }else if(dw.tp == 4){//高效文字
                    cont.fillStyle = dw.color.JColor();
                    cont.font = dw.size + "px "+IVal.FontName;
                    cont.fillText(dw.s,dw.x ,dw.y + IFont.getHeight(dw.s,dw.size));
                }else if(dw.tp == 5){//复杂的文字绘制
                    drawTextDo(dw.str,dw.x,dw.y,dw.type,dw.wcolor,dw.isAutoL,dw.size,cont)
                }else if(dw.tp == 6){
                    try{
                        if(dw.bCof.bitmap instanceof  Image && dw.bCof.bitmap.complete){
                            cont.drawImage(dw.bCof.bitmap, dw.bCof.x,dw.bCof.y,dw.bCof.width,dw.bCof.height,dw.x, dw.y,dw.bCof.width,dw.bCof.height);
                        }
                    }catch(e){
                        log(e);
                        log(dw.bCof.bitmap.src);
                    }
                }else if(dw.tp == 7){
                    cont.beginPath();
                    cont.moveTo(dw.line.point1.x, dw.line.point1.y);
                    cont.lineTo(dw.line.point2.x, dw.line.point2.y);
                    cont.closePath();
                    cont.strokeStyle = dw.color.JColor();
                    cont.lineWidth = dw.lineWidth;
                    cont.fill();
                    cont.stroke();
                }else if(dw.tp == 8){
                    cont.beginPath();
                    cont.moveTo(dw.polygon.points[0].x, dw.polygon.points[0].y);
                    for(var j = 0;j<dw.polygon.points.length;j++){
                        cont.lineTo(dw.polygon.points[j].x, dw.polygon.points[j].y);
                    }
                    cont.closePath();
                    cont.fillStyle = dw.color1.JColor();
                    cont.strokeStyle = dw.color2.JColor();
                    cont.lineWidth = dw.lineWidth;
                    cont.fill();
                    cont.stroke();
                }
            }

            if(this.image != null  && this.image.complete) {
                if(sp.tiling){
                    this.width = this.RWidth;
                    this.height = this.RHeight;
                    cont.fillStyle = cont.createPattern(this.image,"repeat");
                    cont.rect(0 , 0 , this.RWidth , this.RHeight);
                    cont.fill();
                }else{
                    if(cCof){
                        try{
                            cont.drawImage(bCof.bitmap, bCof.x,bCof.y,bCof.width,bCof.height,0,0,bCof.width,bCof.height);
                        }catch(e){
                            log(e);
                            if(bCof.bitmap != null){
                                log(bCof.bitmap.src);
                            }
                        }
                    }else{
                        try{
                            cont.drawImage(this.image, 0, 0,this.width,this.height);
                        }catch(e){
                            if(this.image != null){
                                log(this.image.src);
                            }
                        }

                    }
                }
            }

            if(sp.color.A > 0){
                cont.globalCompositeOperation = "source-atop";
                cont.fillStyle=sp.color.JColor();
                if(cCof){
                    cont.fillRect(0,0,bCof.width,bCof.height);
                }else{
                    cont.fillRect(0,0,sp.width,sp.height);
                }
            }
            cont.restore();
        }

    };

    this.ListToImage = function(){
        tcanvas.width = sp.width;
        tcanvas.height = sp.height;
        tcont.clearRect(0,0,sp.width,sp.height);
        //绘制核心区域
        if(this.image != null  && this.image.complete) {
            if(cCof){
                tcont.drawImage(bCof.bitmap, bCof.x,bCof.y,bCof.width,bCof.height,0,0,bCof.width,bCof.height);
            }else{
                tcont.drawImage(this.image, 0, 0,this.width,this.height);
            }

        }
        for(var i = 0;i<drawList.length;i++){
            var dw = drawList[i];
            if(dw.tp == 1){//绘制图片
                if(dw.bmp != null && dw.bmp instanceof  Image && dw.bmp.complete){
                    tcont.drawImage(dw.bmp,dw.x,dw.y);
                }

            }else if(dw.tp == 2){//绘制矩形图片
                if(dw.bmp != null && dw.bmp instanceof  Image && dw.bmp.complete){
                    tcont.drawImage(dw.bmp,dw.x,dw.y,dw.width,dw.height);
                }

            }else if(dw.tp == 3){//绘制矩形
                tcont.fillStyle = dw.color.JColor();
                tcont.fillRect(dw.rect.left,dw.rect.top,dw.rect.width,dw.rect.height);
            }else if(dw.tp == 4){//高效文字
                tcont.fillStyle = dw.color.JColor();
                tcont.font = dw.size + "px "+IVal.FontName;
                tcont.fillText(dw.s,dw.x,dw.y + dw.size);
            }else if(dw.tp == 5){//复杂的文字绘制
                drawTextDo(dw.str,dw.x,dw.y,dw.type,dw.wcolor,dw.isAutoL,dw.size,tcont)
            }else if(dw.tp == 6){
                if(dw.bCof.bitmap != null){
                    tcont.drawImage(dw.bCof.bitmap, dw.bCof.x,dw.bCof.y,dw.bCof.width,dw.bCof.height,dw.x, dw.y,dw.bCof.width,dw.bCof.height);
                }

            }else if(dw.tp == 7){
                tcont.beginPath();
                tcont.moveTo(dw.line.point1.x, dw.line.point1.y);
                tcont.lineTo(dw.line.point2.x, dw.line.point2.y);
                tcont.closePath();
                tcont.strokeStyle = dw.color.JColor();
                tcont.lineWidth = dw.lineWidth;
                tcont.fill();
                tcont.stroke();
            }else if(dw.tp == 8){
                tcont.beginPath();
                tcont.moveTo(dw.polygon.points[0].x, dw.polygon.points[0].y);
                for(var j = 0;j<dw.polygon.points.length;j++){
                    tcont.lineTo(dw.polygon.points[j].x, dw.polygon.points[j].y);
                }
                tcont.closePath();
                tcont.fillStyle = dw.color1.JColor();
                tcont.strokeStyle = dw.color2.JColor();
                tcont.lineWidth = dw.lineWidth;
                tcont.fill();
                tcont.stroke();
            }
        }

        var tempImage = new Image();
        tempImage.src = tcanvas.toDataURL("image/png");
        sp.image = tempImage;
        drawList = [];
    };

    this.clearBitmap = function(){
        drawList = [];
        bdrawcache = {};
    };

    this.updateBitmap = function(){
    };

    this.setXY = function (inx, iny) {
        this.x = inx;
        this.y = iny;
    };

    this.isSelect = function (x,y) {
        if(bCof != null){
            this.width = bCof.width;
            this.height = bCof.height;
        }
        var nowX = x;
        var nowY = y;
        var spX = this.x - (this.width * this.yx * this.zoomX);
        var spY = this.y - (this.height * this.yy * this.zoomY);
        if(this.viewport == null){
            if(sp.angle != 0){
                return IPoint.pointInPolygonXY(nowX,nowY,sp.GetPolygonRect().points);
            }else{
                return nowX > spX && nowX <= spX + (this.width * this.zoomX) && nowY > spY && nowY <= spY + (this.height * this.zoomY);
            }

        }else{
            if(nowX >= this.viewport.x && nowX <= this.viewport.width + this.viewport.x &&
             nowY >= this.viewport.y && nowY <= this.viewport.height + this.viewport.y){
                if(sp.angle != 0){
                    var dx = this.viewport.x + this.viewport.ox;
                    var dy = this.viewport.y + this.viewport.oy;
                    var p = sp.GetPolygonRect();
                    for(var i = 0;i< p.points.length;i++){
                        p.points[i].x += dx;
                        p.points[i].y += dy;
                    }
                    return IPoint.pointInPolygonXY(nowX,nowY, p.points);
                }else{
                    var tx = this.viewport.x + this.viewport.ox + spX;
                    var ty = this.viewport.y + this.viewport.oy + spY;
                    return nowX > tx && nowX <= tx + (this.width * this.zoomX) && nowY > ty && nowY <= ty + (this.height * this.zoomY);
                }
            }else{
                return false;
            }

        }
    };

    this.isSelected = function(){
        return this.isSelect(IInput.x,IInput.y);
    };

    this.isSelectTouch = function(){
        var oldPoint = false;
        for(var i = 0;i<IInput.touches.length;i++){
            if(this.isSelect(IInput.touches[i].clientX,IInput.touches[i].clientY)){
                touchId = IInput.touches[i].id;
                isTouch = true;
                return 1;
            }
            if(IInput.touches[i].id == touchId){
                isTouch = false;
                oldPoint = true;
            }
        }
        if(isTouch && oldPoint == false){
            isTouch = false;
            touchId = -2;
            return 2;//抬起
        }
        isTouch = false;
        return 0;

    };

    this.drawRect = function(rect,color){
        drawList.push({
            tp :3,
            rect:rect,
            color:color
        })
    };

    this.drawLine = function(line,color,lineWidth){
        drawList.push({
            tp:7,
            line:line,
            lineWidth:lineWidth,
            color:color
        })
    };

    this.drawPolygon = function(polygon,color1,color2,lineWidth){
        drawList.push({
            tp:8,
            polygon : polygon,
            color1:color1,
            color2:color2,
            lineWidth:lineWidth
        })
    };

    this.drawTextQ = function(s,x,y,color,size){
        drawList.push({
            tp :4,
            s:ISprite.toRegular(s),
            x:x,
            y:y,
            color:color,
            size:size
        })
    };

    this.drawText = function (str, x, y, type, wcolor , isAutoL, size) {

        drawList.push({
            tp :5,
            str: ISprite.toRegular(str),
            x:x,
            y:y,
            type:type,
            wcolor:wcolor,
            isAutoL:isAutoL,
            size:size
        });
    };

    function drawTextDo(str, x, y, type, wcolor , isAutoL, size,ctx) {
        var showArgs = [];
        if(isAutoL){
            showArgs = IFont.toGroups(str);
        }else{
            showArgs.push(str);
        }
        ctx.font = IVal.FontSize + "px "+IVal.FontName;
        var fsize = IVal.FontSize;
        var color = IVal.FontColor;
        ctx.fillStyle = color.JColor();
        var now_x = x ;
        var now_y = y ;

        for(var i = 0;i<showArgs.length;i++){
            var showText = ISprite.TextAnalysis(showArgs[i]);
            if(isAutoL){
                var nextSize = ISprite.getDrawTextSizeMin(showText,sp.lineSpacing);
                if( (now_x + nextSize.width) - x >= size){
                    now_x = x;
                    now_y += cont.measureText("七").width * ISprite.webNewLine * sp.lineSpacing;
                }
            }
            while(true){
                if(showText.length <= 0){
                    break;
                }
                var min = showText.substring(0,1);
                showText = showText.substring(1,showText.length);
                var c = min.charCodeAt(0);
                if(c == 60000){
                    now_x = x;
                    now_y += cont.measureText("七").width * ISprite.webNewLine * sp.lineSpacing;
                    now_y = parseInt(now_y);
                }else if(c == 60001){
                    var rs = ISprite.TextToTemp(showText,"[","]","\\[([0-9]+[,][0-9]+[,][0-9]+)]");
                    color = new IColor(rs.over);
                    showText = rs.main;
                }else if(c == 60002){
                    rs = ISprite.TextToTemp(showText,"[","]","\\[([0-9]+)]");
                    ctx.font = rs.over + "px "+IVal.FontName;
                    fsize = parseInt(rs.over);
                    showText = rs.main;
                }else if(c == 60003){
                    rs = ISprite.TextToTemp(showText,"[","]","\\[([/.a-zA-Z0-9_-]+)]");
                    if(bdrawcache[rs.over] == null){
                        bdrawcache[rs.over] = IBitmap.WBitmap(IVal.baseBPath +  rs.over);
                    }
                    var b = bdrawcache[rs.over];
                    ctx.drawImage(b,now_x,now_y);
                    var w = b.width;
                    if(b.width == 0){
                        w = 36;
                    }
                    now_x += w;
                    showText = rs.main;
                }else{
                    var yy = now_y + IFont.getHeight(min,fsize);
                    ctx.fillStyle = color.JColor();
                    ctx.fillText(min,now_x,yy);
                    if(wcolor != undefined){
                        ctx.fillStyle = wcolor.JColor();
                    }
                    if(type == 1){ // 投影
                        ctx.fillText(min,now_x + 1,yy + 1);
                    }else if(type == 2){//描边
                        ctx.fillText(min,now_x + 1,yy);
                        ctx.fillText(min,now_x + 1,yy + 1);
                        ctx.fillText(min,now_x ,yy + 1);
                        ctx.fillText(min,now_x - 1,yy + 1);
                        ctx.fillText(min,now_x - 1,yy);
                        ctx.fillText(min,now_x - 1,yy - 1);
                        ctx.fillText(min,now_x,yy - 1);
                        ctx.fillText(min,now_x + 1,yy - 1);
                    }
                    now_x += cont.measureText(min).width * webDx;
                    if(isAutoL && now_x - x >= size){
                        showText = String.fromCharCode(60000) + showText;
                    }

                }

            }
        }
    }

    this.drawBitmap = function(bmp, x, y, isDispose){
        drawList.push({
            tp :1,
            bmp:bmp,
            x:x,
            y:y,
            isDispose: isDispose
        })
    };

    this.drawBitmapRect = function(bmp,rect,isDispose){
        drawList.push({
            tp :2,
            bmp:bmp,
            x:rect.left,
            y:rect.top,
            width:rect.width,
            height:rect.height,
            isDispose: isDispose
        })
    };

    this.drawBitmapBCof = function(x,y,bcof,isDispose){
        drawList.push({
            tp :6,
            x:x,
            y:y,
            bCof:bcof,
            isDispose: isDispose
        })
    };

    this.getBitmap = function(){
        return this.image;
    };





    this.dispose = function(){
        this.disposeBitmap();
        this.disposeMin();
    };

    this.disposeMin = function () {
        this.fbox.remove(this);
    };

    this.disposeBitmap = function () {
        drawList = [];
        bdrawcache = {};
        this.image = null;
        this.tempimage = null;
        bCof = null;
    };

    function beginDraw(){
    }

    function endDraw(){
    }

    this.setBCof = function(bcof){
        bCof = bcof;
        this.image = bCof.bitmap;
        this.width = bCof.width;
        this.height = bCof.height;
        cCof = true;
    };

    this.getBCof = function(){
        return bCof;
    };

    this.setBitmap = function(bitmap){
        if(bitmap == null){
            this.width = 100;
            this.height = 100;
            sp.drawRect(new IRect(0,0,100,100),IColor.Red());
            sp.drawTextQ("图片不存在",10,30,IColor.White(),20);
        }
        this.image = bitmap;
        if (bitmap.complete) {
            this.width = bitmap.width;
            this.height = bitmap.height;
            canDraw = true;
        } else {
            bitmap.onload = function () {
                sp.width = bitmap.width;
                sp.height = bitmap.height;
                bitmap.onload = null;
                canDraw = true;
            };
        }
    };

    this.GetRect = function() {
        if(bCof != null){
            this.width = bCof.width;
            this.height = bCof.height;
        }
        var spX = this.x - (this.width * this.yx * this.zoomX);
        var spY = this.y - (this.height * this.yy * this.zoomY);

        rect.left = spX;
        rect.top = spY;
        rect.right = spX + (this.width * this.zoomX);
        rect.bottom = spY + (this.height * this.zoomY);

        return rect;
    };

    this.GetPolygonRect = function(){
        sp.GetRect();
        var polygon = rect.toPolygon();
        if(sp.angle != 0){
            //找到圆心对应的坐标点
            var rx = rect.x + this.width * this.yx * this.zoomX;
            var ry = rect.y + this.height * this.yy * this.zoomY;
            var tA = sp.angle * (Math.PI / 180);
            for(var i = 0;i<polygon.points.length;i++){
                var tempX = polygon.points[i].x;
                var tempY = polygon.points[i].y;
                polygon.points[i].x = (tempX - rx) * Math.cos(tA) -
                    (tempY - ry) * Math.sin(tA) + rx;
                polygon.points[i].y = (tempX -rx) * Math.sin(tA) +
                    (tempY - ry) * Math.cos(tA) + ry;
            }
        }
        return polygon;
    };

    this.getDrawList = function(){
        return drawList;
    };

    this.setDrawList = function(dl){
        drawList = dl;
    }
}

ISprite.toRegular = function(s){
    var str = s;
    for(var key in IVal.regularList){
        var vl = IVal.regularList[key];
        str = str.replaceAll(key,vl);
    }
    return str;
};

ISprite.getDrawTextSize = function(str,isAutoL, size,ls){
    if(ls == null) ls = 1.2;
    var showArgs = [];
    if(isAutoL){
        showArgs = IFont.toGroups(str);
    }else{
        showArgs.push(str);
    }
    cont.font = IVal.FontSize + "px "+IVal.FontName;
    var now_x = 0;
    var now_y = 0;
    var maxW = 0;
    var maxH = 0;
    var lineSize = cont.measureText("七").width;

    for(var i = 0;i<showArgs.length;i++){
        var showText = ISprite.TextAnalysis(showArgs[i]);
        if(isAutoL){
            var nextSize = ISprite.getDrawTextSizeMin(showText,ls);
            if( (now_x + nextSize.width)  >= size){
                now_x = 0;
                lineSize = cont.measureText("七").width * ISprite.webNewLine * ls;
                now_y += lineSize;
                maxH += lineSize;
            }
        }
        while(true){
            if(showText.length <= 0){
                break;
            }
            var min = showText.substring(0,1);
            showText = showText.substring(1,showText.length);
            var c = min.charCodeAt(0);
            if (c == 60000) {
                now_x = 0;
                lineSize = cont.measureText("七").width * ISprite.webNewLine * ls;
                now_y += lineSize;
                maxH += lineSize;
            } else if (c == 60001) {
                var rs = ISprite.TextToTemp(showText, "[", "]", "\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
                showText = rs.main;
            } else if (c == 60002) {
                rs = ISprite.TextToTemp(showText, "[", "]", "\\[([0-9]+)]");
                cont.font = rs.over + "px "+IVal.FontName;
                showText = rs.main;
            } else if (c == 60003) {
                rs = ISprite.TextToTemp(showText, "[", "]", "\\[([\\w/.]+)]");
            } else{
                var yy = now_y;
                var lineh = cont.measureText("七").width * 1.2;
                if(maxH < now_y + lineh) {
                    maxH = now_y + lineh;
                }
                now_x += cont.measureText(min).width;
                if(maxW < now_x) {
                    maxW = now_x;
                }
                if(isAutoL && now_x >= size){
                    showText = String.fromCharCode(60000) + showText;
                }else{


                }
            }
        }
    }
    if(maxH <= 0){
        maxH += lineSize;
    }
    return {width : maxW , height : maxH};
};

ISprite.webNewLine = 1.4;

ISprite.TextAnalysis = function(str){
    var s = new String(str);
    s = s.replaceAll("\\\\[Nn]",String.fromCharCode(60000));
    s = s.replaceAll("\\\\[Cc]\\[([0-9]+,[0-9]+,[0-9]+)]",String.fromCharCode(60001) + "[$1]");
    s = s.replaceAll("\\\\[Ss]\\[([0-9]+)]",String.fromCharCode(60002) + "[$1]");
    s = s.replaceAll("\\\\[Bb]\\[([/.a-zA-Z0-9_-]+)]",String.fromCharCode(60003) + "[$1]");
    return s;
};

ISprite.TextToTemp = function(mainText,s,e,rex){
    var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
    mainText = mainText.substring(tmp.length + s.length + e.length,mainText.length);
    var temp1 = tmp.replaceAll(rex,"$1");
    var temp2 = temp1.replaceAll(" ","");
    var tempe = temp2.replaceAll(" , ",",");
    return {
        over:tempe,
        main:mainText
    }
};

ISprite.getDrawTextSizeMin = function(str,ls){
    if(ls == null) ls = 1.2;
    var maxW = 0;
    var maxH = 0;
    var text = ISprite.TextAnalysis(str);
    var now_x = 0;
    var now_y = 0;
    var fontsize = 16;
    var lineSize = cont.measureText("七").width;
    maxH += lineSize;
    while (true) {
        if (text.length <= 0) { break; }
        var min = text.substring(0,1);
        text = text.substring(1);
        var c = min.charCodeAt(0);
        if (c == 60000) {
            now_x = 0;
            lineSize = cont.measureText("七").width * ls;
            now_y += lineSize;
            maxH += lineSize;
        } else if (c == 60001) {
            var rs = ISprite.TextToTemp(text, "[", "]", "\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
            text = rs.main;
        } else if (c == 60002) {
            rs = ISprite.TextToTemp(text, "[", "]", "\\[([0-9]+)]");
            cont.font = rs.over + "px "+IVal.FontName;
            text = rs.main;
        } else if (c == 60003) {
            rs = ISprite.TextToTemp(text, "[", "]", "\\[([\\w/.]+)]");
        }  else {
            var yy = now_y;
            now_x += cont.measureText(min).width;
            if(maxW < now_x) {
                maxW = now_x;
            }
            if(maxH < now_y + cont.measureText("七").width) {
                maxH = now_y + cont.measureText("七").width;
            }
        }
    }
    return {width : maxW,height : maxH};
};
//文件 - IVal.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function IVal() {

}

IVal.FPS = 60;
IVal.GWidth = 0;
IVal.GHeight = 0;
IVal.startScene = null;
IVal.scene = null;
IVal.FontColor = IColor.White();
IVal.FontSize = 18;
IVal.DEBUG = false;
IVal.FontName = "微软雅黑";
IVal.dSound = null;
IVal.regularList = {};
IVal.baseMusicPath = "";
IVal.baseBPath = "";
IVal.updateNumSp = 0;
IVal.Platform = "PC";

IVal.SceneRect = new IRect(0,0,960,540);
//文件 - IViewport.js
/**
 * Created by 七夕小雨 on 2016/11/4.
 */

function IViewport(x,y,width,heigt,viewport){

    this.plane = IPlane;
    this.plane();
    delete this.plane;

    this.width = 0;
    this.height = 0;
    this.ox = 0;
    this.oy = 0;

    this.dir = IViewport.Dir.None;
    this.type = IViewport.Type.Rectangle;
    this.eAngel = 2 * Math.PI;
    this.radius = width / 2;
    this.isAutoMove = false;
    this.endPosDX = 0;
    this.endPosDY = 0;

    var endPosX = 0;
    var endPosY = 0;
    var tmpOX = 0;
    var tmpOY = 0;
    var endOX = 0;
    var endOY = 0;
    var diffOX = 0;
    var diffOY = 0;
    var OFrames = 0;

    var isMove = false;
    var reMove = false;
    var isMove_l = false;
    var reMove_l = false;

    var rect = new IRect(1,1,1,1);

    this.fviewporte = viewport;
    this.zbox = new IBox();
    var vp = this;

    if (this.fviewporte == null) {
        this.fbox = box;
    }else{
        this.fbox = this.fviewporte.zbox;
    }
    this.fbox.add(this);



    var tempX = 0;
    var tempY = 0;

    Object.defineProperty(this, "x", {
        get: function () {
            if(vp.fviewporte != null){
                return tempX + vp.fviewporte.x + vp.fviewporte.ox;
            }else{
                return tempX;
            }
        },
        set: function (value) {
            tempX = value;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            if(vp.fviewporte != null){
                return tempY + vp.fviewporte.y + vp.fviewporte.oy;
            }else{
                return tempY;
            }
        },
        set: function (value) {
            tempY = value;
        }
    });

    if(x instanceof IRect){
        this.x = x.left;
        this.y = x.top;
        this.width = x.width;
        this.height = x.height;
    }else{
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = heigt;
    }

    this.add = function(value){
        this.zbox.add(value)
    };

    this.updateMove = function(){
        if(this.dir == IViewport.Dir.Vertical || this.dir == IViewport.Dir.All){
            getEndPosY();
            if(move_bar()) return true;
            if(this.isAutoMove){
                if(auto_bar()) return true;
            }

        }
        if(this.dir == IViewport.Dir.Horizontal || this.dir == IViewport.Dir.All){
            getEndPosX();
            if(move_bar_l()) return true;
            if(this.isAutoMove){
                if(auto_bar_l()) return true;
            }
        }
        return false;
    };

    this.update = function () {
        this.updatebase();
        if(!this.visible) return;
        updateShifting();
        cont.save();


        cont.beginPath();
        var tempX = this.x;
        var tempY = this.y;
        if(this.type == IViewport.Type.Rectangle){
            cont.lineTo(tempX , tempY);
            cont.lineTo(tempX + this.width, tempY);
            cont.lineTo(tempX + this.width , tempY + this.height);
            cont.lineTo(tempX , tempY + this.height);
        }else if(this.type == IViewport.Type.Round){
            cont.arc(tempX + this.radius, tempY + this.radius, this.radius , 0 , 2 * Math.PI , false);
        }
        cont.closePath();
        cont.clip();

        cont.scale(this.zoomX,this.zoomY);

        this.zbox.update();

        cont.restore();
    };

    this.dispose = function(){
        this.fbox.remove(this);
    };


    this.IsIn = function(){
        var x = this.x;
        var y = this.y;
        var right = this.x + this.width;
        var bottow = this.y + this.height;
        return IInput.x >= x && IInput.x <= right && IInput.y >= y && IInput.y <= bottow;
    };

    this.isShifting = function(){
        return OFrames > 0;
    };

    this.shifting = function( bOX, bOY, eOX, eOY, frames){
        if(frames <= 0){
            this.ox = eOX;
            this.oy = eOY;
        }else{
            OFrames = frames;
            endOX = eOX;
            endOY = eOY;
            diffOX = (eOX - bOX) / (frames * 1.0);
            diffOY = (eOY - bOY) / (frames * 1.0);
            tmpOX = bOX;
            tmpOY = bOY;
            this.ox = bOX;
            this.oy = bOY;
        }
    };

    this.shiftingTo = function( eOX, eOY, frames){
        this.shifting(this.ox,this.oy,eOX,eOY,frames);
    };

    function updateShifting(){
        if(OFrames <= 0) return;
        OFrames -= 1;
        if(OFrames <= 0){
            vp.ox = endOX;
            vp.oy = endOY;
        }else{
            tmpOX += diffOX;
            tmpOY += diffOY;
            vp.ox = parseInt(tmpOX);
            vp.oy = parseInt(tmpOY);
        }
    }

    function getEndPosX(){
        var endMax = 0;
        var map = vp.zbox.getAll();
        for(var key in map){
            var list = map[key];
            for(var i = 0;i<list.length;i++){
                var m = 0;
                m = list[i].x + list[i].width;
                if(m > endMax){
                    endMax = m;
                }
            }
        }
        endPosX = endMax + vp.endPosDX;
    }

    function getEndPosY(){
        var endMax = 0;
        var map = vp.zbox.getAll();
        for(var key in map){
            var list = map[key];
            for(var i = 0;i<list.length;i++){
                var m = 0;
                m = list[i].y + list[i].height;
                if(m > endMax){
                    endMax = m;
                }
            }
        }
        endPosY = endMax + vp.endPosDY;
    }

    function move_bar(){
        var oldOX = vp.oy;
        var endPos = endPosY - vp.height;
        if(IInput.move && vp.IsIn() && Math.abs(IInput.dy - IInput.y) > 10){
            var pos = vp.oy - (IInput.dy - IInput.y);
            var end = endPos > 0 ? -endPos - 300 : 0;
            if(pos <= 300 && pos >= end){
                if(!vp.isAutoMove){
                    if(pos < vp.height - endPosY) pos = vp.height - endPosY;
                    if(pos > 0) pos = 0;
                }
                vp.oy = pos;
                IInput.dy = IInput.y;
                reMove = true;
            }
            if(Math.abs(oldOX - vp.oy) > 0){
                return true;
            }

        }
        if(IInput.up && reMove){
            reMove = false;
            isMove = true;
        }
        return false;
    }

    function move_bar_l(){
        if(IInput.move && vp.IsIn() && Math.abs(IInput.dx - IInput.x) > 10){
            var pos = vp.ox - (IInput.dx - IInput.x);
            var endpos = endPosX - vp.width ;
            var end = endpos > 0 ? -endpos - 300 : 0;
            if(pos <= 300 && pos >= end){
                if(!vp.isAutoMove){
                    if(pos < vp.width - endPosX) pos = vp.width - endPosX;
                    if(pos > 0) pos = 0;
                }
                vp.ox = pos;
                IInput.dx = IInput.x;
                reMove_l = true;
            }
            return true;
        }
        if(reMove_l && IInput.up){
            reMove_l = false;
            isMove_l = true;
        }
        return false;
    }

    function auto_bar_l(){
        if(!isMove_l) return false;
        var speed = 30;
        var endpos =endPosX - vp.width;
        if(vp.ox > 0){
            if(vp.ox - speed <= 0){
                vp.ox = 0;
                isMove_l = false;
                return false;
            }else{
                vp.ox -= speed;
                return true;
            }
        }else if(vp.ox < -endpos){
            if(vp.ox + speed >= -endpos){
                vp.ox = -endpos;
                isMove_l = false;
                return false;
            }else{
                vp.ox += speed;
                return true;
            }
        }else{
            isMove_l = false;
            return false;
        }
    }

    function auto_bar(){
        if(!isMove) return false;
        var speed = 30;
        var endPos = endPosY - vp.height;
        if(vp.oy > 0){
            if(vp.oy - speed <= 0){
                vp.oy = 0;
                isMove = false;
                return false;
            }else{
                vp.oy -= speed;
                return true;
            }
        }else if(vp.oy < -endPos){
            if(vp.oy + speed >= -endPos){
                vp.oy = -endPos;
                isMove = false;
                return false;
            }else{
                vp.oy += speed;
                return true;
            }
        }else{
            isMove = false;
            return false;
        }
    }

    this.GetRect = function() {
        rect.left = this.x;
        rect.top = this.y;
        rect.right = this.x + (this.width / this.zoomX);
        rect.bottom = this.y + (this.height / this.zoomY);
        return rect;
    }
}

IViewport.Dir = {
    All: 0,
    Horizontal: 1,
    None: 2,
    Vertical: 3
};

IViewport.Type = {
    Rectangle : 0,
    Round : 1
};
//文件 - IWeb.js
/**
 * Created by 七夕小雨 on 2016/11/10.
 */

function IWeb(){}

IWeb.getUrl = function (url,async) {
    var asy = async || false;
    var html = $.ajax({url: url, async: asy});
    return html.responseText;
};

IWeb.openUrl = function(url){
    window.open(url);
};

IWeb.getBitmapFromURL = function(url){
    var image = new Image();
    image.src = url;
    return image;
};

IWeb.getJsonpObj = function(url,fuc){
    $.ajax({
        type:"get",
        async:true,
        url:url,
        dataType:"jsonp",
        success:function(data){
            fuc(data);
        },
        error:function(){
            console.log(url + "  抓取失败");
        }
    })
};

IWeb.getJsonObj = function(url,fuc){
    $.ajax({
        type:"get",
        async:true,
        url:url,
        dataType:"json",
        success:function(data){
            fuc(data);
        },
        error:function(){
            console.log(url + "  抓取失败");
        }
    })
};

function PlayVideo(url,volume,type){
    var label_div1 = document.getElementById("main_div");
    var video_label = document.createElement("video");
    video_label.setAttribute("width","100%");
    video_label.setAttribute("height","100%");
    video_label.setAttribute("controls", "controls");
    video_label.src = url;
    canvas.style.display = "none";
    label_div1.insertBefore(video_label,label_div1.childNodes[0]);
    //video_label.play();
    cacheOver = false;
    video_label.onended = function(){
        cacheOver = true;
        label_div1.removeChild(video_label);
        canvas.style.display = "block";
    };
}
//文件 - SText.js
/**
 * Created by 七夕小雨 on 2016/11/3.
 */

function SText() {

    IAudio.playBGM("https://xz.tingmall.com/content/17/548/17548281-MP3-320K-FTD.mp3?sign=33aa79d11c5f7e0687037bbebcee3073&t=610d249b&transDeliveryCode=FUJCPGTDCS@0@1628245891@S@c06a6704b76c79b1",80);

    var sp = new ISprite(80,20,IColor.Red());
    sp.x = 100;
    sp.y = 300;
    sp.drawTextQ("获得输入文本",0,0,IColor.Black(),14);

    var sp1 = new ISprite(80,20,IColor.Red());
    sp1.x = 200;
    sp1.y = 300;
    sp1.drawTextQ("清除文字",0,0,IColor.Black(),14);

    var sp2 = new ISprite(80,20,IColor.Red());
    sp2.x = 300;
    sp2.y = 300;
    sp2.drawTextQ("获得焦点",0,0,IColor.Black(),14);

    var sp3 = new ISprite(80,20,IColor.Red());
    sp3.x = 400;
    sp3.y = 300;
    sp3.drawTextQ("获得失去",0,0,IColor.Black(),14);

    var input = new IInputBox(150,16,IColor.Green(),IColor.Red(),30,30);
    input.x = 100;
    input.y = 200;
    input.fontSize = 14;
    input.fontColor = IColor.White();
    input.align = 0;
    input.setBorderRadius(0);

    input.focus();


    var fontsize = 18;
    var str = "这是一段测试文字";
    var back = new ISprite(300,50,IColor.Green());
    var text = new ISprite(300,50,IColor.Green());
    text.z = 100;
    back.y = text.y = 50;
    back.x = text.x = 200;
    drawText();



    function drawText(){
        text.clearBitmap();
        str = "\\s[" + fontsize + "]\\c[0,0,0]这是一段测试文字";
        var size = ISprite.getDrawTextSize(str,false,0,1.5);
        //text.drawText("\\s[18]\\c[0,0,0]" + str,(300 - size.width) / 2,(50 - size.height) / 2,0,IColor.Black(),false,100);

        text.drawText("\\s[18]\\c[0,0,0]" + str,(300 - size.width) / 2,15,0,IColor.Black(),false,100);

    }

    this.update = function(){
        if(input != null){
            input.update();
        }
        //获得文本内容
        if(IInput.up && sp.isSelected()){
            IAudio.BGMFade(1);
            //IInput.up = false;
            //fontsize -= 1;
            //drawText();
        }
        if(IInput.up && sp1.isSelected()){
            IAudio.stopBGM();
            //IInput.up = false;
            //fontsize += 1;
            //drawText();
            //input.setText("");
        }
        if(IInput.up && sp2.isSelected()){
            IInput.up = false;
            IAudio.playBGM("music/battle.mp3",80);
            //input.focus();
        }
        if(IInput.up && sp3.isSelected()){
            IInput.up = false;
            input.dispose();
            input = null;
        }
    };


    this.dispose = function(){
        input.dispose();
    };

}

function RF(){}
RF.RandomChoose = function(ary){
    return ary[Math.floor(Math.random() * ary.length)];
};

RF.ProbabilityHit = function(rate){
    var r = Math.random();
    return rate > r;
};
