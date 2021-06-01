"use strict";

function MainController(model){
    var self = this;

    var mainModel = model;

    self.init = function(){

        if (!mainModel){
            console.error("Incorrect initializing model class! You must to pass a model.");
            return;
        }

        let soundsButton = document.getElementById('soundsButton');
        let musicButton = document.getElementById('musicButton');
        soundsButton.addEventListener('click', mainModel.changeSoundsMode, false);
        musicButton.addEventListener('click', mainModel.changeMusicMode, false);


        window.onhashchange = function(e){
            e = e || window.event;
            mainModel.hashChanged(e);
        };
        window.onbeforeunload = function(e){
            e = e || window.event;
            var progressCanBeWastedStr = "Current progress can be wasted";
            
            if (mainModel && mainModel.current.isPlaying){
                e.returnValue = progressCanBeWastedStr;
                return progressCanBeWastedStr;
            }
        };
        // window.onsubmit = function(e){
        //     e = e || window.event;
        //     mainModel.submit();
        // };
        window.addEventListener('orientationchange', mainModel.resize, false);
        window.addEventListener('resize', mainModel.resize);
        //optimizedResize.add(mainModel.resize);
        

        mainModel.init();
        mainModel.resize();
    }

}