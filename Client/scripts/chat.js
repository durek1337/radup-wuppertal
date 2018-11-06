var chat = {
    currentChatid : 0,
    getStorage: function(){ // Lade lokal-gespeicherte Daten wenn vorhanden
        var conv = memory.get("chats"),
        bikes = memory.get("bikes");
        try{
        if(conv != null) chat.conversations = JSON.parse(conv);
        } catch(e){
            app.report(0,"Chat-Speicher JSON-Parse",{msg : conv});
            localStorage.removeItem("chats");
        }
    },
    startConversation : function(id){
        if(id == user.data.id)
            app.alert("Man kann sich nicht selbst schreiben!");
        else
            chat.gotoConversation(id);
    },
    generateHeader : function(){
        var id = chat.currentChatid;

        var firstid = user.data.id;
        var lastid = id;

        var func_checkTransfer = function(lid){
            return function(){
                switch(chat.getTransferState(lid)){
                    case -1:
                        $("#chat-transfer-button").css("transform","rotate(180deg)").show();
                    break;
                    case 0:
                        $("#chat-transfer-button").hide();
                    break;
                    case 1:
                        $("#chat-transfer-button").css("transform","rotate(0deg)").show();
                    break;

                }
            }
        }(lastid);

        $("#chat .chat-userpic:first")
        .attr("data-userid",firstid)
        .css("backgroundImage","url('"+config.userpicsPath+firstid+"')")
        .off("click").click(function(){
            server.send("userprofileinfo",firstid);
            app.changePage("profile");
        }); // Fahrradicon ein- oder ausblenden je nach Status


        $("#chat .chat-userpic:last")
        .attr("data-userid",lastid)
        .css("backgroundImage","url('"+config.userpicsPath+lastid+"')")
        .off("click").click(function(){
            user.gotoProfile(lastid);
        }); // Fahrradicon ein- oder ausblenden je nach Status

        $("#chat").find(".ui-title").html($("<div />",{"class" : "fillable-user", "data-userid" : id}).append($("<span />",{"data-fillitem" : "name"})));
        var $navbar_left = $("<div />",{"class" : "fillable-user", "data-userid": firstid, "style" : "margin-right:auto"})
            .append($("<div />",{"class" : "chat-userpic", "data-fillprop-link" : "true", "data-fillitem" : "pic"})
                .append('<img data-fillitem="hasbike" src="images/icons/chat_bike_left.svg" alt="" style="height:100%;position:relative;bottom:-20%;right:-75%;" />')
            );

            var $navbar_middle = $("<button />",{"id": "chat-transfer-button", "class": "iconbutton ui-btn ui-btn-b"})
            .click(chat.transfer)
            .add($("<div />",{"id": "chat-transfer-checkicon", "class" : "checkicon-green"}).hide());

        var $navbar_right = $("<div />",{"class" : "fillable-user", "data-userid": lastid, "style" : "margin-left:auto"})
            .append($("<div />",{"class" : "chat-userpic", "data-fillprop-link" : "true", "data-fillitem" : "pic"})
                .append('<img data-fillitem="hasbike" src="images/icons/chat_bike_right.svg" alt="" style="height:100%;position:relative;bottom:-20%;left:-75%;" /> ')
            );
        $("#chat").find("div[data-role=navbar]").html($navbar_left.add($navbar_middle).add($navbar_right));

        func_checkTransfer();
        //visualisation.fillUserData(firstid);
        //visualisation.fillUserData(lastid);
       /*
                if($("#chat .chat-userpic[data-userid="+data.id+"]").children("img").length > 0)
                    $("#chat-transfer-button").data("checkfunc")();
                $(".chat-userpic[data-userid="+data.id+"]").children("img").toggle(data.bikeid > 0);
       */
    },
    gotoConversation : function(id){

        chat.currentChatid = id;
        chat.generateHeader();
        app.changePage("chat");

        if(id in memory.chats){
            var c = memory.chats[id];
            if(c.unread){
               c.unread = false; // Weil Chat betreten, nicht mehr als ungelesen markieren
               memory.saveChats();
               chat.generateConversationList();
            }
        }


        chat.generateConversation();

    },

    generateConversationList : function(){
        //var statusarr = ["Konversation","Leih-Anfrage","Radup! wurde &uuml;bergeben","Radup! vergeben"];
       $l = $("<ul />",{"class" : "chat-conversation"});
       var chats = [];
       for(var i in memory.chats) chats.push(memory.chats[i]);
       chats.sort(function(a,b){ // Sortiere Chats so, dass neueste Ereignise oben erscheinen
           if(a.lastmessage > b.lastmessage)
                return -1;
           if(a.lastmessage < b.lastmessage)
                return 1;

           return 0;
       })

       var statustext = "Konversation";
       var chatids = [];

        for(var i=0;i<chats.length;i++){
            var c = chats[i];
            var ctime = new Date(c.lastmessage);

            var $li = $("<li />",{"class": "fillable-user", "data-userid" : c.id}).click(function(id){ // Gehe zur Konversation
            return function(){
            chat.gotoConversation(id);
            }
            }(c.id));

            if(c.unread) $li.addClass("unread");
            var $pic = $("<div />", {"class" : "chat-conversation-list-pic", "data-fillitem" : "pic"})
                .append($("<img />", {"data-fillitem" : "hasbike", src : "images/icons/chat_bike_right.svg", alt : "", style : "height:60%;position:relative;top:-15%;left:-30%;"}))
                .appendTo($li);
            var $desc = $("<div />",{"class" : "chat-conversation-list-desc"}).html(ctime.getDayLetters()+", "+ctime.getFormatedDate()+"<br><b data-fillitem='name'></b><br>"+statustext).appendTo($li);
            var $end = $("<div />",{"class" : "chat-conversation-list-end"}).appendTo($li);

            chatids.push(c.id);

            $l.append($li);

        }

       $("#mails").find("div[data-role=content]").html($l);
       visualisation.fillUserData(chatids);

       return $l;


    },
    generateConversation : function(){
        console.log("Generiere Konversationsstruktur");

        var $content = $("#chat .ui-content").empty();
        chat.scrollHeight = $content[0].scrollHeight;


        var $l = $("<ul>",{"class" : "chat-message"});

        var h = 0;
        if(chat.currentChatid in memory.chats){
            var c = memory.chats[chat.currentChatid];
            for(var i=0;i<c.messages.length;i++){
                var m = c.messages[i];
                var ts = new Date(m.timestamp);
                var $li = $("<li>");
                if(m.type == 0) // TYP 0: Usernachricht
                    $li.text(m.content).addClass((m.self == 0) ? "right" : "left");
                else { // Systemnachricht
                    $li.addClass("left chat-sysmessage");
                    var $head = $("<div />", {"class" : "chat-sysmessage-head"});
                    if(m.type == 1){
                        $head.append($("<img />",{src : "images/icons/warning.svg", "class" : "chat-sysmessage-icon"})).append("Systemnachricht");
                        $li.html($head).append($("<div />",{text : m.content}));

                    }

                    /* if(m.type == 1){
                        $head.append($("<img />",{src : "images/icons/clock.svg", "class" : "chat-sysmessage-icon"})).append("Leihfrist abgelaufen");
                        $li.html($head).append($("<div />",{text :"Bitte stelle sicher, dass das Rad ab jetzt täglich für andere bereit hälst. Ansonsten gib es bitte an der Uni zurück."}));

                    } else if(m.type == 2){
                        $head.append($("<img />",{src : "images/icons/warning.svg", "class" : "chat-sysmessage-icon"})).append("Wartung n&ouml;tig");
                        $li.html($head).append($("<div />",{text :"Es ist wieder Zeit für eine Wartung. Bitte bringe <i>Radup!</b> als nächstes zur Uni."}));
                    }
                    */
                    if(m.type == 2){ // TYP 2: Bewertungen
                        if(!m.self){ // Wenn die Nachricht quasi vom Konversationspartner gesendet wird
                        var $rating = $("<div />");
                        if(m.content.length == 0){ // Noch nicht bewertet
                            $rating.rating({scale : 2.5, interactive : true, choose : function(m) {return function(val){
                                m.content = val; // Ändere lokalen Wert der Nachricht - dies ist die Bewertung
                                memory.saveChats();
                                server.send('rating',{id : chat.currentChatid, rating : val}); // Sende ID und Wert an den Server
                            }}(m)}).css("marginBottom",8);
                        } else $rating.rating({val : parseInt(m.content)});

                        $head.append($("<div />",{"class" : "chat-sysmessage-checkicon"})).append("Radup wurde &uuml;bergeben");
                        $li.html($head).append($("<div />",{style : "white-space:nowrap;text-align:center;"}).append($rating).append("<br><b>Bewertung</b>"));
                        } else {
                        $head.append($("<div />",{"class" : "chat-sysmessage-checkicon"})).append("Radup wurde &uuml;bergeben");
                        $li.html($head).append($("<div />",{text : "Vielen Dank für deine Zuverlässig- und Koorperationsfähigkeit!"}));
                        }
                    }


                }
                $li.append($("<span />",{"class" : "time", text : ts.getFormatedDate()+" "+leadingZeroes(ts.getHours(),2)+":"+leadingZeroes(ts.getMinutes(),2)+":"+leadingZeroes(ts.getSeconds(),2)})).appendTo($l)
            }
            $content.append($l);
            console.log($li);
            var checkforInsert = function($m,$c){
                var f = function(){
                 var ch = $c.height();
                if($m.position().top < 0 || ch > $(document).height() || ch == 0){ // Ist diese Bedingung erfüllt, ist das Rendern noch nicht komplett abgeschlossen
                    setTimeout(f,50);
                } else $c.scrollTop($c[0].scrollHeight); // Scrolle bis nach ganz unten

                }
                return f;

            }($li,$content);

            if(c.messages.length > 0)
            checkforInsert();
        }

    },
    sendMsg: function(msg){
        if(msg.length > 0) server.send("msg",{id: chat.currentChatid, content : msg});
    },
    getTransferState : function(id){ // -1 = erhalten, 0 = nicht möglich, 1 = abgeben
        var firstuser = user.data;
        var lastuser = memory.getUser(id);

        var state = 0;

        if(firstuser != null && lastuser != null){
        if(firstuser.bikeid > 0 && lastuser.bikeid == 0)
            state = 1;
        else if(firstuser.bikeid == 0 && lastuser.bikeid > 0)
            state = -1;
        }
        return state;
    },
    transfer : function(){
        var transferstate = chat.getTransferState(chat.currentChatid);
        if(transferstate == -1) app.confirm("Sie können das Fahrrad übernehmen, indem Sie den QR-Code des aktuellen Halters scannen.<br>Wollen Sie den QR-Code jetzt scannen?", function(val){
            if(val) chat.scanQR();
        });
        else if(transferstate == 1) app.confirm('Sie können das Fahrrad weitergeben, indem Sie den erscheinenden QR-Code scannen lassen. Dieser ist nur für 60 Sekunden gültig. Sollte die Zeit überschritten werden, wiederholen Sie den Vorgang.<br>QR-Code anfordern?', function(val){
            if(val) server.send('getsession',chat.currentChatid);
        })
        else app.alert("Die Übergabe ist nicht möglich.");
    },
    showQR : function(sessionkey){ // Die chatid dient der Unterscheidung von Leiher oder Verleiher und kann statisch im Programmcode stehen
            app.info($("<div />").qrcode({
                background: '#fff',
                text : sessionkey,
                mode: 4,
                label : "Radup!",
                minVersion: 1,
                ecLevel: 'H',
                mSize:0.15,
                image: $("#raduplogo")[0]//$("<img />",{src : "images/radup_logo_blank.svg", id :"qrcodelogo", style :"width:50px;height:50px;"})[0]
            }));

    },
    scanQR : function(){
        if(app.isApp())
        hybrid.barcodeScan();
        else app.alert("Der QR-Code Scanner ist nur in der mobilen App zug&auml;glich.");
    }
};