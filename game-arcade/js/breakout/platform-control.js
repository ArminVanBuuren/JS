"use strict";

// платформа
function PlatformControl(cnv, ctx, is, ss){
    UIControl.call(this, cnv, ctx, is, ss);
    var self = this;

    self.velocityX = 10;

    self.x = 560;
    self.y = 650;

    self.imgOffsetX = 37;
    self.imgOffsetY = 0;
    self.imgWidth = 265;
    self.imgHeight = 60;

    self.width = 100;
    self.height = 30;

    self.ball = null;

    self.image = self.imgs.platform;

    self.fire = function(){
        if (self.ball){
            self.ball.start();
            self.ball = null;
            return true;
        }
        return false;
    };

    self.start = function(direction){
        if (direction === self.KEYS.LEFT){
            self.dx = -self.velocityX;
        }
        else if (direction === self.KEYS.RIGHT){
            self.dx = self.velocityX;
        }
    };

    self.move = function(){
        if (self.dx){
            self.x += self.dx;
            if (self.ball){
                self.ball.x += self.dx;
            }
        }
    };

    self.getTouchOffset = function(touchX){

        // Делим плптформу на две части.
        // Определяем точку соприкосновения мяча с платформой.
        // Вычитаем 1, т.к. у нас платформа состоит из 2 частей. 
        // Левая часть будет отрицательной, правая положительной

        let touchInPltatform = touchX - self.x;
        let result = ((2 * touchInPltatform / self.width) - 1) + self.randomFrac(-0.001, 0.001);
        return result;
    };

    self.collideWorldBounds = function(){
        let x = self.x + self.dx;
        if (x < 0 || (x + self.width) > self.canvasWidth)
            self.dx = 0;
    };
}
PlatformControl.prototype = Object.create(UIControl.prototype);
PlatformControl.prototype.constructor = BallControl;