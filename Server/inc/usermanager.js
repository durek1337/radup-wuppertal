/* Benutzerverwaltung ohne Erfordernis, dass dieser auch online ist */
const fs = require('fs');
const sha1 = require('sha1'); // sha1-Hash-algorithmus
var Table = require('cli-table');
var users = {};
var socketToUser = {};
var mods = null;
var modobj = {}

module.exports = function(m){
    mods = m;

    modobj.associate = function(u,s){ // Verknüpfe Benutzer mit dem Socket. u: User, s: Socket
        u.bindSocket(s); // Bind socket on user
        users[u.id] = u;
        socketToUser[s.id] = u;

        console.info(("User "+u.id+" wurde eingeloggt").green);
    };

    modobj.dissociate = function(id){ // Trenne Verknüpfung des Nutzers und des Sockets, Verbindung bleibt erhalten
        var u = modobj.find(id);
        if(u != null){
        delete users[id];
        delete socketToUser[u.socket.id];
        }
        console.info(("User "+id+" wurde ausgeloggt").gray)
    };

    modobj.find = function(id){ // Suche User nach User-ID
        if(id in users)
        return users[id];
        else
        return null;
    };


    modobj.getUserBySocket = function(s){ // Suche User nach Socket-Instanz
        if(s.id in socketToUser) return socketToUser[s.id];
        else return null;
    }


    modobj.displayUsers = function(){ // Zeigt eine Tabelle mit den eingeloggten Benutzern
        var table = new Table({
            head : ["ID","Socket-ID","Name"],
            colWidths : [10,25,20]
        });
    for(var k in users) table.push([users[k].id,users[k].socket.id,users[k].name]);

    console.log(table.toString());
    }


    modobj.register = function(s, data,cbsuccess,cberror){ // Registriere Nutzer

        /* Prüfe Korrektheit der Daten  */
        var valid = typeof data.gender == "number" && (data.gender == -1 || data.gender == 0 || data.gender == 1) &&
        typeof data.forename == "string" && data.forename.length > 0 &&
        typeof data.surname == "string" && data.surname.length > 0 &&
        typeof data.pw == "string" && data.pw.length > 0 &&
        typeof data.id == "number" && data.id > 0 &&
        typeof data.country == "string" && data.country.length > 0 &&
        typeof data.city == "string" && data.city.length > 0 &&
        typeof data.street == "string" && data.street.length > 0 &&
        typeof data.housenumber == "string" && data.housenumber.length > 0 &&
        typeof data.lat == "number" && typeof data.lon == "number" &&
        typeof data.pic == "string" && data.pic.length > 0;
        console.log(((valid) ? ("Versuche Registrierung von Matrikelnummer "+data.id) : "Registrierungsdaten fehlerhaft"));
        /*
        console.log(typeof data.gender == "number" && (data.gender == -1 || data.gender == 0 || data.gender == 1));
        console.log(typeof data.forename == "string" && data.forename.length > 0);
        console.log(typeof data.surname == "string" && data.surname.length > 0);
        console.log(typeof data.pw == "string" && data.pw.length > 0);
        console.log(typeof data.id == "number" && data.id > 0);
        console.log(typeof data.country == "string" && data.country.length > 0);
        console.log(typeof data.city == "string" && data.city.length > 0);
        console.log(typeof data.street == "string" && data.street.length > 0);
        console.log(typeof data.housenumber == "string" && data.housenumber.length > 0);
        console.log(typeof data.lat == "number" && typeof data.lon == "number");
        console.log(typeof data.pic == "string" && data.pic.length > 0);
        */


        if(valid){
        modobj.existsMat(data.id, function(b){
            if(b){ // Wenn die Userid existiert
                cberror("Diese Matrikelnummer ist bereits registriert. Bitte überpr&uuml;fen Sie Ihre Eingabe oder Ihr E-Mail-Postfach.");
            } else {

                var obj = {
                    matnr : data.id,
                    password : data.pw,
                    forename : data.forename,
                    surname : data.surname,
                    country : data.country,
                    city : data.city,
                    street : data.street,
                    housenumber : data.housenumber,
                    bike_lat : data.lat,
                    bike_lon : data.lon
                }
                    mods.db.query("INSERT INTO `user` SET ?",obj,function(res){
                        if(!res.affectedRows)
                            cberror("Eintragung in Datenbank fehlgeschlagen");
                        else {
                        console.log("Registrierung erfolgreich!");
                            if(modobj.uploadpic(res.insertId,data.pic, function(picid){}))
                            cbsuccess();
                            else cberror("Fehler beim Bildupload");
                        }

                    });
            }

        });


        } else cberror("Die eingegebenen Daten sind entweder nicht vollst&auml;dig oder ung&uuml;tig. Bitte &uuml;berpr&uuml;fen Sie sie.");

    }

    modobj.uploadpic = function(id, data, cb){ // Lade Profilbild zu User mit Matrikelnummer id hoch

      var matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (matches.length !== 3 || matches[1] !== "image/jpeg") return false;

    fs.writeFile('public/userpics/'+id+'.jpg', new Buffer(matches[2], 'base64'), function(err) {
        if(err) console.log(err);
        else {
        console.log("#"+id+": Bild hochgeladen!");
            cb(id);
        }
    });
    return true;
    }

    modobj.exists = function(id,cb){ // Prüft ob User mit id existiert
        mods.db.query("SELECT count(1) AS `check` FROM `user` WHERE id = ?",[id],function(rows){
           cb(rows[0].check == 1); // Antwort in Callbackfunktion
        });
    };
    modobj.existsMat = function(id,cb){ // Prüft ob User mit id existiert
        mods.db.query("SELECT count(1) AS `check` FROM `user` WHERE matnr = ?",[id],function(rows){
           cb(rows[0].check == 1); // Antwort in Callbackfunktion
        });
    };
    modobj.get = function(id,cb){ // Hole öffentliche Nutzerdaten
        /* ANTWORTZEIT IST NICHT MEHR GÜLTIG */
        mods.db.query("SELECT `id`, `rank`, `street`, `city`, `bike_lat`, `bike_lon`, IFNULL((SELECT `id` FROM `bike` WHERE holderid = user.id AND holdertype = ?), 0) AS `bikeid`, (SELECT COUNT(rating) FROM `user_rating` WHERE userid=user.id) AS `ratingcount`, (SELECT AVG(rating) FROM `user_rating` WHERE userid=user.id) AS `rating`,CONCAT(forename,' ',LEFT(surname,1),'.') AS `name`, 0 AS `responsetime` FROM `user` WHERE id= ?",[mods.bikemanager.holderType.USER,id],function(rows){
            if(rows.length > 0) cb(rows[0]); // Gebe an callback-Funktion weiter, insofern vorhanden
            else cb(null);
        });
    }
    modobj.getAll = function(cb){
        mods.db.query("SELECT `id`, `matnr`, `activated`, `registered`, `rank`, `gender`, `surname`, `forename`, `street`, `housenumber`, `city`, `country`, `bike_lat`, `bike_lon`, IFNULL((SELECT `id` FROM `bike` WHERE holderid = user.id AND holdertype = "+mods.bikemanager.holderType.USER+"), 0) AS `bikeid`, (SELECT COUNT(rating) FROM `user_rating` WHERE userid=user.id) AS `ratingcount`, (SELECT AVG(rating) FROM `user_rating` WHERE userid=user.id) AS `rating`, 0 AS `responsetime` FROM `user`", [], function(res){
        console.log(res);
        cb(res);
        })

    }

    modobj.changeData = function(id, obj,cb){
      var validFields = [];
      var valid = true;

      for(var i in obj)
        if(validFields.indexOf(i) == -1)
          valid = false;

      if(valid)
        mods.db.query("UPDATE `user` SET ? WHERE id = ?",[id,obj],function(res){
          if(res.affectedRows) cb(true);
          else cb(false);
        });
      else cb(false);

    }

    modobj.getBikeId = function(userid,cb){ // Ermittle Fahrrad-ID durch die Halter-User-ID
        mods.db.query("SELECT `id` FROM `bike` WHERE holderid = ? AND holdertype = ?",[userid,mods.bikemanager.holderType.USER],function(data){
            if(data.length == 0) cb(0);
            else cb(data[0].id);
        })

    }

    /*
        Diese Funktion generiert einen Alpha-numerischen Schlüssel mithilfe eines statischen
        Schlüssels und der Matrikelnummer - rekonstruierbar, ist dafür aber nicht nötig
        abzuspeichern. Ggf. für den letztendlichen Einsatz umschreiben.
    */
    modobj.generateActivationKey = function(id,statickey){
    return sha1(id+statickey);
    }

return modobj;
}
