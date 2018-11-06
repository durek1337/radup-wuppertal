process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // Wenn korrektes SSl-Zertifikat vorhanden, Zeile löschen
const version = 0.1;
const config = require('./inc/config'); // Konfigurationen
const util = require('util'); // Debugging (Object-Tree)
const colors = require('colors');
const sha1 = require('sha1'); // sha1-Hash-algorithmus
const log4js= require("log4js");


var app = require('express')(); // Express Server-Framework
var http = null;
if(config.usessl){
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
http = require('https').Server(credentials, app); // HTTPS-Server
} else
http = require('http').Server(app); // HTTP-Server
var io = require('socket.io')(http); // socket.io - http


var mail = require("./inc/mail")(config.mail); // Mail-Funktionen
var User = require("./inc/user"); // User-Prototype

var clients = {};
var mods = {config : config, io : io};


Date.localNow = function() {
        return Date.now()-(new Date()).getTimezoneOffset()*60000;
};
Date.prototype.toMYSQLString = function(){
    return this.toISOString().slice(0, 19).replace('T', ' ');
}


console.log("Aktuelle Serverzeit: "+(new Date(Date.localNow())).toMYSQLString());
console.log("Node.js-Version: "+process.version);
console.log("Konfiguriere Logging...");
log4js.configure({
  appenders: [
    { type: 'console' },
    {type: 'file', filename: 'log/client-error.log', category: 'client-error'},
    {type: 'file', filename: 'log/server-error.log', category: 'server-error'}
  ]
});





