/* Prototype des Benutzers, bei Login wird eine Instanz erstellt */
    module.exports = function(id,pw){
        this.id = id;
        this.pw = pw;
        this.email = "";
        this.name = "";
        this.socket = null;


        this.auth = function(db,cb){ // Authentifiziere. db = Database, cb = callback
            var self = this;
             db.query("SELECT * FROM `user` WHERE "+((this.id < 0) ? "id" : "matnr")+" = ? AND password = ? AND activated = 1",[((this.id < 0) ? -this.id : this.id),this.pw], function(rows){
                 var isValid = rows.length > 0;
                   if(isValid){
                        self.id = rows[0].id;
                        self.matnr = rows[0].matnr;
                        self.email = rows[0].email;
                        self.name = rows[0].forename+" "+rows[0].surname;
                   }
                   cb(isValid);
                });
        }

        this.bindSocket = function(s){ // Binde Socket an die User-Instanz
            this.socket = s;
        }
        this.dissociate = function(mgr){ // Trenne Verbindung und entbinde Benutzer aus der Struktur
            if(!this.socket.disconnected) this.socket.disconnect(); // Wenn Flag für disconnect nicht gesetzt ist, trenne Socketverbindung
            mgr.dissociate(this.id);
        }
        this.logout = function(mgr){ // Loge Benutzer aus
            var listeners = ["admin","logout","changepw","msg","bikeinfo","bikelocation","bikeinfo","userprofileinfo","userinfo","getsession","validatesession","rating","uploadpic","setNotification"];
            console.log("User "+this.id+" wird ausgeloggt...");

            for(var i=0;i<listeners.length;i++) // Entferne alle Listener für eingeloggte Nutzer
            this.socket.removeAllListeners(listeners[i]);

            this.socket.emit('logout',null);
            mgr.dissociate(this.id)
        }
    }