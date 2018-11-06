var nusers = {}; // User-ID -> [nuser-ID1, nuser-ID2,...]
var modobj, config, mods, url;
const onesignal = require('node-opensignal-api');
const onesignalClient = onesignal.createClient();

module.exports = function(m){
    mods = m;
    config = mods.config.onesignal;
    url = mods.config.socketurl;


    modobj = {
    init : function(){
        mods.db.query("SELECT * FROM `notification`",[],function(result){
            for(var i=0;i<result.length;i++){
                var r = result[i];
                modobj.addNuser(r.userid,r.id);
            }
        })

    },
    editNuser : function(nuserid, props){
        onesignalClient.players.edit(nuserid, props, function (err, response) {
        	if (err) {
            	console.log('Es trat ein Fehler beim Bearbeiten des OneSignal-Nutzers auf'.red, err);
          	} else {
            	console.log(response);
          	};
        });

    },
    insertNuser : function(userid,nuserid){ // Füge neue Subscription-ID ein
        modobj.editNuser(nuserid,{
            tags : {userid : userid}
        });
        var func = function(){
               mods.db.query("INSERT INTO `notification` SET ?",{id: nuserid, userid: userid},function(r2){
                    console.log(r2);
                    console.log(("Neuer Benachrichtigungsclient "+nuserid+" an "+userid).grey);
                    modobj.addNuser(userid,nuserid);
                });

            };
        mods.db.query("SELECT `userid` FROM `notification` WHERE id = ?",[nuserid, userid],function(r){
            if(r.length > 0 && r[0].userid != userid) modobj.removeNuser(r[0].userid,nuserid, func);
            else if(r.length == 0) func();
        })
    },
    addNuser : function(userid,nuserid){ // Füge Subscription-ID im Arbeitsspeicher hinzu
        if(userid in nusers && nusers[userid].indexOf(nuserid) == -1) nusers[userid].push(nuserid);
        else nusers[userid] = [nuserid];
    },
    removeNuser : function(userid, nuserid, cb){
        console.log("Entferne Notification-Verbindung")
        mods.db.query("DELETE FROM `notification` WHERE id = ?",[nuserid], function(){
            console.log(("Entferne Benachrichtigungsclient "+nuserid+" von "+userid).grey);
            modobj.editNuser(nuserid,{
                tags : {"userid" : ""}
            });

            if(userid in nusers){
                var arr = nusers[userid];
                var index = arr.indexOf(nuserid);
                if(index != -1) arr.splice(index, 1);
                if(arr.length == 0) delete nusers[userid];
            }
            if(cb) cb();
            });
    },
    template : {
        msgReceived : function(senderid, receiverid){ // sender ist User-Object
        console.log(("Notification von #"+senderid+" zu #"+receiverid).cyan);
        mods.usermanager.get(senderid, function(sender){
            if(sender == null) return;
            var params = {
                headings : {
                    en : "Radup!",
                    de : "Radup!"
                },
                contents : {
                    en : sender.name+" sent you a message.",
                    de : "Nachricht von "+sender.name+" erhalten."
                },
                large_icon : url+"/pic/"+sender.id, // Profilbild
                data : {id : senderid, type : 0}, // Typ Chat
                android_group : senderid,
                android_group_message: {
                    "en": "You have $[notif_count] new messages",
                    "de" : "Sie haben $[notif_count] neue Nachrichten"
                    }
                }
            modobj.sendToUser(receiverid,params);
        });


        },
        requestReceived : function(sendername){

        }
    },
    sendToUser : function(userid,params){ // Sende Nachricht zu User
        if(userid in nusers){
            var p = Object.assign({
                app_id : config.id,
                include_player_ids : nusers[userid]
            }, params);

        onesignalClient.notifications.create(config.key, p, function (err, response) {
            if (err) {
            	console.log('Encountered error', err);
          	} else {
            	console.log(response);
          	}
        });
        }
    }
};
modobj.init();
return modobj;
}