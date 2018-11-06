/* Modul zur Verwaltung der Fahrräder */
var transferSessions = {}, modobj = {}, mods = {};
const randomstring = require("randomstring");
const holderType = {
    USER : 0,
    STATION : 1,
    REPAIR : 2
};

module.exports = function bike(m){
mods = m;

    // @TODO Holdertype
    modobj.holderType = holderType;
    modobj.get = function(id,cb){
        mods.db.query("SELECT `id`,`type`,`sponsorid`,`properties`,`name`,`frame`,`holderid`,`holdertype`,`status`,(SELECT CONCAT(street,', ',city) FROM `user` WHERE id=bike.holderid) AS `address`, (SELECT `bike_lat` FROM `user` WHERE id=bike.holderid) AS `lat`, (SELECT `bike_lon` FROM `user` WHERE id=bike.holderid) AS `lon`, (IF(holderid = 0,'',(SELECT CONCAT(forename,' ',LEFT(surname,1),'.') FROM `user` WHERE id = bike.holderid))) AS `holdername`, (SELECT `timestamp` FROM `bike_transfer` WHERE bikeid=bike.id AND receiverid=bike.holderid ORDER BY `timestamp` DESC LIMIT 1) AS `timestamp` FROM `bike` WHERE id = ?",[id],function(data){
            if(data.length == 0)
            cb(null);
            else
            cb(data[0]);
        });
    };

    modobj.createSession = function(fromid, toid){
        if(fromid in transferSessions) modobj.deleteSession(fromid);
        var k = randomstring.generate(16);

        transferSessions[fromid] = {
            key : k,
            receiver : toid,
            timer : setTimeout(modobj.deleteSession, 60000, fromid) // Entferne Session nach 60 Sekunden
        }
        return fromid+"-"+k;
    }

    modobj.deleteSession = function(userid){
        console.log(('Entferne Session von Nutzer #'+userid).cyan);
        if(userid in transferSessions){
        clearTimeout(transferSessions[userid].timer);
        delete transferSessions[userid];
        }
    }

    modobj.validateSession = function(userid, key){ // ID des scannenden und der Schlüssel
    console.log(("Benutzer #"+userid+" scant key: "+key).cyan)
        if(typeof key == "string"){
            var parts = key.split("-");
            var id = parseInt(parts[0]);
            var key = parts[1];

            if(isNaN(id) || key == "undefined"){
                console.log("Fehlerhafte Daten, Übergabe abgebrochen".red);
                return;
            }

            console.log(id);
            console.log(key);

            var receiver = mods.usermanager.find(userid); // Empfänger des Fahrrads

            if(id in transferSessions && transferSessions[id].receiver == userid && transferSessions[id].key == key){
                modobj.deleteSession(id);

                var sender = mods.usermanager.find(id); // Übergeber :D

                mods.usermanager.getBikeId(id, function(bikeid){
                    if(bikeid) // > 0
                    modobj.transfer(bikeid, userid, holderType.USER, function(b){
                        if(b){
                            receiver.socket.emit("transfer",true);
                            sender.socket.emit("transfer",true);
                            mods.chatmanager.sendMsg(id,userid,mods.chatmanager.msgType.RATING,""); // Zeige Bewertung im Chatverlauf
                        } else receiver.socket.emit("transfer",false);
                    });
                })
            } else receiver.emit("alert","Die Session ist nicht gültig. Möglicherweise ist sie schon abgelaufen.")

        }

    }

    modobj.getHolder = function(bikeid, cb){ // cb(ID, HolderType)
        mods.db.query("SELECT `holderid`,`holdertype` FROM `bike` WHERE id = ?",[bikeid], function(res){
            if(res.length) cb(res[0].holderid, res[0].holdertype);
        })
    };

    modobj.transfer = function(bikeid,receiverid,receivertype,cb){ // Transferiere Fahrrad
        //mods.usermanager.getBikeId(fromid, function(bikeid){})
        try{
            modobj.getHolder(bikeid, function(hid,htype){
                console.log(("Übergebe Rad #"+bikeid+" von "+((htype == holderType.USER) ? "Benutzer" : "Station")+" #"+hid+" an "+((receivertype == holderType.USER) ? "Benutzer" : "Station")+" #"+receiverid).cyan);
                mods.usermanager.getBikeId(receiverid, function(checkbikeid){
                    if(checkbikeid > 0) cb(false); // Wenn der Empfänger doch ein Fahrrad hat. Keine gesonderte Meldung, ist dann eh ein Betrugsversuch.
                    else {
                        var updateObj = {holderid : receiverid, holdertype : receivertype, timestamp : (new Date(Date.localNow())).toMYSQLString()};
                        var insertObj = {bikeid: bikeid, holderid : hid, holdertype : htype, receiverid : receiverid, receivertype : receivertype};

                        mods.db.query("UPDATE `bike` SET ? WHERE id = ?",[updateObj,bikeid],function(){
                            modobj.sync(bikeid);
                            // @TODO
                            mods.db.query("INSERT INTO `bike_transfer` SET ?",insertObj,function(res){
                              if(res.affectedRows) cb(true);
                            })

                        });
                    }

                })

            });

            } catch(e){
                console.log(e.red);
                cb(false);
            }


    };


    modobj.sync = function(id){ // Schicke Fahrrad mit der ID zu allen eingeloggten Benutzern und aktualisiert den Synchronisationsstempel
    var self = this;
        mods.db.query("UPDATE `bike` SET timestamp = CURRENT_TIMESTAMP WHERE id = ?",[id], function(){ // Damit dieser Eintrag erneut synchronisiert wird
                self.get(id, function(bikedata){
                    if(bikedata != null){
                        mods.io.to("online").emit('sync',{ data : { // Schicke Fahrraddaten zu allen
                            bikes : [bikedata]
                        },
                        sync : Date.localNow()})
                    }
                })


             });

    };



return modobj;

}