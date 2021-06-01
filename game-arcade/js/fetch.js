// TODO. IE не поддерживает fetch


var ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";

async function getDataFromDB(){
    let sp = new URLSearchParams();
    sp.append('f', 'READ');
    sp.append('n', 'VKHOVANSKIY_GAME');

    return await fetch(ajaxHandlerScript, { method: 'post', body: sp })
        .then(response => response.json() )
        .then(data => { SPAState = data; } )
        .catch(error => { console.error(error); } );
}

(function Initialize(){
    var currentGuid = window.localStorage.getItem('currentGuid');
    if (!currentGuid)
        window.localStorage.setItem('currentGuid',guid());

    getDataFromDB()
    .then(x => {
        if(SPAState){
            console.log(SPAState);
            console.log("Game is initialized");
        }
        else 
            console.log("no data found");
    });
})();