"use strict";

function DataStorage() {
    var self = this;
    
    var updTrnPassword = null;
    var newState = null;

    var ajaxHandlerScript ="https://fe.it-academy.by/AjaxStringStorage2.php";
    var projectName = "VKHOVANSKIY_GAME";

    var onReadListeners=[];
    self.onReadComplete = function(func) {
        onReadListeners.push(func);
    }

    var onStoreListeners=[];
    self.onStoreComplete = function(func) {
        onStoreListeners.push(func);
    }

    var inReading = false;
    var inStoring = false;
    self.state = {
        get inReadingProgress() {
            return inReading;
        },
        get inStoringProgress(){
            return inStoring;
        }
    }

    // On read states
    self.getDataFromDB = function(){

        if (inReading){
            console.error("Previous reading progress has not been completed. Reset state.");
            return;
        }

        inReading = true;
        $.ajax(
            {
                url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                data : { f : 'READ', n : projectName },
                success : readReady, 
                error : function(jqXHR,statusStr,errorStr){
                    inReading = false;
                    returnResult(onReadListeners, undefined, statusStr + " " + errorStr);
                }
            }
        );
    }

    function readReady(callresult) {

        inReading = false;
        if (callresult === undefined){
            returnResult(onReadListeners, {} );
        }
        else if (callresult.error != undefined){
            returnResult(onReadListeners, undefined, callresult.error);
        }
        else{
            try {
                returnResult(onReadListeners, callresult.result ? JSON.parse(callresult.result) : {});
            }
            catch(ex){
                returnResult(onReadListeners, {} );
            }
        }
    }

    // On change states
    self.storeInfo = function(data) {

        if (inStoring){
            console.error("Previous storing progress has not been completed. Reset state.");
            return;
        }

        inStoring = true;
        updTrnPassword = Math.random();
        newState = JSON.stringify(data);

        $.ajax( {
                url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                data : { f : 'LOCKGET', n : projectName, p : updTrnPassword },
                success : lockGetReady, 
                error : function(jqXHR,statusStr,errorStr) {
                    inStoring = false;
                    returnResult(onStoreListeners, undefined, statusStr + " " + errorStr); 
                }
            }
        );
    }

    function lockGetReady(callresult) {

        if (callresult.error!=undefined )
            returnResult(onStoreListeners, undefined, callresult.error);
        else {
            $.ajax( {
                    url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                    data : { f : 'UPDATE', n : projectName, v : newState, p : updTrnPassword },
                    success : updateReady, 
                    error : function(jqXHR,statusStr,errorStr){
                        inStoring = false;
                        returnResult(onStoreListeners, undefined, statusStr + " " + errorStr); 
                    }
                }
            );
        }
    }

    function updateReady(callresult) {

        inStoring = false;
        if (callresult.error != undefined)
            returnResult(onStoreListeners, undefined, callresult.error);
    }

    function returnResult(listeners, result, error) {
        for (var f = 0; f < listeners.length; f++ ) {
            var func = listeners[f];
            func(result, error);
        }
    }

    self.resetProgress = function(){
        updTrnPassword = null;
        newState = null;
        inReading = false;
        inStoring = false;
    }
}

function Helper(){
    var self = this;

    self.groupBy = function(collection, property) {
        var i = 0, val, index, values = [], result = [];
        
        for (; i < collection.length; i++) {
            val = collection[i][property];
            index = values.indexOf(val);
            if (index > -1)
                result[index].push(collection[i]);
            else {
                values.push(val);
                result.push([collection[i]]);
            }
        }
        return result;
    }
    
}

function OptimizedResize() {

    var callbacks = [],
        running = false;

    // fired on resize event
    function resize() {
        
        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(runCallbacks);
            } else {
                setTimeout(runCallbacks, 66);
            }
        }

    }

    // run the actual callbacks
    function runCallbacks() {

        callbacks.forEach(function(callback) {
            callback();
        });

        running = false;
    }

    // adds callback to loop
    function addCallback(callback) {

        if (callback) {
            callbacks.push(callback);
        }
    }

    return {
        // public method to add additional callback
        add: function(callback) {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    }
}
