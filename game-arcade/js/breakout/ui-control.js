"use strict";

// базовый контрол
function UIControl(cnv, ctx, is, ss){
    BaseControl.call(this);
    var self = this;


    self.canvas = cnv;
    self.context = ctx;
    self.imgs = is;
    self.sounds = ss;


    self.image = null;

    // дефолтные настройки
    self.canvasWidth = 1280;
    self.canvasHeight = 720;


    self.velocityX = 0;
    self.velocityY = 0;
    self.dx = 0;
    self.dy = 0;
    self.x = 0;
    self.y = 0;

    // рамеры самой картинки
    self.imgWidth = 0;
    self.imgHeight = 0;

    self.imgOffsetX = 0;
    self.imgOffsetY = 0;

    // размеры на экране канваса    
    self.width = 0;
    self.height = 0;
    
    self.maxFramesX = 0; // количество картинок в спрайте по оси X
    self.maxFramesY = 0; // количество картинок в спрайте по оси Y
    // текущий фрейм
    self.frameX = 0;
    self.frameY = 0;

    // Object.defineProperty(member, 'isGuest', {
    //     get: function() { return this.firstName=='Guest' }
    //   });


    // TODO. не видит остальные объекты класса, если добавить его в прототип (UIControl.prototype.calc)
    self.calc = {
        // скорость перемещения по X
        get velocityX(){
            return self.velocityX * self.getPartByX();
        },
        // скорость перемещения по Y
        get velocityY(){
            return self.velocityY * self.getPartByY();
        },
        // признак движения
        get dx(){
            return self.dx * self.getPartByX();
        },
        // признак движения
        get dy(){
            return self.dy * self.getPartByY();
        },
        // стартовая точка
        get x(){
            return self.x * self.getPartByX();
        },
        // стартовая точка
        get y(){
            return self.y * self.getPartByY();
        },
        get width(){
            return self.width * self.getPartByX();
        },
        get height(){
            return self.height * self.getPartByY();
        },
    };

};
UIControl.prototype = Object.create(BaseControl.prototype);
UIControl.prototype.constructor = UIControl;
UIControl.prototype.getPartByX = function(){
    return this.canvas.width / this.canvasWidth;
};
UIControl.prototype.getPartByY = function(){
    return this.canvas.height / this.canvasHeight;
};
UIControl.prototype.isMoved = function(){
    return this.dx != 0 || this.dy != 0;
};
UIControl.prototype.stop = function(){
    this.dx = 0;
    this.dy = 0;
};
UIControl.prototype.render = function(){

    this.context.drawImage(
        this.image.value, 
        this.frameX * (this.imgWidth + this.imgOffsetX) + this.imgOffsetX, 
        this.frameY * (this.imgHeight + this.imgOffsetY) + this.imgOffsetY, 
        this.imgWidth, 
        this.imgHeight, 
        this.calc.x, 
        this.calc.y, 
        this.calc.width, 
        this.calc.height);
}