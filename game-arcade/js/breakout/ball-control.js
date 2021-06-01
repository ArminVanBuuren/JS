"use strict";

function BallControl(cnv, ctx, is, ss){
    UIControl.call(this, cnv, ctx, is, ss);
    var self = this;

    self.velocityX = 6;
    self.velocityY = 6;

    self.x = 600;
    self.y = 630;

    self.maxFramesX = 3;
    self.imgWidth = 75;
    self.imgHeight = 75;

    self.width = 20;
    self.height = 20;

    
    self.image = self.imgs.ball;

    self.start = function(){
        self.dy = -self.velocityY;
        self.dx = self.random(-self.velocityX, self.velocityX);
        animate();
    };

    function animate() {
        if (self.maxFramesX && self.maxFramesX > 0){
            setInterval(function(){
                self.frameX++;
                if (self.frameX > self.maxFramesX)
                    self.frameX = 0;
            }, 50);
        }
    };

    self.move = function(){
        if (self.dy){
            self.y += self.dy;
        } 
        if (self.dx){
            self.x += self.dx;
        }
    };


    self.collide = function(element){
        // проверка на следующем кадре анимации
        let x = self.x + self.dx;
        let y = self.y + self.dy;

        var touched =
        // правая сторона мяча, правее чем левая сторона касающего элемента
        x + self.width > element.x &&
        // левая сторона мяча, левее чем правая сторона касающего элемента
        x < element.x + element.width &&
        // нижняя стороная ниже чем верхняя сторона касающего элемента
        y + self.height > element.y &&
        // верхняя сторона мяча выше чем нижняя сторона касающего элемента
        y < element.y + element.height;

        return touched;
    };

    self.collideWorldBounds = function(){

        // проверка на следующем кадре анимации
        let ballLeft = self.x + self.dx;
        let ballRight = ballLeft + self.width;
        let ballTop = self.y + self.dy;
        let ballBottom = ballTop + self.height;

        let worldLeft = 0;
        let worldRight = self.canvasWidth;
        let worldTop = 0;
        let worldBottom = self.canvasHeight;

        if (ballLeft < worldLeft){
            self.x = worldLeft; // чтобы мяч не касался левой грани экрана
            self.dx *= -1;
            playSound();
        }
        else if (ballRight > worldRight){
            self.x = worldRight - self.width;
            self.dx *= -1;
            playSound();
        }
        else if (ballTop < worldTop){
            self.y = worldTop;
            self.dy *= -1;
            playSound();
        }
        else if (ballTop > worldBottom){
            return undefined;
        }
        return true;
    };

    self.bumbBloсk = function(){
        self.dy *= -1;
        playSound(1);
    };

    function playSound(sound){
        switch(sound){
            case 1: {
                self.sounds.chpok.value.currentTime = 0; 
                self.sounds.chpok.value.play();
                break;
            }
            default: {
                self.sounds.boundary.value.currentTime = 0; 
                self.sounds.boundary.value.play();
                break;
            }
        }
        
    }

    self.bumbPlatform = function(platform){
        // если мяч попадает в бок платформы, то мяч должен двигаться со скоростью платформы
        if (platform.dx){
            self.x += platform.dx;
        }

        // если мяч уже оттолкнулся и летит вверх то выполняь уже не надо
        if (self.dy > 0) {
            self.dy = -self.velocityY;
            let touchX = self.x + self.width / 2;
            self.dx = self.velocityX * platform.getTouchOffset(touchX);
        }

        playSound();
        if (navigator.vibrate)
            window.navigator.vibrate(30);
    };
}
BallControl.prototype = Object.create(UIControl.prototype);
BallControl.prototype.constructor = BallControl;
