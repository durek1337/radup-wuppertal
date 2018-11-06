/*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
var modobj = {}, mods = null;

module.exports = function(m){
modobj.uploads = {};
mods = m;

modobj.startUpload = function(obj, socket){
    obj.data = [];

    if(socket.id in modobj.uploads)
    modobj.uploads[socket.id].push(obj);
}
modobj.addChunk = function(data, socket, cb){
    var arr = modobj.uploads[socket.id];
    var obj = arr[0];
    obj.data.push(data);
    if(obj.arrsize >= obj.data.length){
        obj.onfinish(Buffer.concat(arr.shift())); // Führe Abschlussfunktion aus und entferne Upload
        if(!arr.length) delete modobj.uploads[socket.id];
        cb(2);
    } else cb(1);

}

return modobj;

}