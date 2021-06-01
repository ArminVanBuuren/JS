"use strict";

function BreakoutGame(onCountScore, submitStatus){
    BaseView.call(this); // явно вызываем конструктор класса родителя
    var self = this;

    var canvas = null;
    var context = null;

    var running = false; // игра проинициализировалась
    var started = false; // игрок начал игру
    
    var currentScore = 0;
    var totalScore = 0;


    var isWinner = false;
    var currentRound = 1;
    var currentGame = 0;

    var imgs = {
        ball: {value: null, file: "imgs/breakout/ball.png"},
        platform: {value: null, file: "imgs/breakout/platform.png"},
        blockBlue: {value: null, file: "imgs/breakout/block-blue.png"},
        blockGreen: {value: null, file: "imgs/breakout/block-green.png"},
        blockIron: {value: null, file: "imgs/breakout/block-iron.png"},
        blockRed: {value: null, file: "imgs/breakout/block-red.png"},
        blockViolet: {value: null, file: "imgs/breakout/block-violet.png"},
        blockWhite: {value: null, file: "imgs/breakout/block-white.png"},
        blockYellow: {value: null, file: "imgs/breakout/block-yellow.png"},
        explode: {value: null, file: "imgs/breakout/explode.png"},
        gameOver: {value: null, file: "imgs/breakout/game-over.png"},
        tapToPlay: {value: null, file: "imgs/breakout/tap-to-play.png"},
        youWon: {value: null, file: "imgs/breakout/you-won.png"},
    };
    var sounds = {
        chpok: {value: null, file: "sounds/chpok.mp3"},
        boundary: {value: null, file: "sounds/boundary.mp3"},
        gameOver: {value: null, file: "sounds/game-over.mp3"},
        youWon: {value: null, file: "sounds/you-won.mp3"},
    };
    
    var ball = null;
    var platform = null;
    var blocks = null;

    var viewportWidth = null;
    var viewportHeight = null;
    var mouseX = null;
    var mouseY = null;
    var cvx = null;
    var cvy = null;
    var mouseIsDown = false;
    var forwardImg = null;
    var disposed = false;

    self.start = function(soundsOn){
        init(soundsOn);
    };

    function init(soundsOn){
        canvas = document.getElementById("gameCanvas");
        context = canvas.getContext("2d");
        canvas.focus();

        viewportWidth = canvas.width;
        viewportHeight = canvas.height;
        mouseX = (canvas.width - viewportWidth);
        mouseY = (canvas.height - viewportHeight);
        cvx = (canvas.width - viewportWidth) * .5;
        cvy = (canvas.height - viewportHeight) * .5;


        preLoad().then(function(){
            self.changeSoundsMode(soundsOn);
        }).then(function(){
            reset();
        }).then(function(){
            assignEvents(true);
            run();
        });
    }

    function preLoad(){
        
        var chain = new Promise(function(resolve) { resolve(null); });

        if (imgs){
            
            for (let key in imgs) {
                chain = chain.then(function(result){
                    self.downloadImgPromise(imgs[key]);
                });
            }
        }

        if (sounds){

            for (let key in sounds) {
                chain = chain.then(function(result){
                    self.downloadSoundPromise(sounds[key]);
                });
            }
        }

        return chain;
    }

    function reset(){
        if (isWinner){
            currentGame = self.random(0, 5);
        }

        ball = new BallControl(canvas, context, imgs, sounds);

        platform = new PlatformControl(canvas, context, imgs, sounds);
        platform.ball = ball;

        blocks = new BlockCollectionControl(canvas, context, imgs, sounds);
        blocks.create(currentGame);

        
        if (isWinner)
            currentRound++;

        currentScore = 0;
        forwardImg = imgs.tapToPlay.value;
        running = true;
    }

    function assignEvents(assign){

        if (assign){
            document.addEventListener('mousemove', mouseMoveHandler, false);
            document.addEventListener('mousedown', mouseDownHandler, false);
            document.addEventListener('mouseup', mouseUpHandler, false);
    
            document.addEventListener('keydown', keyDownHandler, false);
            document.addEventListener('keyup', keyUpHandler, false);
            document.addEventListener('scroll', keyUpHandler, false);
    
            canvas.addEventListener('touchstart', touchStartHandler, false);
            document.addEventListener('touchmove', touchMoveHandler, false);
            document.addEventListener('touchend', touchEndHandler, false);
        }
        else{
            document.removeEventListener('mousemove', mouseMoveHandler, false);
            document.removeEventListener('mousedown', mouseDownHandler, false);
            document.removeEventListener('mouseup', mouseUpHandler, false);
    
            document.removeEventListener('keydown', keyDownHandler, false);
            document.removeEventListener('keyup', keyUpHandler, false);
            document.removeEventListener('scroll', keyUpHandler, false);
    
            canvas.removeEventListener('touchstart', touchStartHandler, false);
            document.removeEventListener('touchmove', touchMoveHandler, false);
            document.removeEventListener('touchend', touchEndHandler, false);
        }
    }

    function keyDownHandler(e) {
        e = e || window.event;
        playerReactingFound(e.keyCode, e);
    }

    function keyUpHandler(e) {
        e = e || window.event;
        playerReactingLost(e);
    }
    
    function mouseDownHandler(e) {
        e = e || window.event;

        if (!isControlSensorOnCanvas(mouseX, mouseY))
            return;

        if (!started){
            playerReactingFound(self.KEYS.SPACE, e);
        }
        else{
            playerReactingFound(mouseX < (canvas.offsetLeft + canvas.width / 2) ? self.KEYS.LEFT : self.KEYS.RIGHT, e);
        }
    }

    function mouseMoveHandler(event) {

        mouseX = event.clientX - cvx;
        mouseY = event.clientY - cvy;

        if (mouseIsDown && !isControlSensorOnCanvas(mouseX, mouseY)){
            playerReactingLost();
        }
    }

    function mouseUpHandler(e) {
        e = e || window.event;
        
        if (mouseIsDown){
            playerReactingLost(e);
        }
    }

    function touchStartHandler(e) {

        if (e.touches.length == 1) {

            mouseX = e.touches[0].pageX - cvx;
            mouseY = e.touches[0].pageY - cvy;

            mouseDownHandler(e);
        }
    }

    function touchMoveHandler(e) {

        if (e.touches.length == 1) {

            mouseX = e.touches[0].pageX - cvx;
            mouseY = e.touches[0].pageY - cvy;

            if(mouseIsDown && !isControlSensorOnCanvas(mouseX, mouseY)){
                playerReactingLost(e);
            }
        }
    }

    function touchEndHandler() {

        if (mouseIsDown){
            playerReactingLost();
        }
    }

    function isControlSensorOnCanvas(mouseX, mouseY){
        return mouseY > canvas.offsetTop && mouseY < (canvas.offsetTop + canvas.height)
            && mouseX > canvas.offsetLeft && mouseX < (canvas.offsetLeft + canvas.width);
    }

    function playerReactingFound(keyCode, e){

        if (!running){
            reset();
            return;
        }

        if (keyCode === self.KEYS.SPACE && startNewGame()){
            started = true;
            mouseIsDown = true;
            if (e)
                e.preventDefault();
        }
        else if (keyCode === self.KEYS.LEFT || keyCode === self.KEYS.RIGHT){
            platform.start(keyCode);
            mouseIsDown = true;
            if (e)
                e.preventDefault();
        }
    }

    function playerReactingLost(e){

        if (!running){
            reset();
            return;
        } 

        if (platform.isMoved()){
            platform.stop();
            if (e)
               e.preventDefault();
        }

        mouseIsDown = false;
    }

    function startNewGame(){
        if (platform.fire()){
            forwardImg = null;
            sounds.youWon.value.pause();
            sounds.gameOver.value.pause();
            return true;
        }
        return false;
    }

    self.refreshSize = function(){
        viewportWidth = canvas.width;
        viewportHeight = canvas.height;

        self.RAF(function(){
            render();
        });
    }


    function run(){
        if (!disposed){
            self.RAF(function(){
                update();
                render();
                run();
            });
        }
    }

    function update(){
        collideBlock();
        collidePlatform();
        if (ball.collideWorldBounds() == undefined){
            endOfGame(false);
        }
        platform.collideWorldBounds();

        platform.move(); 
        ball.move();
    }

    function collideBlock(){
        if (blocks.collideBlock(ball)){
            ball.bumbBloсk();
            addScore();
        }
    }

    function collidePlatform(){
        if (ball.collide(platform)){
            ball.bumbPlatform(platform);
        }
    }

    function addScore(){

        currentScore++;
        sendScore(totalScore + currentScore);

        if (currentScore >= blocks.items.length){
            endOfGame(true);
        }
    }

    function endOfGame(playerWon){
        
        ball.stop();
        platform.stop();
        isWinner = playerWon;

        if (playerWon){
            forwardImg = imgs.youWon.value;
            totalScore += currentScore;
            sendSubmitStatus();

            sounds.youWon.value.currentTime = 0; 
            sounds.youWon.value.play();
        }
        else{
            forwardImg = imgs.gameOver.value;
            sendScore(totalScore);

            sounds.gameOver.value.currentTime = 0; 
            sounds.gameOver.value.play();
        }

        // небольшая задержка чтобы показать результат
        setTimeout(function() {
            running = false;
            started = false;    
        }, 1000);

        if (navigator.vibrate)
            window.navigator.vibrate(60);
    }

    function sendScore(score){
        if (onCountScore && typeof onCountScore === 'function')
            onCountScore(score);
    }

    function sendSubmitStatus(){
        if (submitStatus && typeof submitStatus === 'function')
            submitStatus();
    }

    function render(){

        // полная очистка канваса
        context.clearRect(0, 0, canvas.width, canvas.height); 

        ball.render();
        platform.render();
        blocks.render();
        
        if (forwardImg){
            context.globalCompositeOperation = "source-over";
            context.fillStyle = "#00000069";
            context.fillRect(0,0, canvas.width, canvas.height);
            renderAligmentImg(forwardImg);

            context.font = "35px Chava";
            context.fillStyle = "#ffffff";
            context.textAlign = "center";
            context.textBaseline = "top"
            context.fillText("Round: "  + currentRound, canvas.width / 2, canvas.height / 14);
       }

    }

    function renderAligmentImg(img){
        let dWidth = canvas.width / 2;
        let ratio = dWidth / img.width;
        let dHeight = img.height * ratio;
        
        context.drawImage(
            img, 
            0,
            0,
            img.width, 
            img.height, 
            dWidth / 2, 
            (canvas.height - dHeight) / 2, 
            dWidth, 
            dHeight);
    }

    self.changeSoundsMode = function(modeOn){

        if (modeOn){
            for (let key in sounds) {
                if (sounds[key].value.volume)
                    sounds[key].value.volume = 1;
            }
        }
        else{
            for (let key in sounds) {
                if (sounds[key].value.volume)
                    sounds[key].value.volume = 0;
            }
        }
    }

    self.dispose = function(){
        running = false;
        started = false;
        disposed = true;
        assignEvents(false);
        console.log("disposed");
    }
}
BreakoutGame.prototype = Object.create(BaseView.prototype);
BreakoutGame.prototype.constructor = BreakoutGame;