var sql = new require("./inc/mysql")(config.sql, function(db){ // Wenn die Verbindung zur Datenbank erfolgreich war
            mods.db = db;
            mail.verify(function(){ // Wenn der SMTP-Server erreicht wurde
                var time = require("./inc/time");
                var bikemanager = require("./inc/bikemanager")(mods) // Bike-Manager (Verwaltung von&nbsp;Fahrrädern)
                var usermanager = require("./inc/usermanager")(mods); // User-Manager (Verwaltung von Usern)
                const notification = require("./inc/notification")(mods);
                var httpmanager = require("./inc/httpmanager")(mods,app);
                var chatmanager = require("./inc/chatmanager")(mods); // Chat-Manager (Verwaltung von Chats)
                var support = require("./inc/support")(mods);
                var picturemanager = require("./inc/picturemanager")(mods);
                var uploadmanager = require("./inc/uploadmanager")(mods);


                mods.time = time;
                mods.bikemanager = bikemanager;
                mods.usermanager = usermanager;
                mods.notification = notification;
                mods.chatmanager = chatmanager;
                mods.httpmanager = httpmanager;
                mods.support = support;
                mods.picturemanager = picturemanager;
                mods.uploadmanager = uploadmanager;

                httpmanager.init(version);


                        io.on('connection', function(socket){ // Neue Verbindung wurde hergestellt
                          console.log(socket.id+': Neue Verbindung hergestellt ('+socket.conn.transport.name+')');
                            clients[socket.id] = socket;
                              socket.on('disconnect', function() { // Bei Verbindungsabbruch
                                  console.log('Verbindung getrennt...');
                                  var u = usermanager.getUserBySocket(socket);
                                  if(u != null){
                                    usermanager.dissociate(u.id); // Entbinde Benutzer
                                  }

                               })
                              .on("test", function(id){
                                //notification.sendToUser(id);
                                 socket.emit('alert',bikemanager.createSession(1,2));
                              })
                              .on("appreport",function(obj){ // Fehler im Client aufgetreten
                                    console.log("Fehlerbericht erhalten:\x1b[31m");
                                    console.log(obj);
                                    console.log("\x1b[0m");
                                    log4js.getLogger("client-error").debug(obj);
                               })
                               .on('forgotpw',function(data){ // Passwort vergessen
                                   console.log(data);
                                   if(typeof data.id == number && data.id > 0 && typeof data.forename == "string" && data.forename.length && typeof data.surname == "string" && data.surname.length){
                                        db.query("SELECT `password` FROM `user` WHERE id = ? AND forename = ? AND surname = ?",[data.id,data.forename,data.surname], function(sqldata){
                                            if(sqldata.length > 0) mail.send(data.id,"password",{name : data.forename+" "+data.surname, password : sqldata[0].password});
                                            socket.emit('info','Falls Ihre eingegebenen Daten korrekt waren, wurde eine E-Mail mit Ihrem Passwort an Sie geschickt. Bitte haben Sie ggf. 10 Minuten Geduld, bevor Sie es erneut versuchen.');
                                        });


                                   }
                               })
                               .on('register',function(data){ // Empfange Registrierungsdaten
                                    usermanager.register(socket, data, function(){
                                        mail.send(data.id, "registration", {name : data.forename+" "+data.surname, password : data.pw, activationurl : config.socketurl+"/activate/"+data.id+"/"+usermanager.generateActivationKey(data.id,config.statickey)});
                                        socket.emit('register',{succeed : true}); // Registrierung erfolgreich
                                    },function(errormsg){
                                        socket.emit('register',{succeed : false, msg : errormsg});
                                    })
                               })
                               .on('login', function(obj){ // Bei Loginversuch
                                   if(typeof obj.id == "number" && obj.id != NaN && typeof obj.p == "string" && obj.p.length && typeof obj.sync == "number"){ // Prüfe ob alle Datentypen korrekt sind
                                        console.log("Versuche login mit ID "+obj.id);
                                       var u = new User(parseInt(obj.id),obj.p);
                                       u.auth(db,function(isValid){ // Logindaten korrekt
                                            if(isValid){
                                                var check = usermanager.find(u.id);
                                                if(check !== null) check.logout(usermanager); // Falls der User bereits eingeloggt ist, kicken
                                                usermanager.associate(u,socket); // Verknüpfe User-Prototype-Object mit socket
                                                var syncstamp = (new Date(obj.sync)).toMYSQLString(); // Timestamp des Clients
                                                var data = {};

                                                /* Suche alle neuen/veränderten Nachrichten, in denen der einloggende User Empfänger oder Sender ist */
                                                db.query("SELECT `content`,`type`,`timestamp`, IF(receiverid=?,senderid,receiverid) AS `id`, IF(senderid=?,1,0) AS `self` FROM `message` WHERE `timestamp` > ? AND (`receiverid` = ? OR `senderid` = ?) ORDER BY `timestamp` ASC", [u.id,u.id,syncstamp, u.id, u.id], function(messages){

                                                    /* Beziehe Userdaten und alle neuen Informationen, aktueller als der Synchronisationsstempel */
                                                    usermanager.get(u.id,function(userinfo){
                                                        db.query("SELECT `id`,`name`,`desc`,`lat`,`lon`,`street`,`housenumber`,`city`,`country`,(SELECT COUNT(*) FROM `bike` WHERE holdertype=? AND holderid=station.id) AS `bikes` FROM `station` WHERE `timestamp` > ?",[bikemanager.holderType.STATION,syncstamp],function(stations){
                                                            db.query("SELECT `id`,`name`,`desc`,`lat`,`lon`,`street`,`housenumber`,`city`,`country` FROM `charge` WHERE `timestamp` > ?",[syncstamp],function(charges){
                                                                db.query("SELECT `id`,`name`,`desc`,`lat`,`lon`,`street`,`housenumber`,`city`,`country`,(SELECT COUNT(*) FROM `bike` WHERE holdertype=? AND holderid=repair.id) AS `bikes` FROM `repair` WHERE `timestamp` > ?",[bikemanager.holderType.REPAIR,syncstamp],function(repairs){
                                                                    db.query("SELECT * FROM `sponsor` WHERE `timestamp` > ?",[syncstamp],function(sponsors){
                                                                        db.query("SELECT `id`, `type`, `sponsorid`, `properties`, `name`, `frame`, `status`, `holderid`, `holdertype`, (SELECT `bike_lat` FROM `user` WHERE id=bike.holderid) AS `lat`, (SELECT `bike_lon` FROM `user` WHERE id=bike.holderid) AS `lon`, (SELECT `timestamp` FROM `bike_transfer` WHERE bikeid=bike.id AND receiverid=bike.holderid ORDER BY `timestamp` DESC LIMIT 1) AS `timestamp` FROM `bike` WHERE `timestamp` > ? AND holderid > 0",[syncstamp],function(bikes){



                                                                            /* Wenn Daten existieren, erstelle jeweils das Attribut mit den Daten */
                                                                                if(bikes.length) data.bikes = bikes;
                                                                                if(messages.length) data.messages = messages;
                                                                                if(stations.length) data.stations = stations;
                                                                                if(charges.length) data.charges = charges;
                                                                                if(repairs.length) data.repairs = repairs;
                                                                                if(sponsors.length) data.sponsors = sponsors;

                                                                                // AAdminfunktionen ANFANG
                                                                                if(userinfo.rank > 2) socket.on('admin',function(data){
                                                                                  socket.join("admin"); // Füge Nutzer der Gruppe "admin" hinzu
                                                                                    if(data.type == "user"){
                                                                                        if(data.subtype == "get"){
                                                                                            if(data.id == 0){ // ID=0 zieht alle Daten aus der Datenbank
                                                                                                usermanager.getAll(function(res){
                                                                                                    socket.emit('admin',{type : "user", subtype : "get", id : data.id, content : res});
                                                                                                })
                                                                                            }
//                                                                                            socket.emit('admin',)
                                                                                        } else if(data.subtype == "change"){ // Änder Nutzerdaten
                                                                                              if(typeof data.id == "number" && typeof data.obj == "object")
                                                                                                usermanager.changeData(data.id,data.obj,function(res){
                                                                                                    if(res) // Wenn die Daten erfolgreich geändert wurden
                                                                                                      usermanager.get(data.id,function(userdata){ // Hole neue Daten aus der Datenbank und schicke sie an alle Adminclients
                                                                                                        mods.io.to('admin').emit('admin',{type : "user", subtype : "get", id: data.id, content : userdata}); // @TODO Client überprufen
                                                                                                        socket.emit('info',"Der Nutzer wurde erfolgreich bearbeitet");
                                                                                                      });
                                                                                                    else socket.emit('alert',"Der Nutzer konnte nicht bearbeitet werden!");
                                                                                                    });

                                                                                                
                                                                                        }
                                                                                    } else if(data.type == "ticket"){
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        if(data.subtype == "get"){
                                                                                            if(data.id == 0){
                                                                                                support.getAllTickets(function(res){
                                                                                                    socket.emit('admin',{type : "ticket", subtype : "get", id : data.id, content : res});
                                                                                                })
                                                                                            }
//                                                                                            socket.emit('admin',)
                                                                                        } else if(data.subtype == "take"){
                                                                                            support.takeTicket(data.id,u.id,function(logmsg){
                                                                                              var s = false;
                                                                                                if(logmsg != null) s = true;
                                                                                                mods.io.to('admin').emit('admin',{type : "ticket", subtype : "take", id : data.id, succeed : s, adminid : u.id, logmsg : logmsg})
                                                                                            })
                                                                                        } else if(data.subtype == "release"){
                                                                                            support.releaseTicket(data.id,u.id,function(logmsg){
                                                                                              var s = false;
                                                                                                if(logmsg != null) s = true;
                                                                                                mods.io.to('admin').emit('admin',{type : "ticket", subtype : "release", id : data.id, succeed : s, adminid : u.id, logmsg : logmsg})
                                                                                            })

                                                                                        } else if(data.subtype == "saveHidden"){
                                                                                            support.saveHidden(data.id,data.content,u.id,function(msg){
                                                                                              var s = false;
                                                                                                if(msg != null) s = true;
                                                                                                mods.io.to('admin').emit('admin',{type : "ticket", subtype : "saveHidden", id : data.id, succeed : s, adminid : u.id, logmsg : msg.log, note : msg.note})
                                                                                            })
                                                                                        } else if(data.subtype == "close"){
                                                                                            support.closeTicket(data.id,function(s){
                                                                                              var s = false;
                                                                                                if(logmsg != null) s = true;
                                                                                                mods.io.to('admin').emit('admin',{type : "ticket", subtype : "close", id : data.id, succeed : s, logmsg : logmsg})
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                })

                                                                                // Adminfunktionen ENDE

                                                                                socket.emit("login",{succeed : true, data : data, userinfo : userinfo, sync : Date.localNow()}); // Übertrage Loginbestätigung samt Daten
                                                                                socket.join("online"); // Füge Nutzer der Gruppe "online" hinzu

                                                                                /* Füge dem socket Listener hinzu, welche nur im eingeloggten Zustand akzeptiert werden */
                                                                                socket
                                                                                    .on('logout',function(){ // Logoutanfrage
                                                                                       var u = usermanager.getUserBySocket(socket);
                                                                                        if(u != null) u.logout(usermanager);
                                                                                    })
                                                                                    .on('changepw', function(data){ // Passwort ändern
                                                                                        if(typeof data.pw == "string" && data.pw.length && typeof data.newpw == "string" && data.newpw.length)
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        if(u != null)
                                                                                            db.query("UPDATE `user` SET `password` = ? WHERE `password` = ? AND id = ?",[data.newpw, u.id], function(pwresult){
                                                                                                if(pwresult.affectedRows > 0) socket.emit('info','Das Passwort wurde erfolgreich ge&auuml;ndert');
                                                                                                else socket.emit('alert','Das Passwort konnte nicht ge&auml;ndert werden. Bitte &uuml;berpr&uuml;fen Sie ihre Eingabe.')
                                                                                            })
                                                                                    })
                                                                                    .on('request', function(data){
                                                                                        if(typeof data.type == "string" && typeof data.id == "number"){
                                                                                            if(data.type == "user"){
                                                                                                usermanager.get(data.id, function(u){
                                                                                                    socket.emit('userinfo',u);
                                                                                                })
                                                                                            } else if(data.type == "bike"){

                                                                                            }
                                                                                        }
                                                                                    })
                                                                                    .on('msg',function(data){ // Nachricht versenden
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                            chatmanager.sendMsg(u.id,data.id,0,data.content);
                                                                                    })
                                                                                    .on('support', function(data){
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        console.log(("Supportticket-Anfrage von #"+u.id).cyan);
                                                                                        if(typeof data.subject == "string" && typeof data.content == "string" && typeof data.type == "number" && typeof data.pictures == "object"){
                                                                                            support.createTicket(u.id, data.type, data.subject, data.content, data.pictures, function(s){
                                                                                                if(s)
                                                                                                socket.emit('info','Das Ticket wurde erfolgreich erstellt!');
                                                                                                else
                                                                                                socket.emit('alert','Das Ticket konnte nicht erstellt werden!');

                                                                                            })
                                                                                        } else log4js.getLogger("client-error").log("Ticketanfrage von #"+u.id+" Fehlerhaft")


                                                                                    })
                                                                                    .on('startupload', function(data){ /*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
                                                                                        if(!(typeof data.id == "number" && typeof data.title == "string" && typeof data.type == "number" && typeof data.datasize == "number" && data.arrsize == "number"))
                                                                                            socket.emit('uploadstatus',{status : 0})
                                                                                        else {
                                                                                            if(data.type == 1){ // Bild
                                                                                                picturemanager.checkForEmptyEntry(data.id,function(status){ // Ein leerer Eintrag muss vorliegen, damit der Upload akzeptiert wird
                                                                                                    data.onfinish = function(pic){
                                                                                                        console.log("UPLOAD FERTIG");
                                                                                                        console.log(pic);
                                                                                                    }
                                                                                                    if(status) mods.uploadmanager.startUpload(data,socket);
                                                                                                    socket.emit('uploadstatus',{status : status})
                                                                                                })
                                                                                            }


                                                                                        }

                                                                                    })
                                                                                    .on('upload', function(data){ /*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
                                                                                        uploadmanager.addChunk(data,socket,function(status){
                                                                                            socket.emit('uploadstatus',{status : status})
                                                                                        });
                                                                                    })
                                                                                    .on('bikelocation', function(data){ // Ändere Fahrradstandort
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        if(typeof data.lat == "number" && data.lat != NaN && typeof data.lon == "number" && data.lon != NaN)
                                                                                              db.query("UPDATE `user` SET bike_lat = ?, bike_lon = ? WHERE id = ?",[data.lat, data.lon, u.id], function(){ // Speichere neue Koordinaten im Benutzeraccount
                                                                                                usermanager.getBikeId(u.id,function(bikeid){ // Ermittle die Fahrrad-ID
                                                                                                    bikemanager.sync(bikeid); // Synchronisiere Standort mit allen Usern in Gruppe "online"
                                                                                                })
                                                                                                socket.emit('info','Der Fahrradstandort wurde erfolgreich angepasst');
                                                                                            })
                                                                                    })
                                                                                    .on('userprofileinfo',function(id){ // Userinformationsanfrage (Profilaufruf)
                                                                                       console.log("[!!!] Fordere User-Info an: #"+id);

                                                                                    })
                                                                                    .on('userinfo', function(id){ // Userinformationsabfrage
                                                                                    if(typeof id == "number")
                                                                                        usermanager.get(id, function(userinfo){
                                                                                            socket.emit('userinfo',userinfo);
                                                                                        });
                                                                                    })
                                                                                    .on('getsession', function(id){ // Fahrradübergabe
                                                                                    var u = usermanager.getUserBySocket(socket);
                                                                                    console.log("Leihanfrage #"+id+" versuche Radübergabe...")
                                                                                        if(typeof id == 'number') socket.emit('getsession',bikemanager.createSession(u.id,id));
                                                                                    })
                                                                                    .on('validatesession', function(key){
                                                                                        console.log("Prüfe Sessionkey");
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        bikemanager.validateSession(u.id, key);
                                                                                    })
                                                                                    .on('rating', function(data){ // Bewertung
                                                                                        if(typeof data.id == "number" && typeof data.rating == "number" && data.rating >= 1 && data.rating <= 5){
                                                                                            data.rating = parseInt(data.rating); // Falls jemand versucht Dezimalbrüche zu übermitteln

                                                                                                var u = usermanager.getUserBySocket(socket);
                                                                                                db.query("UPDATE `message` SET content = ? WHERE senderid = ? AND receiverid = ? AND type = ? AND content = '' ORDER BY `timestamp` DESC LIMIT 1", [data.rating, data.id, u.id, chatmanager.msgType.RATING], function(res){
                                                                                                    if(res.affectedRows){ // Wenn die entsprechende Chatnachricht existiert
                                                                                                        console.log(("Benutzer #"+u.id+" bewertet Benutzer #"+data.id+" mit "+data.rating+" Sternen").cyan);
                                                                                                        db.query("INSERT INTO `user_rating` SET ?",[{userid:data.id, voterid:u.id, rating: data.rating}], function(){
                                                                                                            socket.emit('info','<b>Vielen Dank f&uuml;r die Bewertung!</b><br>Sie haben '+data.rating+' Sterne vergeben.');
                                                                                                        });
                                                                                                    }
                                                                                                });

                                                                                        }
                                                                                    })
                                                                                    .on('uploadpic', function(data){
                                                                                        var u = usermanager.getUserBySocket(socket);
                                                                                        if(u != null && usermanager.uploadpic(u.id, data, function(picid){
                                                                                            socket.emit("picuploadsucceed",picid);
                                                                                        }))
                                                                                            socket.emit('info','Das Bild wird gespeichert!');
                                                                                    })
                                                                                    .on('setNotification', function(obj){
                                                                                    var u = usermanager.getUserBySocket(socket);
                                                                                    if(obj.bind) notification.insertNuser(u.id,obj.playerid);
                                                                                    else notification.removeNuser(u.id,obj.playerid);
                                                                                    });

                                                                                console.log("Daten sind "+JSON.stringify(data).length+" Zeichen lang");

                                                                    console.log("Client-Synchronisationsstempel: "+(new Date(obj.sync)).toMYSQLString());

                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });


                                                usermanager.displayUsers();

                                            } else {
                                             console.log("Authentifizierung fehlgeschlagen");
                                             socket.emit("login",{succeed : false}) // Login-Daten
                                            }

                                       });
                                   } else
                                   console.log("Loginparameter fehlerhaft".red);
                               });

                        });

                        http.listen(config.port, function(){
                          console.log(('Server bereit: Port '+config.port).bold.green);
                        });


            });






        }); // Erzeuge eine neue Datenbankverbindung
