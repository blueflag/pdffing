window.__nightmare = {};
__nightmare.ipc = require('electron').ipcRenderer;

XMLHttpRequest.prototype.outstanding_length = 0;
var oldSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(){
    XMLHttpRequest.prototype.outstanding_length++
    var oldReadyStateChange = this.onreadystatechange;
    this.onreadystatechange = function(){
        if(this.readyState === XMLHttpRequest.DONE){
            XMLHttpRequest.prototype.outstanding_length--
        }
        oldReadyStateChange();
    }
    oldSend.apply(this, arguments);
}