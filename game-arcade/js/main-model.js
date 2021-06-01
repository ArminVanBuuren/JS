"use strict";

function MainModel(view, db){
    var self = this;

    var mainView = view;
    var dataStorage = db;
    var dataStorageStates = {};
    var gameDescriptionKey = "description";
    var gameDescriptionValue = null;
    var hashState = {
        loading: { key: "loading", hashCode: "#loading", userCanSet: false },
        register: { key: "register", hashCode: "#register", userCanSet: false },
        choose: { key: "choose", hashCode: "#choose", userCanSet: true },
        about: { key: "about", hashCode: "#about", userCanSet: true }
    };
    var currentGame = null;
    var games = {
        breakout: { key: "breakout", hashCode: "#breakout"},
    };
    var lastHashState = "";

    var vCurrentGuid = "";
    self.current = {
        get guid(){
            if (vCurrentGuid)
                return vCurrentGuid;
            vCurrentGuid = window.localStorage.getItem('currentGuid');
            return vCurrentGuid;
        },
        set guid(value){
            vCurrentGuid = value;
            window.localStorage.setItem('currentGuid', vCurrentGuid);
        },
        get state(){
            return window.location.hash.substr(1).toLowerCase();
        },
        get isPlaying(){
            return lastHashState && lastHashState in games && currentGame;
        },
        get musicOn(){
            var value = window.localStorage.getItem('musicOn');
            if (value != undefined) 
                return stringToBoolean(value);

            window.localStorage.setItem('musicOn', true);
            return true;
        },
        set musicOn(value){
            if (typeof value === "boolean")
                window.localStorage.setItem('musicOn', value);
        },
        get soundsOn(){
            var value = window.localStorage.getItem('soundsOn');
            if (value != undefined) 
                return stringToBoolean(value);

            window.localStorage.setItem('soundsOn', true);
            return true;
        },
        set soundsOn(value){
            if (typeof value === "boolean")
                window.localStorage.setItem('soundsOn', value);
        },
    }
    
    function stringToBoolean(string){
        switch(string.toLowerCase().trim()){
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(string);
        }
    }
    self.init = function(){

        if (!mainView){
            console.error("Incorrect initializing view class! You must to pass a view.");
            return;
        }
        else if (!dataStorage){
            console.error("Incorrect initialized data storage! You must to pass a data storage view.");
            return;
        }

        mainView.init(self.current.soundsOn, self.current.musicOn);

        window.location.hash = "";
        switchToState(hashState.loading.key);
        setTimeout(preLoad, 1000); // небольшая задержка, чтобы сэмулировать загрузку
    }

    function preLoad(){

        if(!self.current.guid)
            self.current.guid = getGuid();

        dataStorage.onReadComplete(readDataCompleted);
        dataStorage.onStoreComplete(function (res, err){
            if (err != undefined)
                mainView.alertMessage("store", err);
        });
        dataStorage.getDataFromDB();
    }

    function getGuid() {
        return 'xxxx-xxxx-xxxx'.replace(/[x]/g, 
        function (x) { return x === "x" ? Math.round(Math.random() * 16 | 0).toString(16) : x; });
    }

    function readDataCompleted(res, err){

        if (err != undefined)
            mainView.alertMessage(err);
        else {
            dataStorageStates = res ? res : {};
            gameDescriptionValue = dataStorageStates[gameDescriptionKey];

            var maxRecord = 0;
            for (var key in dataStorageStates) 
            {
                let val = dataStorageStates[key]["best"];
                if(val != undefined)
                    maxRecord = Math.max(maxRecord, val);
            }
            mainView.player.recordScore = maxRecord;
        }

        if (self.current.guid in dataStorageStates){
            mainView.updatePlayer(dataStorageStates[self.current.guid], gameDescriptionValue);
            window.location.hash = hashState.choose.hashCode;
        }
        else{
            window.location.hash = hashState.register.hashCode;
        }
    }

    self.hashChanged = function(e) {

        let state = self.current.state;

        if(lastHashState === state){
            return;
        }
        else if (self.current.isPlaying){
            if (confirm('Attention! The current game progress may be lost.')) {
                currentGame.dispose();
                currentGame = null;
                mainView.player.currentScore = 0;
            }
            else{
                window.location.hash = games[lastHashState].hashCode;
                return;
            }
        }

        lastHashState = state;

        if (state === hashState.about.key){
            switchToState(state);
        }
        else if (dataStorageStates === null || dataStorage.state.inReadingProgress){
            forcedSwitch(state, hashState.loading);
        }
        // если игрок не зареган
        else if (!(self.current.guid in dataStorageStates)){
            forcedSwitch(state, hashState.register);
        }
        else{
        
            if (state in hashState && hashState[state].userCanSet){
                switchToState(state);
            }
            else if (state in games){
                loadGame(state);
            }
            // если неизвестный хэш, но игрок существует
            else{
                window.location.hash = hashState.choose.hashCode;
            }
        }
    }

    function forcedSwitch(state, required){

        if (state === required.key){
            switchToState(state);
        }
        else{
            window.location.hash = required.hashCode;
        }
    }

    function switchToState(state){

        if (state === hashState.loading.key){
            mainView.smoothSwitch(mainView.loadLoadingContainer);
        }
        else if (state === hashState.register.key){
            mainView.smoothSwitch(function() { mainView.loadRegistrationContainer(self.submit); });
        }
        else if (state === hashState.choose.key){
            mainView.smoothSwitch(function(){ mainView.chooseGame(games); });
        }
        else if (state === hashState.about.key){
            mainView.smoothSwitch(mainView.loadAboutContainer);
        }
        else{
            window.location.hash = hashState.choose.hashCode;
        }
    }

    function loadGame(game){

        if (game === games.breakout.key){
            currentGame = new BreakoutGame(onCountScoreHandler, submitStatusHandler);
            currentGame.start(self.current.soundsOn);
            mainView.smoothSwitch(mainView.loadGameCanvas);
        }
    }

    function onCountScoreHandler(score){
        mainView.player.currentScore = score;
    }

    function submitStatusHandler(){
        self.submit(); // сохраняем текущий результат
    }

    // если из формы, выполнили регистрацию, либо сохранение рекордов
    self.submit = function(){
        
        let playerData = dataStorageStates[self.current.guid];
        if (playerData === undefined){
            
            if(/^[A-zА-я]+$/.test(mainView.player.name)){
                playerData = {
                    name: mainView.player.name,
                    best: mainView.player.currentScore,
                    lastAccess: new Date(),
                };
                dataStorageStates[self.current.guid] = playerData;
                dataStorage.storeInfo(dataStorageStates);
                mainView.updatePlayer(playerData, gameDescriptionValue);
                window.location.hash = hashState.choose.hashCode;
            }
            else{
                mainView.player.name = "";
                mainView.alertMessage("create", "Incorrect player name. You can enter only letters.");
            }
            
        }
        else{
            
            if (playerData.best < mainView.player.currentScore){
                playerData.best = mainView.player.currentScore;
                playerData.lastAccess = new Date();
                dataStorage.storeInfo(dataStorageStates);
            }
        }
    }

    self.changeSoundsMode = function(e){
        e.preventDefault();
        
        self.current.soundsOn = !self.current.soundsOn;
        mainView.changeSoundsMode(self.current.soundsOn);

        if (currentGame){
            currentGame.changeSoundsMode(self.current.soundsOn);
        }
    }

    self.changeMusicMode = function(e){
        e.preventDefault();

        self.current.musicOn = !self.current.musicOn;
        mainView.changeMusicMode(self.current.musicOn);
    }

    self.clear = function(){
        dataStorage.storeInfo({});
    }

    self.resize = function(){
        mainView.resize();
        if (currentGame)
            currentGame.refreshSize();
    }
}