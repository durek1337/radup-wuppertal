var modobj={}, mods = null;
module.exports = function(m){
mods = m;


modobj.createTicket = function(userid, type, subject, content, pictures, cb){
    //console.log(pictures);
    var obj = {
        userid : userid,
        type: type,
        subject : subject,
        content : content,
        log : "["+mods.time.syncstamp()+"] Ticket wurde erstellt",
        hidden : ''
    };

    mods.db.query("INSERT INTO `user_ticket` SET ?", obj, function(res){
        if(!res.affectedRows) console.log("Eintragung in Datenbank fehlgeschlagen");
        console.log(("Supportticket #"+res.insertId+" ("+subject+") von User #"+userid+" erstellt").cyan);

        if(pictures.length){
            console.log(pictures.length+" Bilder enthalten");
        for(var i=0;i<pictures.length;i++)
            pictures[i] = {title : subject+" ("+(i+1)+"/"+pictures.length+")", data :  Buffer.from(pictures[i], 'base64'), ticketid : res.insertId}

        mods.picturemanager.storeImage(pictures.shift(),function(results){
            console.log("Bilder-IDs: ",results);
            mods.db.query("UPDATE `user_ticket` SET ? WHERE id = ?",[{pictures : results.toString()}, res.insertId],function(){ // Redundanzdaten (IDs der Bilder) werden aus Effizienzgründen als String gespeichert
                cb(true);
            })

        },pictures);
        } else cb(true);
    });


}

/** Adminptiz speichern **/
modobj.saveHidden = function(ticketid,content,supportid,cb){
  mods.usermanager.get(supportid,function(u){
      if(u == null){
      cb(null);
      return;
      }

    modobj.getTicket(ticketid,function(t){
        if(t == null) cb(null);
        else {
            var logmsg = "["+mods.time.syncstamp()+"] "+u.name+" (#"+u.id+") hat die Adminnotiz geändert"+"\n";
            mods.db.query("UPDATE `user_ticket` SET ? WHERE id = ?",[{
                hidden : content,
                log : logmsg+t.log
            },t.id], function(res){
                if(!res.affectedRows) cb(null); else cb({log : logmsg, note : content});
            });
        }
    });
  });
}

modobj.getTicket = function(ticketid,cb){
        mods.db.query("SELECT `user_ticket`.*,`user`.forename, `user`.surname FROM (`user` INNER JOIN `user_ticket` ON `user_ticket`.userid = `user`.id) WHERE `user_ticket`.id = ?",[ticketid], function(result){
            cb((result.length) ? result[0] : null);
        });
}

modobj.getAllTickets = function(cb){
        mods.db.query("SELECT `user_ticket`.*,`user`.forename, `user`.surname FROM (`user` INNER JOIN `user_ticket` ON `user_ticket`.userid = `user`.id)",[], function(result){
            cb(result);
        });
}


modobj.getTicketByUser = function(userid,cb){
        mods.db.query("SELECT `user_ticket`.*,`user`.forename, `user`.surname FROM (`user` INNER JOIN `user_ticket` ON `user_ticket`.userid = `user`.id) WHERE `user_ticket`.userid = ?",[userid], function(result){
                result.user = res;
                cb(result);
        });
}


modobj.takeTicket = function(ticketid,userid,cb){ // Take ticket by admin with userid
    mods.usermanager.get(userid,function(u){
        if(u == null){
        cb(null);
        return;
        }

        modobj.getTicket(ticketid, function(ticket){
            if(ticket != null){
              var logmsg = "["+mods.time.syncstamp()+"] "+u.name+" (#"+u.id+") hat das Ticket übernommen\n";
                var updateobj = {
                    log : logmsg+ticket.log,
                    supportid : userid
                };
            mods.db.query("UPDATE `user_ticket` SET ? WHERE id = ? AND supportid IS NULL", [updateobj,ticketid], function(res){
                console.log(("Admin-User #"+userid+" nimmt Ticket #"+ticketid).cyan);
                if(!res.affectedRows)
                    cb(null); // Ticketannahme nicht erfolgreich
                else {
                    cb(logmsg); // Ticketannahme erfolgreich
                    mods.chatmanager.sendMsg(userid,ticket.userid,mods.chatmanager.msgType.SYSTEM, "Dieser Admin hat deine Supportanfrage mit dem Titel \""+ticket.subject+"\" angenommen."); // Sende Systemnachricht
                }
            });
          } else cb(null);

        });

    })
}


modobj.releaseTicket = function(ticketid,userid,cb){ // Admin mit userid will ticket freigeben
        modobj.getTicket(ticketid, function(ticket){
          var logmsg = "["+mods.time.syncstamp()+"] Ticket wurde freigegeben\n";
            if(ticket != null){
                var updateobj = {
                    log : logmsg+ticket.log,
                    supportid : null
                };
            mods.db.query("UPDATE `user_ticket` SET ? WHERE id = ? AND supportid = ?", [updateobj,ticketid,userid], function(res){
                console.log(("Admin-User #"+userid+" gibt Ticket #"+ticketid+" frei").cyan);
                if(!res.affectedRows) cb(null);
                else {
                    cb(logmsg);
                    mods.chatmanager.sendMsg(userid,ticket.userid,mods.chatmanager.msgType.SYSTEM, "Dieser Admin hat dein Ticket freigegeben, sodass ein anderer sich darum kümmern kann."); // Sende Systemnachricht
                }
            });
          } else cb(null);

        });
}

modobj.closeTicket = function(ticketid,userid,cb){ // Admin mit userid will ticket schließen
        modobj.getTicket(ticketid, function(ticket){
          var logmsg = "["+mods.time.syncstamp()+"] Ticket wurde geschlossen\n";
            if(ticket != null){
                var updateobj = {
                    log : logmsg+ticket.log
                };
            mods.db.query("UPDATE `user_ticket` SET ? WHERE id = ? AND supportid = ?", [updateobj,ticketid,userid], function(res){
                console.log(("Admin-User #"+userid+" schließt Ticket #"+ticketid).cyan);
                if(!res.affectedRows) cb(null); else cb(logmsg);
            });
          } else cb(null);

        });
}


return modobj;
};
