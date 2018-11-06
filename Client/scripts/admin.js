var admin = {
    init : function(userrank){ // Erstelle Adminstruktur nach Rank
    console.log("Initialisiere Administrationsfunktionen mit Userrang "+userrank);
    var $buttons = $();
        for(var i in admin.part){
            var p = admin.part[i];
            console.log(p);
            if(p.rank <= userrank){
                $buttons = $buttons.add($("<button />", {text : p.label}).click(admin.part[i].click));
                p.init();
            }
        }
        console.log($buttons);
        $buttons.addClass("ui-btn ui-mini");
        $("#adminpanel").html($buttons);

    },
    receiveData : function(data){ // Empfange Serverdaten und verarbeite sie
        console.log(data);
        if(data.type == "user"){
            if(data.subtype == "get"){
                if(data.id == 0) admin.cache.users = arrayToObject(data.content,"id");
                else admin.cache.users[data.id] = data.content;
                admin.part.user.displayAll(admin.cache.users);
            }
        } else if(data.type == "ticket"){
            if(data.subtype == "get"){
                   if(data.id == 0) admin.cache.tickets = arrayToObject(data.content,"id");
                   admin.part.ticket.displayAll(admin.cache.tickets);
            } else if(data.subtype == "take"){ // Hier sollten am besten auch die User-IDs der ausführenden Admins empfangen werden um alles autom. für alle eingeloggten zu synchronisieren.
                    var isCurrentAdmin = data.adminid == user.data.id;
                    var idBtn = "admin-ticket-actionBtn-"+data.id;
                    var $b = $("#"+idBtn)

                    if(data.succeed){
                        if(isCurrentAdmin)
                          app.info("Das Ticket (#"+data.id+") wurde angenommen");
                        else $b.prop("disabled",false);

                        admin.cache.tickets[data.id].log = data.logmsg+admin.cache.tickets[data.id].log;
                        admin.cache.tickets[data.id].supportid = data.adminid;

                        if($("#admin-detail div").data("ticketid") == data.id) // Wenn das Ticket geöffnet ist
                          admin.part.ticket.displayDetails(data.id); // aktualisiere Daten

                    } else if(isCurrentAdmin) app.alert("Das Ticket (#"+data.id+") konnte nicht angenommen werden");

            }  else if(data.subtype == "release"){
                    var isCurrentAdmin = data.adminid == user.data.id;
                    var idBtn = "admin-ticket-actionBtn-"+data.id;
                    var $b = $("#"+idBtn);
                    if(data.succeed){
                        if(isCurrentAdmin)
                          app.info("Das Ticket (#"+data.id+") wurde freigegeben");
                          admin.cache.tickets[data.id].log = data.logmsg+admin.cache.tickets[data.id].log;
                          admin.cache.tickets[data.id].supportid = null;

                          if($("#admin-detail div").data("ticketid") == data.id) // Wenn das Ticket geöffnet ist
                            admin.part.ticket.displayDetails(data.id); // aktualisiere Daten


                    } else if(isCurrentAdmin) app.alert("Das Ticket (#"+data.id+") konnte nicht freigegeben werden");
            }  else if(data.subtype == "saveHidden"){
                    if(data.adminid == user.data.id){
                      if(data.succeed)
                      app.info("Die Adminnotiz wurde erfolgreich gespeichert.");
                      else app.alert("Die Adminnotiz konnte nicht gespeichert werden.");
                    }
                    if(data.succeed){
                      admin.cache.tickets[data.id].log = data.logmsg+admin.cache.tickets[data.id].log;
                      admin.cache.tickets[data.id].hidden = data.note;

                      if($("#admin-detail div").data("ticketid") == data.id) // Wenn das Ticket geöffnet ist
                        admin.part.ticket.displayDetails(data.id); // aktualisiere Daten
                    }
            }
        }
    },
    cache : { // Datenablage
        "users" : null,
        "tickets" : null
    },
    part : {
        "user" : {
            rank : 5,
            label : "Benutzer",
            init : function(){ // Jedes init wird nach Login durch einen Berechtigten aufgerufen
                $('.admin-user-detailBtn').initialize(function(){
                    console.log("Bin da");

                    $(this).replaceWith(admin.part.user.button.$details.clone({withDataAndEvents : true}).data("userid",$(this).attr("data-userid")));
                });
            },
            click : function(){ // Fordere Nutzerdaten an
                if(admin.cache.users == null)
                server.send("admin",{type : "user", "subtype" : "get", id: 0});
                else admin.part.user.displayAll(admin.cache.users);
            },
            displayAll : function(data){
                var $t = $("<table />",{"id" : "usertable", "class" : "ui-body-b table-stripe ui-responsive ui-filterable", "data-mode" : "columntoggle", "data-filter" : "true", "data-input" : "#input-userTableFilter", "data-role" : "table", "data-column-btn-text" : "Filtern", "data-column-btn-theme" : "b", "data-column-popup-theme" : "b"}); // ,
                var $toprow = $("<thead />")
                            .html($("<tr />",{"class" : "ui-bar-b"}).html(
                            $("<th />",{text: "R", "data-priority" : 5})
                            .add($("<th />",{"data-priority" : 1,text : "ID"}))
                            .add($("<th />",{text : "Matr.-Nr.", "data-priority" : 4}))
                            .add($("<th />", {"data-priority" : 3, text : "Vorname"}))
                            .add($("<th />", {"data-priority" : 2, text : "Nachname"}))
                            .add($("<th />", {text : "Aktion"}))));
                var $tb = $("<tbody />");
                for(i in data){
                    $tb.append($("<tr />").data("userid",i).html($("<td />", {text : data[i].rank})
                            .add($("<td />", {text : data[i].id}))
                            .add($("<td />", {text : data[i].matnr}))
                            .add($("<td />", {text : data[i].forename}))
                            .add($("<td />", {text : data[i].surname}))
                            .add($("<td />").html($("<button />",{"class" : "admin-user-detailBtn", "data-userid" : data[i].id})))
                            ));
                    $t.html($toprow.add($tb));
                }
                var $c = $("#admin-overview").html("Benutzerverwaltung");

                var $f = $("<form />");//.submit(function(){return false});
                $f.appendTo($c).find("input");
                 $f=$("<input>",{"type" : "text", "data-type" : "search", "id": "input-userTableFilter"}).appendTo($f).textinput();

                //$f.table().appendTo($c);
                $t.appendTo($c).filterable().table();

            },
            displayDetails : function(uid){
                    $("#admin-overview").hide();
                    $("#admin-backbutton").show();

                    var u = admin.cache.users[uid];

                    var $activated = $("<select />",{name : "activated", id : "admin-userActivated"}).html($("<option>",{value : 0, text : "Deaktiviert"})
                    .add($("<option>",{value : 1, text : "Aktiviert"})))
                    .val(u.activated)
                    .textinput();

                    $field = $("<div />",{"class" : "ui-field-contain"});
                    $form = $("<form />").submit(function(){
                        var obj = formArrToObj(this);
                        var updateobj = getChangeObj(obj,u);
                        app.confirm("Folgende Werte sollen geändert werden?<br><textarea style='width:100%;height:200px;' readonly>"+JSON.stringify(updateobj,null,2)+"</textarea>",function(r){
                            if(r) alert("Sender zum Server");
                        })

                    return false;
                    })



                    var $c = $("<div />").css("margin","auto").width(300)
                            .append($("<b />",{text : "Benutzer #"+u.id}))
                            .append("&nbsp;&nbsp;")
                            .append($("<button />",{text: "Zum Profil"}).click(function(){
                                user.gotoProfile(u.id);
                            }))
                            .append("<br>")
                            .append("<b>Matrikelnummer:</b> &nbsp; "+u.matnr+"<br>")
                            .append($form
                                .append($field.clone().append($("<label />",{"for" : "admin-userActivated", "text" : "Status "}).append($activated)))
                                .append($field.clone().append($("<span />",{"text" : "Vorname / Nachname"})).append("<br />")
                                    .append($("<input>",{type : "text", name : "forename", value : u.forename}).textinput().width("45%"))
                                    .append(" / ")
                                    .append($("<input>",{type : "text", name: "surname", value: "text", value : u.surname }).width("45%"))
                                )
                                .append($field.clone().append($("<span />",{"text" : "Straße / Hausnummer"})).append("<br />")
                                    .append($("<input>",{type : "text", name: "street", value : u.street}).width("70%"))
                                    .append(" / ")
                                    .append($("<input>",{type : "text", name : "housenumber", size : 2, value : u.housenumber}).width("20%"))
                                )
                                .append($field.clone()

                                )
                                .append($("<input>",{type : "submit", value : "Benutzer bearbeiten"}).addClass("ui-btn"))
                            )


                     $("#admin-detail").html($c).show();



            },
            button : {
                "$details" : $("<button />",{text : "Details"}).click(function(){
                    console.log($(this).data("userid"));
                    admin.part.user.displayDetails($(this).data("userid"));
                    //$(this).prop("disabled",true);
                })
            }

        },
        "ticket" : {
            rank : 2,
            label : "Tickets",
            init : function(){
                if(admin.cache.tickets == null)
                server.send("admin",{type : "ticket", "subtype" : "get", id: 0});

            },
            click : function(){
                admin.part.ticket.displayAll(admin.cache.tickets);
            },
            displayAll : function(data){
                $("#admin-detail").hide();

                console.log("Admin: Zeige alle offenen Tickets");
                $toprow = $("<thead />").html($("<tr />").html($("<th />",{text : "ID"})
                            .add($("<th />",{text : "U-ID"}))
                            .add($("<th />",{text : "Titel", "data-priority" : 1}))
                            .add($("<th />",{text : "Vorname", "data-priority" : 3}))
                            .add($("<th />",{text : "Nachname", "data-priority" : 2}))
                            .add($("<th />",{text : "Aktion"}))));
                $t = $("<table />",{"class" : "ui-body-b table-stripe ui-responsive", "data-role" : "table", "data-mode" :"columntoggle", "data-column-btn-text" : "Filtern", "data-column-btn-theme" : "a"}).html($toprow);
                $tb = $("<tbody />");

                for(i in data){
                    $r = $("<tr />").data("ticketid",i).html($("<th />", {text : data[i].id})
                            .add($("<td />", {text : data[i].userid}))
                            .add($("<td />", {text : shortenString(data[i].subject,8)}))
                            .add($("<td />", {text : data[i].forename}))
                            .add($("<td />", {text : data[i].surname}))
                            .add($("<td />").html($("<button />",{"data-role" : "none", text : "Details"}).data("ticketid",i).click(function(){
                                admin.part.ticket.displayDetails($(this).data("ticketid"));
                            })))
                            )
                            .appendTo($tb);
                    $t.append($tb);
                }
                $t.appendTo($("#admin-overview").show().html("Ticketverwaltung")).table();
             },
            displayDetails : function(tid){
                    $("#admin-overview").hide();
                    $("#admin-backbutton").show();

                    var t = admin.cache.tickets[tid];

                    var $actionBtn = ((t.supportid == user.data.id) ? (admin.part.ticket.button.$release.clone({withDataAndEvents : true})) : ((t.supportid == null) ? (admin.part.ticket.button.$take.clone({withDataAndEvents : true})) : "(In Bearbeitung)") );

                    var $c = $("<div />").data("ticketid",t.id)
                            .append($("<b />",{text : "Ticket #"+t.id}))
                            .append("&nbsp;")
                            .append($actionBtn)
                            .append("<br>")
                            .append("<b>Titel:</b> ")
                            .append($("<input>",{type : "text", value : t.subject}).prop("readonly",true))
                            .append("<br><b>Typ:</b> "+db.support.ticket.type[t.type])
                            .append("<hr>")
                            .append($("<textarea />",{rows: 5, text : t.content}).width("100%").prop("readonly",true))
                            .append("<b>Ticket-Ersteller:</b> "+t.forename+" "+t.surname)
                            .append("<br>")
                            .append($("<button />",{text: "Zum Profil"}).click(function(){
                                user.gotoProfile(t.userid);
                            }))
                            .append("<hr>")
                            .append("<b>Notiz</b> (Nur f&uuml;r Admins sichtbar)")
                            .append($("<textarea />",{rows : 8, text : t.hidden}).width("100%"))
                            .append($("<button />",{text: "Notiz speichern"}).click(function(){
                                admin.part.ticket.actions.saveHidden($(this).parent().data("ticketid"),$(this).prev().val())
                            }))
                            .append("<br><b>Log</b>")
                            .append($("<textarea />",{rows : 8, text : t.log}).css("fontSize","8pt").width("100%").prop("readonly",true));

                    var picarr = JSON.parse("["+t.pictures+"]");
                    for(var i=0;i<picarr.length;i++) $c.append($("<img>",{src : config.socketurl+"/pic/"+picarr[i]+"/"+user.data.id+"/"+socket.id}))


                     $("#admin-detail").html($c).show();



            },
            button : {
                "$take" : $("<button />",{text : "Annehmen"}).click(function(){
                    admin.part.ticket.actions.take($(this).parent().data("ticketid"));
                    $(this).prop("disabled",true);
                }),
                "$release" : $("<button />",{text : "Freigeben"}).click(function(){
                    admin.part.ticket.actions.release($(this).parent().data("ticketid"));
                    $(this).prop("disabled",true);
                })
            },
            display : function(ticketid){

            },
            actions : {
                "take" : function(ticketid){
                    server.send("admin",{type : "ticket", subtype : "take", id: ticketid});
                },
                "release" : function(ticketid){
                    server.send("admin",{type : "ticket", subtype : "release", id: ticketid});
                },
                "close" : function(ticketid){
                    server.send("admin",{type : "ticket", subtype : "close", id: ticketid});
                },
                "saveHidden" : function(ticketid,content){
                    server.send("admin",{type : "ticket", subtype : "saveHidden", id: ticketid, content : content});
                },
            }
        }
    }
}
