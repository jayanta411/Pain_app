const {app, BrowserWindow} = require('electron')
const {ipcMain} = require('electron')
var loki = require('lokijs')
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})
  
    // and load the index.html of the app.
    win.loadFile('index.html')
  }
  
  app.on('ready', createWindow);

  
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.sender.send('asynchronous-reply', 'async-pong')
  })
  
  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'sync-pong'
  })

  /*------------------------------- Database operations -------------------------------------------*/
  var db = new loki('csv.json');
  var dbIndex = new loki('list.json');
  //var csvList = db.addCollection('csvList');
var csvList,index;
db.loadDatabase({}, function () {
    csvList = db.getCollection('csvList');

    if (!csvList) {
        console.log("Collection %s does not exit. Creating ...", 'csvList');
        csvList = db.addCollection('csvList');
    }
});
dbIndex.loadDatabase({}, function () {
  index = dbIndex.getCollection('index');

  if (!index) {
      console.log("Collection %s does not exit. Creating ...", 'index');
      index = dbIndex.addCollection('index');
  }
});
 // var index = dbIndex.addCollection('index');

  ipcMain.on('fetchIndex',(event,arg) => {
    var indexList = [];
    index.where(function(obj){
      indexList.push(obj);
    })
    event.sender.send('indexList',indexList);
  })

  ipcMain.on('insert', (event, dataObj) => {
    try {
      if(dataObj.db == 'csvList'){
        csvList.insert(dataObj.data);
        db.saveDatabase();
        event.returnValue = true;
      }else if(dataObj.db == 'index'){
        index.insert(dataObj.data);
        dbIndex.saveDatabase();
        event.returnValue = true;
      }
    } catch (error) {
      event.returnValue = false;
      
    }
    
  })

  
  ipcMain.on('getCsvById',(event,id) => {
    var csv;
    csvList.where(function(obj){
      if(obj.id == id){
        csv = obj;
      }
    })
    event.sender.send('fetchedCsv',csv);
  })
  ipcMain.on('getCsvById',(event,id) => {
    var csv;
    csvList.where(function(obj){
      if(obj.id == id){
        csv = obj;
      }
    })
    event.sender.send('fetchedCsv',csv);
  })

  ipcMain.on('removeEntry',(event,Id) => {
    let delCsv = csvList.find({id:Id});
    let delIndex = index.find({id:Id})
    csvList.remove(delCsv[0]);
    index.remove(delIndex[0]);
    db.saveDatabase();
    dbIndex.saveDatabase();

    event.sender.send('entryRemoved',true);
  })
  