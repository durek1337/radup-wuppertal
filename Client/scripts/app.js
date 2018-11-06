/* Grundlegende Informationen und Funktionen zur Anwendung */

var app = {
    version: 0.1, // Version für abgleich mit dem Server
    getPageId : function(){
        return $.mobile.pageContainer.pagecontainer("getActivePage").attr("id");
    }, // Aktuelle Seite
    close : function(){ // Schließe die App
        if(app.isApp()) navigator.app.exitApp();
    },
    inBackground : false, // Nicht in Benutzung, listener auskommentiert in init.js
    heights : {
        screen : 0,
        header : 0,
        footer :0
    },
    disableReason : [],
    disable : function(reason){
          var reasons = {
            "connection" : "Es besteht keine Verbindung zum Server.<br>Die letzte Serveranfrage wird automatisch wiederholt.",
            "response" : "Es wird auf eine Antwort des Servers gewartet. Bitte warten..."
          }
          app.disableReason.push(reason);

          var content = "<b>Interaktion kurzzeitig verhindert:</b>";
          for(var i=0;i<app.disableReason.length;i++)
            content += "<br>"+reasons[app.disableReason[i]];

          $("#disable-overlay").html($("<div />").html(content)).show();
    },
    enable : function(reason){
        app.disableReason = deleteFromArrayByValue(app.disableReason,reason);
        if(app.disableReason.length == 0) $("#disable-overlay").hide();
    },
    resize : function(){
        console.log("Passe Seite an...");
        var pageId =  app.getPageId();
        var $pageId = $("#"+pageId);
                    var screen = $.mobile.getScreenHeight(),
                        $newcontent = $pageId.find(".ui-content"),
                        $newheader = $pageId.find(".ui-header"),
                        $newfooter = $pageId.find(".ui-footer"),
                        header = $newheader.outerHeight(), //$newheader.hasClass("ui-header-fixed") ? $newheader.outerHeight() - 1 : $newheader.outerHeight(),
                        footer =  $newfooter.outerHeight(); //$newfooter.hasClass("ui-footer-fixed") ? $newfooter.outerHeight() - 1 : $newfooter.outerHeight();

            contentCurrent = $newcontent.outerHeight() - $newcontent.height(),
            content = screen - header - footer - contentCurrent;
            $newcontent.height(content);

        /* Speichere aktuelle Maße */
        app.heights.screen = screen;
        app.heights.header = header;
        app.heights.footer = footer;

    },
    changePage : function(t){ // Wechsle zu Seite t
        console.log("Gehe zu Seite "+t);
        $.mobile.pageContainer.pagecontainer("change", "#"+t);
    },
    initPage : function(pageId){
        app.pageId = pageId;
        var $pageId = $("#"+pageId);

        console.log("Seite "+pageId+" geladen");
        app.resize();

        if(pageId == "search"){
          if(map.$dom == null) map.init(); // Initialisierung beim ersten Aufruf
          map.$dom.geomap("resize"); // Größe neu justieren. Gerade nach dem Login, wenn die Tastatur noch nicht vollständig verschwunden war, kann es sonst zu Darstellungsfehlern kommen.
            setTimeout(function(){ // Erneut falls das Gerät die Tastatur langsamer ausblendet
                map.$dom.geomap("resize")
            },2000);

        }
        else if(pageId == "home") intro.initSwiper(); // Bilderserie vom Beginn quasi initialisieren da es zu Fehlern kommen kann wenn vorher die Seite gewechselt wurde
        else if(pageId == "chat") $pageId.find("input[name=msg]").focus(); // Fokus auf die Texteingabe im Chat
        else if(pageId == "bikes") $("#bikes").find("div[data-role=content]").html(visualisation.generateBikeList());
        else if(pageId == "account") if(user.online) visualisation.applyUserProfile(user.data.id);

    },
    goPageBack : function(){ // Gehe zurück zur vorangegangenen Seite
        history.back();
    },
    isApp : function(){ // true falls App, false falls Browser
        return (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1);
    },

    getActivePage : function(){ // Gebe die aktuelle Seitenbezeichnung zurück
        return $.mobile.pageContainer.pagecontainer("getActivePage").attr("id");
    },
    info : function(msg){ // Erzeuge Dialog-Nachricht
        $("#dialog-info").dialog("option",{desc : msg}).dialog("open");
    },
    alert : function(msg){ // Erzeuge Dialog-Nachricht mit Ausrufezeichen
        $("#dialog-alert").dialog("option",{desc : msg}).dialog("open");
    },
    confirm : function(msg,func){ // Erzeuge Bestaetigungsdialog (Bestätigen und Abbrechen)
        $("#dialog-confirm").dialog("option",{desc : msg, choose: func}).dialog("open");
    },
    support : function(){ // Zeuge Dialogfenster zur E-Mail-Kontaktaufnahme mit dem Support
        app.confirm("Um mit einem Admin in Kontakt zu treten, m&uuml;ssen Sie eine E-Mail an "+config.support.mail+" schreiben.<br>Wollen Sie Ihren E-Mail-Client &ouml;ffnen?",function(val){
            if(val)
            window.location.href = "mailto:"+config.support.mail+"?body=Sehr%20geehrtes%20Radup-Team%2C%0A%0A%0AMit%20freundlichen%20Gr%C3%BC%C3%9Fen%0A"+user.data.name+"%0A"+user.data.id;
        });
    },
    report : function(type,desc,data){ // Wird bei Fehler aufgerufen. Fehlerbericht wird an den Server übermittelt.
        console.log("Erstelle Fehlerbericht");
        var msg = "";
        switch(type){
            case 0: // JavaScript Runtime-Fehler
                msg = "Es ist ein Laufzeitfehler aufgetreten.<br>Bitte vergewissern Sie sich, dass sie die neuste Version haben.<br>Sollte dieses Problem erneut auftreten, kontaktieren Sie den Support.";
            break;
            case 1: // Speicherfehler
                msg = "Dein lokaler Speicher ist nicht mehr lesbar.";
            break;
            case 2:
                msg = "";
            break;
        }
        app.alert(msg+"<br><br>Der lokale Speicher wird gel&ouml;scht.");
        app.changePage("home");
        memory.truncate();

        var c = null;
        try{ // Sammle Software und Betriebssystemdaten
        c = {
            appVersion : app.version,
            isApp : app.isApp(),
            appPage : app.getActivePage(),
            viewerAgent: navigator.userAgent,
            viewerName : navigator.appName,
            viewerProduct: navigator.product,
            viewerVersion : navigator.version,
            viewerLanguage: navigator.language,
            viewerPlatform : navigator.platform,
            viewerPermissions : navigator.permissions
        }

        } catch(e){
            console.log("Fehler beim Sammeln der Clientdaten");
           c = {errorname : e.name, msg : e.message};
        }
        if(socket.connected)
        server.send("appreport",{type: type, desc: desc, data : data, client : c, user : user.id}) // Sende an den Server

    },
    generateMenu : function(){
        console.log("Generiere Menü");
     var icons = [
     {name : "search", label: "SUCHE", rank : 1},
     {name : "mails", label: "MAILS", rank : 1},
     {name : "routes", label: "ROUTEN", rank : 1},
     {name : "account", label: "KONTO", rank : 1},
     {name : "help", label: "HILFE", rank : 1},
     {name : "raiseup", label: "RAISE UP", rank : 1},
     {name : "admin", label: "ADMIN", rank : 2}
     ];
            var $icons = $();
            for(var i=0;i<icons.length;i++){
                if(user.data.rank < icons[i].rank) break;
                var $i = $("<div />",{"class" : "leftmenuicon"})
                .css("background", "url(images/icons/menu_"+icons[i].name+".svg) no-repeat") // Icongrafik
                .click(function(n){
                    return function(){
                     app.changePage(n);
                }
                }(icons[i].name))
                .append($("<span />",{text : icons[i].label}));

                $icons = $icons.add($i);

            }

                 var ts = 15; // Text-Space
                 var hp = 20; // Hor-Padding
                 var vp = 3;

                 var h = Math.ceil($(document).height()/$icons.length)-vp*2;
                 var panelw = h-ts+2*hp;

                 $icons.css({
                     backgroundSize : (h-ts)+"px "+(h-ts)+"px",
                     width: (h-ts)+"px",
                     height: h+"px",
                     marginLeft: hp+"px",
                     marginRight: hp+"px",
                     marginBottom: vp+"px",
                     marginTop: vp+"px"
                 });


             $("#leftpanel").width(panelw).html($icons);
    },
    initStructures : function(){ // Initialisiere Grundstrukturen wie Dialog-Fenster, Bewertungssterne, usw. und passe das Menü an die Bildschirmmaße an
         $("#disconnect-icon").click(function(){ // Initialisiere Meldung bei Klick/Tap auf das Symbol bei fehlender Serververbindung
            app.alert("Solange dieses Symbol angezeigt wird, besteht keine Serververbindung:<br><br>Host "+config.socketurl+"<br>Verbindung über "+user.getConnectionInfo());
        });


        /* Initialisiere Dialogfenster-Widgets */

        $("#dialog-alert").dialog();
        $("#dialog-alert .cui-dialog-box").prepend($("<div />",{"class" : "cui-icon-warning", "style" : "margin:20px auto 0 auto;"}))
        $("#dialog-info").dialog();
        $("#dialog-confirm").dialog({values : [{content : "Akzeptieren", value: true},{content : "Abbrechen", value: false}]});
        $("#dialog-abbort").dialog({values : [{
                content : "Abbrechen",
                value : false
            }]});



        $("div[data-item=rating]").rating(); // Initialisiere Rating-Stern-Widgets



             var $icons = $(".leftmenuicon");


             /* Listenpunkten in den Einstellungen ihre Funktion verleihen*/

            $("#config-changepic").photopicker({
                   submit : function(val){
                       server.send('uploadpic',val);
                   },
                   isContainer : false,
                   dialogId : "dialog-croppie-edit"
            });

             $("#config-bikelocation").locationpicker({
                 submit : function(coord){
                     server.send('bikelocation',{lon: coord[0], lat: coord[1]});
                 }
             });

             /* Supportformular */
             /*
             var $supportform = $("<form />",{id: "supportform", "data-enhance" : "false"})
             .append(
                $("<select />",{"name" : "type"})
                .append(new Option('Fehler bei der Übergabe',1))
                .append(new Option('Schäden/Verlust bei Bike oder Zubehör',2))
                .append(new Option('Sonstiges',0))
             );
             $supportform
             .append("<input>",{type: "text", name : "subject", placeholder : "Titel des Anliegen"})
             .append("<textarea />",{name : "content", placeholder : "Nähere Beschreibung"})
             .appendTo($("#support .limiter"));
            */



    },
    closeDialog : function(){
        var $stack = $("#dialogs").children(".cui-dialog-opened");
        var stacksize = $stack.size();
        if(stacksize > 0) $($stack[stacksize-1]).dialog("close");
    }


}
