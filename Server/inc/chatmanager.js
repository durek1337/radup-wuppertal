var usermanager=null, db=null, modobj={}, notification=null, mods = null;

module.exports = function(m){
mods = m;

modobj.msgType = {
    NORMAL : 0,
    SYSTEM : 1,
    RATING : 2
}

modobj.sendMsg = function(senderid, receiverid, type, content){
    if(senderid == receiverid) return;
    
    var sync = new Date(Date.localNow());
    var syncstamp = sync.toMYSQLString();


    var sender = mods.usermanager.find(senderid); // User-Prototype eingeloggter User
    var receiver = mods.usermanager.find(receiverid); // User-Prototype eingeloggter User

    mods.usermanager.get(receiverid,function(check){
        if(check != null){
            if(sender != null) sender.socket.emit('msg',{id : receiverid, self : 1, type : type, content : content, timestamp : syncstamp});
            if(receiver != null) receiver.socket.emit('msg',{id : senderid, self : 0, type : type, content : content, timestamp : syncstamp});
            mods.db.query("INSERT INTO `message` SET ?",{senderid : senderid, receiverid: receiverid, type: type, content : content, timestamp : syncstamp}, function(res){
                if(res.affectedRows) mods.notification.template.msgReceived(senderid,receiverid); // Sende push-Nachricht raus
            });
        }
    });


}

// @TODO
modobj.addSystemMsg = function(userid,type,msg){ // Fügt vorgefertigte Administratornachrichten (type > 0) oder Nachricht ein
    var sync = new Date(Date.localNow());
    var syncstamp = sync.toMYSQLString();

    modobj.getChatId(userid,0,1,function(chatid){
        if(chatid == 0) // Erst neuen Chat anlegen
            mods.db.query("INSERT INTO `chat` SET ?", {senderid : 0, receiverid : userid, status : 1, lastmessage : syncstamp}, function(result){
                new Chat(result.insertId, function(c) {
                    var receiver = usermanager.find(userid);
                    chats[result.insertId] = c;
                    var receiver = usermanager.find(userid);
                    if(receiver != null) receiver.socket.emit('newchat',{chat: c.getByUser(userid), sync : sync});

                    c.addMessage(type,0,msg);
                });

            });
        else
        chats[chatid].addMessage(type,0,msg);


    });

}
return modobj;

}