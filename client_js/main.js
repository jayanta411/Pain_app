// In renderer process (web page).
const {ipcRenderer} = require('electron')

var csvData = [];
var objName,objTime;
function Upload() {
    //alert('upload called.');
    csvData = [];
    var fileUpload = document.getElementById("fileUpload");

    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;

    if (regex.test(fileUpload.value.toLowerCase())) {
        objName = fileUpload.value;
        objTime = new Date();
        if (typeof (FileReader) != "undefined") {

            var reader = new FileReader();

            reader.onload = function (e) {

                var table = document.createElement("table");

                var rows = e.target.result.split("\n");
                csvData = rows;
                console.log(JSON.stringify(csvData));
                for (var i = 0; i < rows.length; i++) {

                    var row = table.insertRow(-1);
                    
                    var cells = rows[i].split(",");

                    for (var j = 0; j < cells.length; j++) {

                        var cell = row.insertCell(-1);

                        cell.innerHTML = cells[j];

                    }

                }

                var dvCSV = document.getElementById("dvCSV");

                dvCSV.innerHTML = "";

                dvCSV.appendChild(table);

            }

            reader.readAsText(fileUpload.files[0]);
            plotGraph(fileUpload.value.toLowerCase());
        } else {

            alert("This browser does not support HTML5.");

        }

    } else {

        alert("Please upload a valid CSV file.");

    }
    
}

function plotGraph(file){
    
}

// function syncronousCheck(){
//     alert(ipcRenderer.sendSync('synchronous-message', 'ping'));
// }

// function asyncronousCheck(){
//     ipcRenderer.send('asynchronous-message', 'ping');
// }

// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//     alert(arg) // prints "pong"
//   })

//   /*------------------------------- Database operations -------------------------------------------*/
//   var db = new loki('csv.json');
//   var dbIndex = new loki('list.json');
//   var csvList = db.addCollection('csvList');
//   var index = dbIndex.addCollection('index');

  function getData(id){
    ipcRenderer.send('getCsvById',id);
  }
  ipcRenderer.on('fetchedCsv', (event, obj) => {
    var table = document.createElement("table");

    var rows = obj.csv;
    for (var i = 0; i < rows.length; i++) {

        var row = table.insertRow(-1);
        
        var cells = rows[i].split(",");

        for (var j = 0; j < cells.length; j++) {

            var cell = row.insertCell(-1);

            cell.innerHTML = cells[j];

        }

    }

    var dvCSV = document.getElementById("showHistory");

    dvCSV.innerHTML = "";

    dvCSV.appendChild(table);
  })
  function setHistory(){
    var historyDiv = document.getElementById('history');
    if(historyDiv != null){
        while (historyDiv.hasChildNodes()) {
            historyDiv.removeChild(historyDiv.lastChild);
        }
    }
    
    ipcRenderer.send('fetchIndex', []);
    
  }
  ipcRenderer.on('indexList', (event, data) => {
     //alert(arg) // prints "pong"
     if(data[0] != null){
         for(var i in data){
             var obj = data[i];
             historyDiv = document.getElementById('history');
            var span = document.createElement('span');
            var t = document.createTextNode(obj.name);
            span.appendChild(t);
            var btn = document.createElement('button');
            var tr = document.createTextNode('Show CSV');
            btn.appendChild(tr);
            btn.setAttribute('id',obj.id);
            btn.setAttribute('onclick','getData(this.id)');
            var btnDlt = document.createElement('button');
            var trr = document.createTextNode('delete record');
            btnDlt.appendChild(trr);
            btnDlt.setAttribute('name',obj.id);
            btnDlt.setAttribute('onclick','deleteData(this.name)');
            var p = document.createElement('p');
            p.appendChild(span);
            p.appendChild(btn);
            p.appendChild(btnDlt);
            historyDiv.appendChild(p);
         }
     }
   })

  //setHistory();
  window.onload = setHistory;
  function saveInDb(){
    var dataObj = {db:'',data:{}}
    const csvObj = {name:objName,id:objTime.getTime().toString(),csv:csvData};
    const csvIndex = {name:objName,id:objTime.getTime().toString()};
        csvObj.csv = csvData;
        dataObj.db = 'csvList';
        dataObj.data = csvObj;
        var insertCsv = ipcRenderer.sendSync('insert', dataObj);
        if(insertCsv){
            console.log('csv insert success');
            dataObj.db = "index";
            dataObj.data = csvIndex;
            var insertIndex = ipcRenderer.sendSync('insert', dataObj);
            if(insertIndex){
                console.log('Index insert success');
            }else{
                console.log("Index insert fail");
            }
        }else{
            console.log('csv insert fail');
        }
        
        setHistory();
  }

  function deleteData(id){
        ipcRenderer.send('removeEntry',id);
  }
  ipcRenderer.on('entryRemoved', (event, removed) => {
            if(removed){
                setHistory();
            }
  })
  
  


  