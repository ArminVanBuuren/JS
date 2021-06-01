"use strict";

function MainView(){
    BaseView.call(this);

    var self = this;

    var header = null;
    var footer = null;
    var scoreCurrent = null;
    var scoreBest = null;
    var scoreRecord = null;
    var descElement = null;
    var canvas = null;
    var context = null;
    var mainTag = null;
    var main = null;
    var background = null;

    var soundsButton = null;
    var audio = null;
    var musicButton = null;

    var sprites = {
        soundsOn: { image: null, file: "sound-on.svg"},
        soundsOff: { image: null, file: "sound-off.svg"},
        musicOn: { image: null, file: "music-on.svg"},
        musicOff: { image: null, file: "music-off.svg"},
    };

    var smoothTransitionMSec = 500;
    var collectPrevious = null;

    self.init = function(soundsOn, musicOn){

        header = document.getElementsByTagName("header")[0];
        footer = document.getElementsByTagName("footer")[0];

        scoreCurrent = document.getElementsByClassName('score-current')[0];
        scoreBest = document.getElementsByClassName('score-best')[0];
        scoreRecord = document.getElementsByClassName('score-record')[0];

        canvas = document.getElementById("gameCanvas");
        context = canvas.getContext("2d");

        mainTag = document.getElementsByTagName("main")[0];
        main = document.getElementsByClassName("main-spa")[0];
        descElement = document.getElementById('description');
        background = document.getElementById('l-form-bg');

        soundsButton = document.getElementById('soundsButton');
        audio = document.getElementById('audio');
        audio.volume = 0.8;
        musicButton = document.getElementById('musicButton');
        main.innerHTML = "";

        preloadImgs(soundsOn, musicOn);
    }

    function preloadImgs(soundsOn, musicOn){
        let currentLoaded = 0;
        let required = Object.keys(sprites).length;

        var loadedHaderImgs = function(){    
            currentLoaded++;
            if (currentLoaded >= required){
                self.changeSoundsMode(soundsOn);
                self.changeMusicMode(musicOn);
            }
        }
        self.preloadSprites(sprites, loadedHaderImgs);
    }

    var pName = "";
    self.player = {
        get name() {
            if (pName)
                return pName;
            let signUpValue = document.getElementById('signUpValue');
            if (signUpValue != undefined)
                pName = signUpValue.value;
            return pName;
        },
        set name(value){
            pName = value;
            if (document.getElementById('signUpValue') != undefined)
                document.getElementById('signUpValue').value = value;
        },
        get currentScore(){
            return Number(scoreCurrent.innerText) || 0;
        },
        set currentScore(value){
            return scoreCurrent.innerText = value;
        },
        set bestScore(value){
            scoreBest.innerText = value;
        },
        set recordScore(value){
            scoreRecord.innerText = value;
        },
        set description(value){
            descElement.innerHTML = "Hello <div>" + self.player.name + "!</div> " + value;
        },
    }

    self.updatePlayer = function(currentPlayer, description){

        self.player.name = currentPlayer.name;
        self.player.bestScore = currentPlayer.best;
        if (description)
            self.player.description = description;
    }

    self.changeSoundsMode = function(modeOn){
        soundsButton.style.backgroundImage = "url('imgs/" + (modeOn ? sprites.soundsOn.file : sprites.soundsOff.file) +  "')";
    }

    self.changeMusicMode = function(modeOn){
        
        if(!audio.play)
            return;

        let img = "";
        if (modeOn){
            audio.play();
            img = "url('imgs/" + sprites.musicOn.file +  "')";
        }
        else{
            audio.pause();
            if (audio.currentTime)
                audio.currentTime = 0; 
            img = "url('imgs/" + sprites.musicOff.file +  "')";
        }

        setTimeout(function(){
            musicButton.style.backgroundImage = img;
        }, 200);
    }


    
    self.smoothSwitch = function(loadContainerFunc){
        
        smoothVisible(false);
        setTimeout(function (){
            loadContainer(loadContainerFunc); 
        }, smoothTransitionMSec);
    }

    function loadContainer(loadContainerFunc){
        
        if (collectPrevious !== null && typeof collectPrevious === 'function'){
            collectPrevious();
        }

        // очищаем от прошлого контейнера
        main.innerHTML = "";
        // загружаем новый и сохраняем в текущих
        collectPrevious = loadContainerFunc();

        descElement.style.opacity = self.player.name ? "1" : "0";

        // TODO. Очень странная штука, без таймера не работает плавное отображение. self.RAF тоже не помогает
        setTimeout(function() {
            smoothVisible(true);
            self.resize();
        }, 20);
    }

    function smoothVisible(show){

        if (show){
            mainTag.classList.remove("hide-spa-container");
            mainTag.classList.add("show-spa-container");
        }     
        else{
            mainTag.classList.remove("show-spa-container");
            mainTag.classList.add("hide-spa-container");
        }
    }

    self.loadLoadingContainer = function(){
        mainEnableTable();
        background.classList.add("bg-blur");
        main.innerHTML = getLoadingContainer(4, true);
        return function(){
            background.classList.remove("bg-blur");
        }
    }

    // TODO. IE не поддерживает дефолтное присваивание getLoadingContainer(count = 4)
    function getLoadingContainer(count, isMain){

        let current = "";
        if (count > 0){
            count--;
            current = "<div class=\"loader-div\">" + getLoadingContainer(count, false) + "</div>";
        }

        if(isMain)
            return "<div class=\"loader-parent\"><div class=\"loader-container\">" + current + "</div></div>";
        return current;
    }

    // TODO. IE не поддерживает знаки ``
    self.loadRegistrationContainer = function(createNewUserFunc){
        mainEnableTable();
        var btn = document.createElement("button");
        btn.addEventListener("click", createNewUserFunc, false);
        btn.classList.add("btn");
        btn.classList.add("btnOk");

        main.innerHTML = "<div class=\"IRegister\">" +
                            "<div class=\"sign-in-img\"></div>" +
                            "<div class=\"sign-in-form container\">" +
                                "<h2>enter your name for start</h2>" +
                                "<div id=\"registerPlayer\" class=\"flex-parent\">" +
                                    "<input type=\"text\" id=\"signUpValue\" placeholder=\"Name\">" +
                                "</div>" +
                            "</div>" +
                        "</div>";

        // "<form name=\"register\"><button class=\"btn btnOk\" type=\"submit\"></button></form>"  - submit обновляет страницу

        var regDiv = document.getElementById("registerPlayer");
        regDiv.appendChild(btn);
        
        return function(){
            btn.removeEventListener("click", createNewUserFunc, false);
        }
    }
    // onclick=\"currentView.createNewPlayer(event);\"



    // 1. [^.+$] 2. [\"] - [\\\"] 3. [^(\s*)(.+)$] - [$1"$2" +] +)
    self.loadAboutContainer = function(){
        mainDisableTable();
        main.innerHTML = "<div class=\"about-parent\">" +
        "<div class=\"about-container\">" +
            "<h2>Breakout or Arkanoid</h2>" +
            "<div class=\"about-info\">" +
                
                "<div class=\"about-video\">" +
                    "<video data-object-fit=\"cover\" data-object-position=\"center center\" autoplay=\"autoplay\" loop=\"loop\" muted=\"muted\" playsinline=\"playsinline\">" +
                        "<source src=\"./video/breakout.mp4\" type=\"video/mp4\">" +
                    "</video>" +
                    "<a href=\"https://www.youtube.com/watch?v=LhMWvl-2y0k\" class=\"l-header__play-button\" target=\"_blank\" savefrom_lm_index=\"2\" savefrom_lm=\"1\">" +
                        "<img src=\"./imgs/button-you-play.png\" alt=\"Play\">" +
                    "</a>" +
                    
                "</div>" +


                "<div class=\"about-par\">" +
                    "<p>Breakout is an arcade game developed and published by Atari, Inc., and released on May 13, 1976. It was conceptualized by Nolan Bushnell and Steve Bristow, influenced by the seminal 1972 Atari arcade game Pong, and built by Steve Wozniak.</p>" +
                    "<p>Breakout was the basis and inspiration for certain aspects of the Apple II personal computer. In Breakout, a layer of bricks lines the top third of the screen and the goal is to destroy them all. A ball moves straight around the screen, bouncing off the top and two sides of the screen." +
                    "</p>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>";
    }

    self.chooseGame = function(games){
        mainEnableTable();

        let gamesContainer = "<div class=\"about-parent choose-game\">" +
                                "<div class=\"about-container\" >" + 
                                    "<h2>Choose a game</h2>" +
                                    "<div class=\"choose-box\">";
        for (let key in games) {
            var game = games[key];
            gamesContainer += "<a href=\"" + game.hashCode + "\">" +
                                    "<span></span>" +
                                    "<span></span>" +
                                    "<span></span>" +
                                    "<span></span>" +
                                    game.key +
                                "</a>";
            
        }
        gamesContainer +=  "</div>" + "</div>" + "</div>";
        main.innerHTML = gamesContainer;
    }

    self.loadGameCanvas = function(){
        canvas.style.display = "block";
        return function(){
            canvas.style.display = "none";
        };
    }

    self.resize = function(){
        
        let width = document.documentElement.clientWidth;
        let minHeight = footer.offsetTop - header.offsetHeight;
        
        resizeCanvas(width -40, minHeight);
        mainTag.style.minHeight = minHeight + "px";
    }

    let screenRatio = 1280 / 720;
    // избавляет от мерцания канваса при изменении размера
    function resizeCanvas(width, height) {
        
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        var tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(canvas, 0, 0);

        let widthAlighByHeight = Math.round(height * screenRatio);
        if (widthAlighByHeight > width){
            canvas.width = width;
            canvas.height = width / screenRatio;
        }
        else{
            canvas.width = widthAlighByHeight;
            canvas.height = height;
        }

        context.drawImage(tempContext.canvas, 0, 0);
    }

    self.alertMessage = function (type, err){
        alert(err);
    }

    // Этот костыль был сделал только из за IE. Т.к. IE плохо работает с флексами
    function mainEnableTable(){
        mainTag.classList.add("main-to-table");
        main.classList.add("main-spa-to-table");
    }

    // Этот костыль был сделал только из за IE. Т.к. IE плохо работает с флексами
    function mainDisableTable(){
        mainTag.classList.remove("main-to-table");
        main.classList.remove("main-spa-to-table");
    }
}
MainView.prototype = Object.create(BaseView.prototype);
MainView.prototype.constructor = MainView;