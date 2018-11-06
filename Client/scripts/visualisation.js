var visualisation = {
    fillUserData : function(ids){
        console.log("Fülle Daten für User-ID(s) #",ids);
        if(typeof ids != "object") ids = [parseInt(ids)];

        for(var i=0;i<ids.length;i++){
            var id = parseInt(ids[i]);
            var data = memory.getUser(id);
            if(data == null) memory.request('user', id);
            else {
                console.log("Fülle alle Felder mit User-ID #"+id);
                var $u = $(".fillable-user[data-userid="+id+"]");
                $u.each(function(){
                    visualisation.fillUserFields($(this));
                })

            }
        }
    },
    fillBikeData : function(ids){
        console.log("Fülle Daten für Bike-ID(s) #",ids);
        if(typeof ids != "object") ids = [parseInt(ids)];

        for(var i=0;i<ids.length;i++){
            var id = parseInt(ids[i]);
            var data = memory.getBike(id);
            if(data == null) memory.request('bike', id);
            else {
                console.log("Fülle alle Felder mit Bike-ID #"+id);
                var $u = $(".fillable-bike[data-bikeid="+id+"]");
                $u.each(function(){
                    visualisation.fillBikeFields($(this));
                })

            }
        }
    },
    fillUserFields : function($d){

        console.log("FÜLLE USER-FELDER IN ",$d);
        var id = parseInt($d.attr("data-userid"));
        var userpics = config.userpicsPath+id;
        var u = memory.getUser(id);
        if(u == null){
            visualisation.fillUserData(id);
            return;
        }

        $d.find("*[data-fillitem=name]").text(u.name);
        $d.find("*[data-fillitem=address]").text(u.street+", "+u.city);
        $d.find("*[data-fillitem=pic]").each(function(){
            var $newpic = $(this).clone();
            $(this).replaceWith($newpic.addClass("userpic").attr("data-userid",id))
        });

        $d.find("*[data-fillitem=rating]").rating({val : u.rating});
        $d.find("*[data-fillitem=ratingcount]:first").text(u.ratingcount);
        $d.find("*[data-fillitem=city]").text(u.city);
        $d.find("*[data-fillitem=responsetime]").text(secondsToShorterUnit(u.responsetime));
        $d.find("*[data-fillitem=type]").text("Benutzer");
        $d.find("*[data-fillitem=mail]").replaceWith(
            $("<button />",{"class" : "cui-btn-medium ui-btn ui-btn-b ui-corner-all"})
            .append('<img src="images/icons/mail.svg" style="height:30px;" alt="" /> <span>Mail</span>')
            .click(
            function(id){
                return function(){
                    chat.startConversation(id);
                }
            }(id))
            );
        $d.find("*[data-fillitem=hasbike]").toggle(u.bikeid > 0);
        $d.find("*[data-fillitem=hasnobike]").toggle(u.bikeid == 0);

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        console.log("FILLPROP ",$fillprop)

        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            user.gotoProfile(u.id);
        });

        $d.find("*[data-fillprop-openpic=true]").off("click").click(function(){
            app.info($("<img />",{src : userpics}).width("100%"))
        });

    },
    fillSponsorFields : function($d){
        console.log("FÜLLE Sponsor-FELDER IN ",$d);
        var id = parseInt($d.attr("data-sponsorid"));
        var s = memory.getSponsor(id);
        var sponsorpics = config.sponsorpicsPath+id+"/";


        $d.find("*[data-fillitem=name]").text(s.name);
        $d.find("*[data-fillitem=banner]").html($("<img />",{src: sponsorpics+"banner"}));
        $d.find("*[data-fillitem=url]").text(s.url);
        $d.find("*[data-fillitem=html]").html(s.html);

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            visualisation.applySponsorProfile(id);
            app.changePage("sponsorprofile");
        });
        $d.find("*[data-fillprop-elink=true]").click(function(){
            window.open(s.url, '_system');
        });
        return $d;

    },
    fillBikeFields : function($d){
        console.log("FÜLLE BIKE-FELDER IN ",$d);
        var id = parseInt($d.attr("data-bikeid"));
        var b = memory.getBike(id);
        var bikepics = config.bikepicsPath+id+"/";
        var sponsorpics = config.sponsorpicsPath+b.sponsorid+"/";


        if(b == null){
            visualisation.fillBikeData(id);
            return;
        }

        $d.find("*[data-fillitem=name]").text(b.name);
        $d.find("*[data-fillitem=pic]").addClass("bikepic").css("backgroundImage","url('"+bikepics+"thumb')");

        $d.find("*[data-fillitem=type]").text(memory.biketypes[b.type]);
        $d.find("*[data-fillitem=desc]").html($("<b />",{text: b.name})).append("<br>").append($("<span />", {text : b.frame+"\" "+memory.biketypes[b.type]}));
        $d.find("*[data-fillitem=sponsorbanner]").html($("<img />",{src: sponsorpics+"banner"})).click(function(){
            visualisation.applySponsorProfile(b.sponsorid);
            app.changePage("sponsorprofile");
        }); // TODO : Hier könnte ein sponsorfill zum preload hin

        $d.find("*[data-fillprop-openpic=true]").off("click").click(function(){
            app.info($("<img />",{src : bikepics+"profile"}).width("100%"))
        });

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            visualisation.applyBikeProfile(id);
            app.changePage("bikeprofile");
        });
        return $d;
    },
    fillStationFields : function($d){
        console.log("FÜLLE STATION-FELDER IN ",$d);
        var id = parseInt($d.attr("data-stationid"));
        var s = memory.getStation(id);
        var stationpics = config.stationpicsPath+id+"/";

        if(s == null){
            visualisation.fillStationData(id); // TODO
            return;
        }

        $d.find("*[data-fillitem=name]").text(s.name);
        $d.find("*[data-fillitem=pic]").addClass("stationpic").css("backgroundImage","url('"+stationpics+"thumb')");
        $d.find("*[data-fillitem=type]").text("Station");
        $d.find("*[data-fillitem=desc]").html(s.desc);
        $d.find("*[data-fillitem=address]").text(s.street+", "+s.city);
        $d.find("*[data-fillitem=city]").text(s.city);

        $d.find("*[data-fillprop-openpic=true]").off("click").click(function(){
            app.info($("<img />",{src : stationpics+"profile"}).width("100%"))
        });

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            visualisation.applyStationProfile(id);
            app.changePage("stationprofile");
        });
        return $d;
    },
    fillRepairFields : function($d){
        console.log("FÜLLE REPAIR-FELDER IN ",$d);
        var id = parseInt($d.attr("data-repairid"));
        var r = memory.getRepair(id);
        var repairpics = config.repairpicsPath+id+"/";

        if(r == null){
            visualisation.fillRepairData(id); // TODO
            return;
        }

        $d.find("*[data-fillitem=name]").text(r.name);
        $d.find("*[data-fillitem=pic]").addClass("repairpic").css("backgroundImage","url('"+repairpics+"thumb')");
        $d.find("*[data-fillitem=type]").text("Werkstatt");
        $d.find("*[data-fillitem=desc]").html(r.desc);
        $d.find("*[data-fillitem=address]").text(r.street+", "+r.city);
        $d.find("*[data-fillitem=city]").text(r.city);

        $d.find("*[data-fillprop-openpic=true]").off("click").click(function(){
            app.info($("<img />",{src : repairpics+"profile"}).width("100%"))
        });

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            visualisation.applyRepairProfile(id);
            app.changePage("repairprofile");
        });
        return $d;
    },
    fillChargeFields : function($d){
        console.log("FÜLLE CHARGE-FELDER IN ",$d);
        var id = parseInt($d.attr("data-chargeid"));
        var c = memory.getCharge(id);
        var chargepics = config.chargepicsPath+id+"/";

        if(c == null){
            alert("Charge #"+id+" nicht vorhanden");
            return;
        }

        $d.find("*[data-fillitem=name]").text(c.name);
        $d.find("*[data-fillitem=pic]").addClass("chargepic").css("backgroundImage","url('"+chargepics+"thumb')");
        $d.find("*[data-fillitem=type]").text("Ladestation");
        $d.find("*[data-fillitem=desc]").html(c.desc);
        $d.find("*[data-fillitem=address]").text(c.street+", "+c.city);
        $d.find("*[data-fillitem=city]").text(c.city);

        $d.find("*[data-fillprop-openpic=true]").off("click").click(function(){
            app.info($("<img />",{src : chargepics+"profile"}).width("100%"))
        });

        var $fillprop = ($d.attr("data-fillprop-link") == "true") ? $d : $();
        $d.find("*[data-fillprop-link=true]").add($fillprop).click(function(){
            visualisation.applyChargeProfile(id);
            app.changePage("chargeprofile");
        });
        return $d;
    },
    refreshUserPic : function(userid){
        $(".userpic[data-userid="+userid+"] ,.chat-userpic[data-userid="+userid+"]").css("backgroundImage", "url('"+config.userpicsPath+userid+"."+Date.now()+"')");
    },
    generateBikeList : function(holderid,holdertype){
        if(typeof holderid == "undefined" || typeof holdertype == "undefined"){
            holderid=0;
            holdertype=0;
            }

        var $ul = $("<ul />",{"class" : "bikelist"});

        for(var i in memory.bikes){
            var b = memory.bikes[i];
            if(holderid == 0 || (holderid == b.holderid && holdertype == b.holdertype)){
            var $li = $("<li />").click(function(bid){
            return function(){
                visualisation.applyBikeProfile(bid);
                app.changePage("bikeprofile");
            }
            }(b.id));
           var $pic = $("<div />",{"class" : "bikelist-pic"}).css("backgroundImage", "url('"+config.bikepicsPath+b.id+"/thumb')").appendTo($li);
           var $desc = $("<div />",{"class" : "bikelist-desc"}).html($("<b />").html(b.name)).append("<br>"+b.frame+"&quot; "+memory.biketypes[1]).appendTo($li);
           var $end = $("<div />",{"class" : "bikelist-end"}).appendTo($li);
           $li.appendTo($ul);
           }
        }
        return $ul;
    },
    applyUserProfile : function(userid){
        console.log("Generiere Userprofil #"+userid);
        var u = memory.getUser(userid);
        var $profile = $("<div />",{"class" : "fillable-user", "data-userid" : userid})
        .append($("<div />",{"data-fillitem" : "pic", "data-fillprop-openpic" : "true"}))
        .append("<br>")
        .append($("<b />", {"data-fillitem" : "name"}))
        .append("<br>")
        .append($("<div />",{"data-fillitem" : "rating"}))
        .append('<sup>(<span data-fillitem="ratingcount"></span>)</sup>')
        .append(
            $("<table />",{"class" : "profiletable"})
                .append($("<tr />").append($("<td />",{text : "Wohnort:"})).append($("<td />",{"data-fillitem" : "city"})))
                .append($("<tr />").append($("<td />",{text : "Antw.Zeit:"})).append($("<td />",{"data-fillitem" : "responsetime"})))
//                .append("<tr />").append("<td />",{text : "Profile:"}).append("<td />",{"data-fillitem" : "profiles"})
        );

            var $bikebox = $("<b />",{text : "Kein Bike geliehen"}).css("margin","auto");
            if(u.bikeid > 0)
            $bikebox = visualisation.fillBikeFields($("<div />", {"class" : "fillable-bike", "data-fillprop-link" : "true", "data-bikeid" : u.bikeid})
            .css("display","flex")
            .append($("<div />",{"data-fillitem" : "pic"}))
            .append($("<div />")
                .append(
                        $("<b />",{"data-fillitem" : "name"})
                        .add("<br>")
                        .add($("<span />",{"data-fillitem" : "type"}))
                )
            ));

            $(".userprofile").html(((user.data.id == userid) ? $profile : $profile.append($("<div />",{"data-fillitem" : "mail"})))).append("Leiht sich zur Zeit...").append($("<div />",{"class" : "userprofile-bike"}).append($bikebox));

    },
    applyBikeProfile : function(bikeid){
        console.log(bikeid);
        var b = memory.getBike(bikeid);
        if(b == null) return false;
        var bikepics = config.bikepicsPath+bikeid+"/";

        var bprops = JSON.parse(b.properties);

        var $b = visualisation.fillBikeFields($("#bikeprofile").attr("data-bikeid",bikeid));
        $b.find(".ui-title").html(b.name);

        var $bpics = $b.find(".bikeprofile-pics").empty();
        for(var i=1;i<=3;i++){
            var $bp = $("<div />",{"class" : "bikeprofile"})
            .css("backgroundImage","url('"+bikepics+"thumb_"+i+"')")
            .off("click").click(function(){
            app.info($("<img />",{src : bikepics+i}).width("100%"))
        })
        if(i == 1) $bp.css("marginRight","auto");
        else if(i == 3) $bp.css("marginLeft","auto");
            $bpics.append($bp);
        }

        var $bprops = $b.find(".bikeprofile-props").empty();
        $bprops.append($("<tr />").append($("<td />",{colspan : 2, text : "Eigenschaften"})));
        for(var k in bprops){
            $bprops.append(
            $("<tr />").append($("<td />",{text : k})).append($("<td />",{text : bprops[k]}))
            );
        }

        var $bholder = $b.find(".bikeprofile-holder");
        if(b.holdertype == 0) // USER
        var $bholderbox = $("<div />", {"class" : "fillable-user", "data-fillprop-link" : "true", "data-userid" : b.holderid}).css("display","flex");
        if(b.holdertype == 1) // STATION TODO
        var $bholderbox = $("<div />", {"class" : "fillable-station", "data-fillprop-link" : "true", "data-stationid" : b.holderid}).css("display","flex");
        if(b.holdertype == 2) // REPAIR TODO
        var $bholderbox = $("<div />", {"class" : "fillable-repair", "data-fillprop-link" : "true", "data-repairid" : b.holderid}).css("display","flex");


        $bholderbox
        .append($("<div />",{"data-fillitem" : "pic"}))
        .append($("<div />")
            .append(
                    $("<b />",{"data-fillitem" : "name"})
                    .add("<br>")
                    .add($("<span />",{"data-fillitem" : "type"}))
                    .add("<br>")
                    .add($("<span />",{"data-fillitem" : "city"}))
            )
        );

        $bholder.html($bholderbox)

    },
    applyStationProfile : function(stationid){
        console.log(stationid);
        var s = memory.getStation(stationid);
        if(s == null) return false;
        var stationpics = config.stationpicsPath+stationid+"/";


        var $s = visualisation.fillStationFields($("#stationprofile").attr("data-stationid", stationid));
        $s.find(".ui-title").html(s.name);
        var $spbikes = $s.find(".stationprofile-bikes");
        $spbikes.html($("<span />",{text : "Es befinden sich "+s.bikes+" Bikes in dieser Station"}));
        if(s.bikes > 0) $spbikes.append($("<button />",{"class" : "cui-btn-medium ui-btn ui-btn-a ui-corner-all", text : "Bikes anzeigen"}).click(function(){
            $("#filteredbikes .ui-title").text(s.name);
            $("#filteredbikes").find("div[data-role=content]").html(visualisation.generateBikeList(stationid,1));
            app.changePage("filteredbikes");
        }));


    },
    applyChargeProfile : function(chargeid){
        var c = memory.getCharge(chargeid);
        if(c == null) return false;

        var $c = visualisation.fillChargeFields($("#chargeprofile").attr("data-chargeid", chargeid));
        $c.find(".ui-title").html(c.name);

    },
    applySponsorProfile : function(sponsorid){
        var s = memory.getSponsor(sponsorid);
        var $d = visualisation.fillSponsorFields($("#sponsorprofile").attr("data-sponsorid",sponsorid));
        $d.find(".ui-title").html(s.name);
    },
    applyRepairProfile : function(repairid){
        var r = memory.getRepair(repairid);
        var $d = visualisation.fillRepairFields($("#repairprofile").attr("data-repairid",repairid));
        $d.find(".ui-title").html(r.name);

        var $bikes = $d.find(".repairprofile-bikes");
        $bikes.html($("<span />",{text : "Es befinden sich "+r.bikes+" Bikes in dieser Werkstatt"}));
        if(r.bikes > 0) $bikes.append($("<button />",{"class" : "cui-btn-medium ui-btn ui-btn-a ui-corner-all", text : "Bikes anzeigen"}).click(function(){
            $("#filteredbikes .ui-title").text(r.name);
            $("#filteredbikes").find("div[data-role=content]").html(visualisation.generateBikeList(repairid,2));

            app.changePage("filteredbikes");
        }));
    }
};