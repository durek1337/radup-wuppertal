var modobj={}, mods = null;

module.exports = function(m){
mods = m;

modobj.storeImage = function(obj, cb, arr, results){ // arr, results is optional for multi-upload
if(typeof results === 'undefined') results = [];
if(typeof arr === 'undefined') arr = [];

// obj enthält obj.title, obj.data, obj.ticketid, [...]
console.log("Ticketbildeintrag wird angelegt: "+obj.title);

        var partobj = {
            title : obj.title,
            data : obj.data,
            ticketid : obj.ticketid
        }

        mods.db.query("INSERT INTO `picture` SET ?",partobj,function(res){
            //console.log(res);
            results.push(res.insertId);
            if(arr.length == 0) cb(results);
            else modobj.storeImage(arr.shift(),cb,arr,results);
        });


};
/*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
modobj.checkForEmptyEntry = function(id,cb){ // Wenn ein leerer zu beschreibender Datenbankeintrag existiert
    var obj = {data : ""};
    mods.db.query("UPDATE `picture` SET ? WHERE id = ? AND data IS NULL",[obj,id],function(res){
        cb(res.affectedRows)
    })

};
modobj.getPermission = function(obj){ // Zu große Dateien müssen gestreamt werden



}



return modobj;
}