/* Informationen und Funktionen zur Karte unter Menüpunkt Suche */

var map = {
    $dom : null, // DOM-Element als jQuery-Object der Karte
    filter : { // Standardkonfiguration des Filters der Karte
      bike : true,
      charge : true,
      repair : false,
      station : true
    },
    init : function(){ // Initialisiere Karte
        console.log("Load Map...");
            this.$dom = $("#map");
            map.initFilterPanel();
            map.initSuggestions();
            map.initPins();

            this.$dom.geomap({ // Bilde widget "geomap"
                  zoom : 18,
                  center: [currentLocation.lon, currentLocation.lat], // Zentriere auf Koordinaten
                  tilingScheme: {
                  tileWidth: 256,
                  tileHeight: 256,
                  levels: 20,
                  basePixelSize: 156543.03392799936,
                  pixelSizes: null,
                  origin: [ -20037508.342787, 20037508.342787 ]
                }
            });

            map.addPins(); // Füge Pins der Karte hinzu

            this.getCurrentLocation(function(){ // Ermittle aktuelle Position und führe Aktionen aus. Koordinaten werden nicht übergeben, da global gespeichert.
                map.$dom.geomap("option","center",[currentLocation.lon, currentLocation.lat]);
            });

    },
    initPins : function(){ // Initialisiere Pin-Events
        console.log("Initialisiere Map-Pins");
        $(document)
        .on("click touchend",".mappin-bike",function(){
            map.applyBikeInfo($(this).data("bikeid"));
            //server.send("bikeinfo",$(this).data("bikeid"));
            $("#map-bikeinfo")
            .show()
            .outside("click touchend",function(){
            $(this).hide();
            });
        })
        .on("click touchend",".mappin-station",function(){ // Füge Tap/Klick Event der Service-Stationen hinzu
            map.applyStationInfo($(this).data("stationid"));
        })
        .on("click touchend",".mappin-charge",function(){ // Füge Tap/Klick Event der Lade-Stationen hinzu
            map.applyChargeInfo($(this).data("chargeid"));
        })
        .on("click touchend",".mappin-repair",function(){ // Füge Tap/Klick Event der Werkstätte hinzu
            map.applyRepairInfo($(this).data("repairid"));

        });

        $(".mappin").initialize(function(){ // Jedes mal wenn ein Pin neu in die DOM-Struktur gefügt wird (bspw. erneut ins Sichtfeld kommt)
            if(!map.filter[$(this).data("pintype")]) $(this).addClass("invisible"); // Falls diese rasugefiltert wird, mache ihn unsichtbar
        });

        $("#map-bikeinfo").on("click",".arrowicon-up",function(){ // Erweiterte Fahrradinformation aufklappen
            $(this).removeClass("arrowicon-up").addClass("arrowicon-down");
           $("#map-bikeinfo-bottom").show();
        })
        .on("click",".arrowicon-down",function(){ // Erweiterte Fahrradinformation zuklappen
            $(this).removeClass("arrowicon-down").addClass("arrowicon-up");
           $("#map-bikeinfo-bottom").hide();
        });

    },
    addPins : function(){ // Füge Pins der Karte hinzu
        console.log("Setze Pins auf die Map");
            map.$dom.geomap("empty"); // Leere Karte

            var bikes = memory.bikes;
            var charges = memory.charges;
            var repairs = memory.repairs;
            var stations = memory.stations;

            /* Interiere über alle Pins und füge sie hinzu */

            for(var i in bikes)
                if(bikes[i].holdertype == 0) // Bei einem User
               map.$dom.geomap("append",{ type: "Point", coordinates: [bikes[i].lon,bikes[i].lat]}, '<div class="mappin-bike mappin" data-pintype="bike" data-bikeid="'+i+'"></div>');

            for(var i in charges)
               map.$dom.geomap("append",{ type: "Point", coordinates: [charges[i].lon,charges[i].lat]}, '<div class="mappin-charge mappin" data-pintype="charge" data-chargeid="'+i+'"></div>');

            for(var i in repairs)
               map.$dom.geomap("append",{ type: "Point", coordinates: [repairs[i].lon,repairs[i].lat]}, '<div class="mappin-repair mappin" data-pintype="repair" data-repairid="'+i+'"></div>');

            for(var i in stations)
               map.$dom.geomap("append",{ type: "Point", coordinates: [stations[i].lon,stations[i].lat]}, '<div class="mappin-station mappin" data-pintype="station" data-stationid="'+i+'"></div>');

    },
    applyFilter : function(){ // Wende Filter an
        for(var f in map.filter){
            var $e = $(".mappin-"+f);
            if(map.filter[f]){
                $e.removeClass("invisible");
            } else $e.addClass("invisible");
        }
    },
    applyStationInfo : function(id){ // Wende Service-Station-Infos an
            visualisation
            .fillStationFields($("#map-stationinfo").attr("data-stationid",id).addClass("fillable-station"))
            .show()
            .outside("click touchend",function(){
            $(this).hide();
            });
    },
    applyChargeInfo : function(id){ // Wende lade-Station-Infos an
            visualisation
            .fillChargeFields($("#map-chargeinfo").attr("data-chargeid",id).addClass("fillable-charge"))
            .show()
            .outside("click touchend",function(){
            $(this).hide();
            });
    },
    applyRepairInfo : function(id){ // Wende Werkstatt-Infos an
            visualisation
            .fillRepairFields($("#map-repairinfo").attr("data-repairid",id).addClass("fillable-repair"))
            .show()
            .outside("click touchend",function(){
            $(this).hide();
            });
    },
    applyBikeInfo : function(bikeid){ // Wende Fahrrad-Infos an
        console.log("APPLYBIKEINFO: #"+bikeid);
        var b = memory.bikes[bikeid];
        var days = Math.floor(((new Date()).getTime()-new Date(b.timestamp).getTime())/(1000*3600*24));

        var availdate = new Date(), // Aktueller Tag
        availdays = config.biketime-days, // Errechne in wievielen Tagen das Rad verfügbar ist
        progress = days/config.biketime; // (Geliehen)/(Maximale Dauer)
        availdate.setDate(availdate.getDate()+availdays); // Errechne Verfügbarkeitsdatum
        var color;

        if(progress <= 0.2) color = "ee0000"; // Wenn 1/5 der Zeit um ist: rot
        else if(progress < 1) color = "ffde00"; // Wenn weniger als die Maximaldauer vorrüber ist: gelb
        else color = "97be09"; // Sonst grün (Verpflichtet das Rad abzugeben)

        var $i = $("#map-bikeinfo");
        /* Fülle die Informationsanzeige */
        $i.find(".map-info-location").html($("<span />",{"data-fillitem" : "address"}));
        $i.find("div[data-subject=point]").css("backgroundColor","#"+color);

        $i.find("span[data-subject=id]").html(b.id);
        $i.find("span[data-subject=frame]").html(b.frame);
        $i.find("span[data-subject=days]").css("color","#"+color).html(days+" Tage");
        if(availdays > 0)
        $i.find("span[data-subject=available]").html(availdate.getFormatedDate());
        else
        $i.find("span[data-subject=available]").html("sofort");

        $i.find("button").off("click").click(function(){ // Gib dem Mail-Button seine Funktion
            chat.startConversation(b.holderid);
        });
        $i.removeClass("fillable-user").attr("data-userid",b.holderid).addClass("fillable-user");
        visualisation.fillUserFields($i);

    },
    initSuggestions : function(){ // Verleihe dem Suchfeld die Autocomplete-Funktion
        $("#map-input").addresscomplete({
            target : $("#map-sugg"),
            map : $("#map")
        });
    },
    initFilterPanel : function(){ // Initialisiere Anzeige der Filter-Icons
        $(".filtericon").each(function(){
           var $i = $(this);
           var i = $i.data("fitem");
           $i.click(function(){
                map.filter[i] = !map.filter[i];
                map.refreshFilterPanel();
                map.applyFilter();
           }
           );
        });
        this.refreshFilterPanel();
    },
    refreshFilterPanel : function(){ // Aktualisiere Anzeige der Filter-Icons
        $(".filtericon").each(function(){
           var $i = $(this);
           var i = $i.data("fitem");
           $i.css({
              background : "url(images/icons/pin_"+i+"_"+((map.filter[i]) ? "active" : "inactive")+".svg) no-repeat",
              color : "#"+((map.filter[i]) ? "000" : "c0c0c0")
           })
        });
    },
    getCurrentLocation : function(cb){ // Ermittle aktuellen Standort und rufe bei Erfolg Funktion auf
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (p) {
          currentLocation.lon = p.coords.longitude;
          currentLocation.lat = p.coords.latitude;
          cb();
        },function(error){
            var msg = "";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    msg = "Position durch den Benutzer verweigert."
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = "Positionsinformationen unerreichbar."
                    break;
                case error.TIMEOUT:
                    msg = "Die Anfrage der Positionsdaten dauert zu lange."
                    break;
                case error.UNKNOWN_ERROR:
                    msg = "Ein unbekannter Fehler bei der Positionsbestimmung ist aufgetreten."
                    break;
            }
            //console.log("Fehler beim Lesen der aktuellen Position.\nFehlercode: "+error.code+"\n"+msg);
            app.alert("Fehler beim Lesen der aktuellen Position.\nFehlercode: "+error.code+"\n"+msg);
        },{enableHighAccuracy: true})
        } else cb();
    }
}