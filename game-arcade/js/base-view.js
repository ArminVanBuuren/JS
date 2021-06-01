"use strict";

// самый базовый класс
function BaseControl(){
    
}
BaseControl.prototype.KEYS = {
    ESC: 27,
    LEFT: 37,
    TOP: 38,
    RIGHT: 39,
    BOTTOM: 40,
    SPACE: 32,
};
BaseControl.prototype.random = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};
BaseControl.prototype.randomFrac = function(min, max){
    return Math.random() * (max - min) + min;
};
BaseControl.prototype.preloadSprites =  function(sprites, onResourceLoad){
    for (let key in sprites) {
        let item = sprites[key];
        item.image = new Image();
        item.image.src = "imgs/" + item.file;
        if (onResourceLoad != undefined)
            item.image.addEventListener("load", onResourceLoad);
    }  
};
BaseControl.prototype.preloadAudio = function(sounds, onResourceLoad){
    for (let key in sounds) {
        sounds[key] = new Audio("sounds/" + key + ".mp3");
        // по факту полной предзагрузки
        if (onResourceLoad != undefined)
            sounds[key].addEventListener("canplaythrough", onResourceLoad, { once:true });
    }
};
BaseControl.prototype.currentIsIE = function(){
    return /MSIE \d|Trident.*rv:/.test(navigator.userAgent);
};


// базовый класс для View
function BaseView(){
    BaseControl.call(this);
}
// сначала наследуем базовые прототипы
BaseView.prototype = Object.create(BaseControl.prototype);
BaseView.prototype.constructor = BaseView;
// затем создаем свои
// https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
BaseView.prototype.RAF = (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    // ни один не доступен будем работать просто по таймеру
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
).bind(window);
BaseView.prototype.downloadImgPromise = function(item){
    return new Promise(function(resolve){
        item.value = new Image();
        item.value.src = item.file;
        item.value.addEventListener("load", function(){ resolve(item); });
    });
};
BaseView.prototype.downloadSoundPromise = function(item){
    return new Promise(function(resolve){
        item.value = new Audio(item.file);
        // по факту полной предзагрузки
        item.value.addEventListener("canplaythrough", function(){ resolve(item); }, { once:true });
    });
};
