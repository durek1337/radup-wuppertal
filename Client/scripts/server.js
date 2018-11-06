var server = {
    sendBuffer : [],
    uploads : [],
    connect : function(){
        console.log("Serververbindungsversuch...");
        $.getJSON(config.socketurl,function(data){
            console.log("Versionsabfrage erfolgreich");
           if(data.version == app.version){
           try{
           socket = new io.connect(config.socketurl, {transports: ['websocket'], reconnection: true});
            } catch(e){
                console.log("Fehler beim Initialisieren des Sockets");
            }
           socket.on('connect',function(){ // Verbinde zum Server
              console.log("Persistente Verbindung zum Server hergestellt");
              $("#disconnect-icon").hide();
              if((user.config.remember == 1 && user.config.autologin == 1) || ("id" in user.data && user.data.id > 0) || app.getPageId() != "home") $("#loginform").submit(); // Logge automatisch ein wenn konfiguriert oder bei reconnect
              app.enable("connection");
                    var j=0;
                    for(var i=0;i<server.sendBuffer.length;i++){
                        var cmd = server.sendBuffer[j];
                        if(!cmd.online){
                        server.send(cmd.name,cmd.data);
                        server.sendBuffer.shift();
                        } else j++;
                    }
                    //server.sendBuffer = []; // Lösche den Puffer


           })
           .on('connect_failed', function(){ // Verbindung fehlgeschlagen
            console.log('Persistente Verbindung zum Server fehlgeschlagen');
           })
           .on('disconnect', function(){ // Verbindung wurde getrennt
               console.log("Persistente Verbindung getrennt...");
               $("#disconnect-icon").show();
               //user.online = false;
           })
           .on('logout',function(data){ // Logout vom Server (Angefragt oder Kick)
                console.log("Benutzer ausgeloggt");
                app.changePage("home");
                user.setLogout();
           })
           .on('login',function(data){ // Antwort auf Loginversuch
               if(data.succeed){
                   console.log("Login erfolgreich");
                    var id = parseInt($("#loginform").find("input[name=matrikel]").val());
                    console.log(data);
                    user.setLogin(data.userinfo);
                    memory.applySyncstamp(data.sync);
                    memory.set('id',id);

                    if($("#loginform input[name=remember]").prop("checked")){ // Wenn das Passwort gemerkt werden soll
                        user.config.remember = 1;
                        memory.set('pw',$("#loginform").find("input[name=pw]").val());
                    } else { // Wenn nicht
                        user.config.remember = 0;
                        memory.set('pw','');
                    }

                    user.saveConfig(); // Speichere Konfigurationen
                    memory.applyData(data.data); // Wende empfangene Daten an

                    /* Versuchte Serverinteraktionen werden nachgeholt */
                    var j=0;
                    for(var i=0;i<server.sendBuffer.length;i++){
                        var cmd = server.sendBuffer[j];
                        if(cmd.online){
                        server.send(cmd.name,cmd.data);
                        server.sendBuffer.splice(j,1);
                        } else j++;
                    }
                    //server.sendBuffer = []; // Lösche den Puffer

                    if(app.getPageId() == "home"){ // Wenn der Login von dem Formular aus erfolgte (nicht beispielsweise eine Verbindungswiederherstellung im internen Bereich)
                    app.changePage("search");

                    } else if(map.$dom != null) map.addPins(); // Wenn die Karte nicht initialisiert werden muss, sollen zumindest die Pins neu gesetzt werden

                    app.initPage(app.getPageId());
                    app.generateMenu();
                    if(data.userinfo.rank > 1) admin.init(data.userinfo.rank);

                } else {
                    app.changePage("home");
                    app.alert("Es konnte nicht eingeloggt werden.<br>Bitte &uuml;berprüfen Sie Ihre Daten und vergewissern Sie sich, dass Sie Ihre E-Mailadresse verifiziert haben.");
                }

           })
           .on('register',function(data){ // Antwort auf Registrierungsdaten
               if(data.succeed){ // Registrierung erfolgreich
               intro.swiper.slideTo(intro.swiper.slides.length-2);
               app.info($("<div />").append($("<div />",{"class" : "checkicon-white", "style" : "margin:0 auto;"}))
               .append("<br>Herzlich willkommen bei Radup!<br>Bitte best&auml;tigen Sie zur Aktivierung noch Ihre E-Mailadresse, indem Sie den Ihnen zugesandten Link aufrufen."));
               } else {
                   app.alert(data.msg);
                   $("#registerform").find("input[type=submit]").prop("disabled",false); // Gib den Registrieren-Button wieder frei
               }
           })
           .on('sync', function(data){
               console.log("Empfange Synchronisierungsdaten");
               console.log(data);
                memory.applyData(data.data);
                memory.applySyncstamp(data.sync);

                if(data.data) map.addPins();
           })
           .on('msg',function(data){
               console.log("Empfange Nachricht");
                memory.applySyncstamp(data.timestamp);
                memory.addMessage(data);

                if(chat.currentChatid == data.id && app.getActivePage() == "chat"){
                    chat.generateConversation();
                    memory.chats[chat.currentChatid].unread = false; // Wenn Chat offen, markiere als gelesen
                } else chat.generateConversationList();
                memory.saveChats();
           })
           .on('info',function(msg){
               app.info(msg);
           })
           .on('alert',function(msg){
                app.alert(msg);
           })
           .on('userinfo', function(data){
                console.log('userinfo',data);
                memory.users[data.id] = data;
                visualisation.fillUserData(data.id);
           })
           .on('picuploadsucceed', function(picid){
               console.log("Profilbild #"+picid+" wurde hochgeladen");
                if(picid == user.data.id)
                app.info('Bild erfolgreich hochgeladen!<br><div data-userid="'+picid+'" class="userpic"></div>');
                visualisation.refreshUserPic(picid);
           })
           .on('transfer', function(succeed){
                if(succeed){
                    app.info($("<div />").append($("<div />",{"class" : "checkicon-white", "style" : "margin:0 auto;"})).append("<br>&Uuml;bergabe erfolgreich verifiziert!"));
                } else app.alert("Transfer unbekannterweise fehlgeschlagen.");

           })
            .on('getsession', function(key){
                chat.showQR(key);
            })
           .on('test', function(data){
               console.log(data);
           })
           .on('admin',function(data){
               admin.receiveData(data);
           })
           .on('uploadstatus',function(data){ // data.status: 0 = Upload abgelehnt, 1 = Hole Daten, 2 = Upload abgeschlossen
           /*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
                if(data.status == 0) app.alert("Der Upload von "+server.uploads[0].title+" wurde abgelehnt");
                if(data.status == 1){ console.log("Hole Daten");
                    server.send('upload',server.uploads[0].parts.shift());
                }
                if(data.status == 2) app.info("Upload erfolgreich abgeschlossen");

           });

           } else {
           app.alert("Die App ist nicht auf dem neusten Stand!<br>Bitte aktualisieren Sie sie.");
           }
        }).fail(function(){
            console.log("Initiale Serververbindung und Versionsabgleich fehlgeschlagen");
            //if(window.confirm("Initiale Serververbindung nicht erfolgreich\nErneut verbinden?"))
            setTimeout(server.connect,5000);
        });
    },
    send : function(name,data){


        if(socket != null && socket.connected){

             socket.emit(name,data);


            console.log("Sende Daten '"+name+"'");
            console.log(data);
            return true;
        }
        console.log("Speichere Serveranfrage '"+name+"' - Online: "+user.online)
        server.sendBuffer.push({name : name, data:data, online : user.online});
        app.disable("connection");
        return false;
        //app.alert("Keine Verbindung zum Server vorhanden");
    },
    upload : function(obj){ /*** UPLOADMANAGER - NOCH NICHT AKTIV  ***/
        var chunksize = 100000; // ca. 100 KB
        var dataarr = [];
        for (var i=0, j=array.length; i<j; i+=chunksize)
            dataarr.push(new Buffer(array.slice(i,i+chunk)));

        var upobj = {
            id : obj.id,
            type : obj.type, // 0 = Allgemein Binär, 1 = Bild
            parts : dataarr,
            datasize : obj.data.byteLength,
            arrsize : dataarr.length
        }
        server.uploads.push(upobj);
        if(server.uploads.length == 1) // Wenn dieser Auftrag der erste ist; sonst queuen
        server.send('startupload',{
            id : upobj.id,
            type : upobj.type,
            datasize : upobj.datasize,
            arrsize : upobj.arrsize
        });
    }

};
