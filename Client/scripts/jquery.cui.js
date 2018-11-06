/* Die Widgets in dieser Datei sind abhängig von croppie, geomap und outside und
voneinander, weshalb sie alle zusammen in dieser einen Datei stehen
cui = Custom User Interface, zur Vermeidung von jQuery UI */

/* Widget Dialog - Zeige ein Fenster mit Auswahlmöglichkeiten */
(function($){

$.widget("custom.dialog",{
    options : { // Standardeinstellungen
        values : [{
            content : "OK",
            value : true
        }],
        desc : null,
        choose : function(value){ // Wenn Option gewählt wird
            console.log(value);
        },
        modal : false,
        showOnInit : false,
        closeOnChoose : true

    },
    _create : function(){ // Kreiere
        //console.log("Dialog widget");
        var self = this;

        var content = self.element.html();

        var $box = $("<div />",{"class" : "cui-dialog-box"}).html($("<div />",{"class" : "cui-dialog-desc"}).html((this.options.desc == null) ? content : this.options.desc));
        var $opts = $("<ul />",{"class" : "cui-dialog-options"});
        var vals = this.options.values;

        for(var i=0;i<vals.length;i++){
            $opts.append($("<li />").click(function(self,val){
                return function(){
                self.options.choose(val.value);
                if(self.options.closeOnChoose)
                self.close();
            }
            }(self,vals[i])).html(vals[i].content));
        }

        this.element.addClass("cui-dialog").html($("<div />",{"class" : "cui-dialog-layer"})).append($box.append($opts));

        var $layer = this.element.find(".cui-dialog-layer");
        if(!this.options.modal)
        $layer.on("click",function(){
           self.close();
        });

        if(this.options.showOnInit)
        this.open();

    },
    option : function(obj){
        for(var key in obj){
            this.options[key] = obj[key];
        }
        this._refresh();
    },
    _refresh : function(){
        this.element.find(".cui-dialog-desc").html(this.options.desc);
    },

    open : function(){
        this.element.css("display","flex");
        if(!this.element.hasClass("cui-dialog-opened"))
            this.element.addClass("cui-dialog-opened");
        this.element.parent().append(this.element);
    },
    close : function(){
        console.log("Close dialog");
        this.element.removeClass("cui-dialog-opened");
        this.element.hide();
    }
});

/* Photopicker Widget - Schneide Bild zu*/

$.widget("custom.photopicker",{
    options : {
        submit : function(val){

        },
        isContainer : true,
        dialogId : "dialog-croppie",
        maxWidth : 1280,
        maxHeight : 1024,
        viewport : {
            width: 200,
            height: 200,
            type: 'square'
        },
        boundary : {
            width: 250,
            height: 250
        },
        enableExif : false,
        enableResize : false,
        size : "viewport",
        type : "base64"
    },
    _create : function(){
        //console.log("Photopicker widget");
        var self = this;
        console.log(self.options);

         var $d = $("#"+self.options.dialogId);

         $d.dialog({
                   modal: false,
                   values : [{
                        content : "Best&auml;tigen",
                        value : true
                   },{
                        content : "Abbrechen",
                        value : false
                   }],
                   desc : $("<form />")
                   .append(
                        $("<div />",{"class" : "dialog-croppie-demo"}).croppie({
                            viewport: self.options.viewport,
                            boundary: self.options.boundary,
                            enableExif : self.options.enableExif,
                            enableResize : self.options.enableResize,
                            enableOrientation : true
                        })
                        )
                   .append(
                   $("<input />",{type : "file", name : "upload", value : "Bild hochladen...", accept : "image/*", style : "display:none;"})
                   .change(function(){ // Wenn Bild ausgewählt wird
                         if (this.files && this.files[0]) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                $d.find(".dialog-croppie-demo").croppie('bind', {
                                    url: e.target.result
                                });
                                $d.find('.dialog-croppie-demo').addClass('ready');
                            }
                            reader.readAsDataURL(this.files[0]);
                        }

                   })
                   .add($("<button />",{text : "Bild auswählen"}).click(function(){
                       $(this).parent().find("input[name=upload]").click();
                       event.preventDefault();
                   }))
                   ),
                   choose : function(val){
                        if(val){
                        $d.find(".dialog-croppie-demo").croppie('result', {
                            type: self.options.type,
                            size: self.options.size,
                            format: "jpeg"
                        }).then(function (resp) {
                            if(self.options.isContainer)
                            self.element.css("backgroundImage","url("+resp+")");
                            self.options.submit(resp);
                        });
                        }

                   }
                });


                self.element.click(function(e){
                    $d.dialog("open");
                    e.preventDefault();
                })

    },
    _refresh : function(){

    },
    close : function(){
        //console.log("Close dialog");
        this.element.hide();
    }
});


/* Addresspicker Widget - Wähle Adresse mithilfe von Adressdiensten */

$.widget("custom.addresspicker",{
    options : {
        placeobj : null,
        submit : function(obj){

        }
    },
    _create : function(){
        //console.log("Addresspicker widget");
        var self = this;

        var $hiddeninputs = $("<input />",{type: "hidden", name : "street"}).add($("<input />",{type: "hidden", name : "housenumber"})).add($("<input />",{type: "hidden", name : "city"})).add($("<input />",{type: "hidden", name : "country"})).add($("<input />",{type: "hidden", name : "lon"})).add($("<input />",{type: "hidden", name : "lat"})).insertAfter(this.element);

         var $d = $("#dialog-addresspicker");
         $d.dialog({
                   closeOnChoose : false,
                   modal: false,
                   values : [{
                        content : "Best&auml;tigen",
                        value : true
                   },{
                        content : "Abbrechen",
                        value : false
                   }],
                   desc : $("<div />")
                   .append($("<div />",{id : "dialog-addresspicker-map"}))
                   .append($("<div />",{id : "dialog-addresspicker-suggestions"}))
                   .append($("<input />",{type : "text", name : "address", id : "dialog-addresspicker-input", placeholder : "Straße Nr., Stadt"}))
                   .append($("<div />",{id : "dialog-addresspicker-fields", style : "display:none;white-space:nowrap;"})
                       .append("<br>")
                       .append($("<span />",{id : "dialog-addresspicker-street"}))
                       .append("&nbsp;")
                       .append($("<span />",{id : "dialog-addresspicker-number"}))
                       .append("<br>")
                       .append($("<span />",{id : "dialog-addresspicker-city"}))
                       .append(",&nbsp;")
                       .append($("<span />",{id : "dialog-addresspicker-country"}))
                   ),
                   choose : function(val){
                        if(val){
                            if(self.options.placeobj == null){
                                app.alert("Das Eingabefeld dient lediglich der Suche.<br>Bitte w&auml;hlen Sie Ihre Adresse unter den erscheinenden Suchvorschl&auml;gen aus.");
                                return;
                            } else {
                                //console.log(self.options.placeobj);
                            var prop = self.options.placeobj.properties;
                            var coord = self.options.placeobj.geometry.coordinates;
                                self.element.val(prop.street+" "+prop.housenumber+", "+prop.locality+", "+prop.country);
                                $hiddeninputs[0].value = prop.street;
                                $hiddeninputs[1].value = prop.housenumber;
                                $hiddeninputs[2].value = prop.locality;
                                $hiddeninputs[3].value = prop.country;
                                $hiddeninputs[4].value = coord[0];
                                $hiddeninputs[5].value = coord[1];
                            }
                        }
                        $d.dialog("close");
                   }
                });

                $("#dialog-addresspicker-input").addresscomplete({
                        map : $("#dialog-addresspicker-map"),
                        target : $("#dialog-addresspicker-suggestions"),
                        choose : function(val){
                            var prop = val.properties;
                            $("#dialog-addresspicker-fields").show();
                            $("#dialog-addresspicker-street").text(prop.street);
                            $("#dialog-addresspicker-number").text(prop.housenumber);
                            $("#dialog-addresspicker-city").text(prop.locality);
                            $("#dialog-addresspicker-country").text(prop.country);
                            self.options.placeobj = val;

                        },
                        layers : "address",
                        hideOnOutside : false
                   }).focus();



                this.element.click(function(){
                    var $m = $d.find("#dialog-addresspicker-map");
                    $m.geomap({ // Bilde widget "geomap" auf den container
                              zoom : 18,
                              center: [currentLocation.lon, currentLocation.lat]
                        });
                    setTimeout(function($m){
                    return function(){
                        $m.geomap("resize");
                    }
                    }($m),500);
                    $d.dialog("open");
                })

    },
    _refresh : function(){

    },
    close : function(){
        //console.log("Close dialog");
        this.element.hide();
    }
});

/* Locationpicker Widget - Wähle einen Standort mithilfe einer Karte */

$.widget("custom.locationpicker",{
    options : {
        map : null,
        target : null,
        coordarr : null,
        submit : function(coord){
            alert(JSON.stringify(coord));
        }
    },
    setcoords : function(arr){
        this.options.coordarr = arr;
        this.options.map.geomap("empty");
        this.options.map.geomap("append",{ type: "Point", coordinates: arr}, '<div id="dialog-locationpicker-pin"></div>');

    },
     _create : function(){
        //console.log("Locationpicker widget");
        var self = this;

         var $d = $("#dialog-locationpicker");
         $d.dialog({
                   closeOnChoose : false,
                   modal: false,
                   values : [{
                        content : "Best&auml;tigen",
                        value : true
                   },{
                        content : "Abbrechen",
                        value : false
                   }],
                   desc : $("<div />")
                   .append($("<div />",{id : "dialog-locationpicker-map"}))
                   .append($("<div />",{id : "dialog-locationpicker-suggestions"}))
                   .append($("<input />",{type : "text", name : "address", id : "dialog-locationpicker-input", placeholder : "Straße Nr., Stadt"}))
                   ,
                   choose : function(val){
                        if(val){
                            self.options.submit(self.options.coordarr);
                        }
                        $d.dialog("close");
                   }
                });

                $("#dialog-locationpicker-input").addresscomplete({
                        map : $("#dialog-locationpicker-map"),
                        target : $("#dialog-locationpicker-suggestions"),
                        choose : function(val){
                            self.setcoords(val.geometry.coordinates);
                        },
                        hideOnOutside : true
                   }).focus();



                this.element.click(function(){
                    var $m = $d.find("#dialog-locationpicker-map");
                    self.options.map = $m;
                    var coords = ((self.options.coordarr == null) ? [user.data.bike_lon, user.data.bike_lat] : self.options.coordarr);

                    $m.geomap({ // Bilde widget "geomap" auf den container
                              zoom : 18,
                              center : coords,
                              click : function(e, geo){
                                    self.setcoords(geo.coordinates);
                              }
                        });
                        self.setcoords(coords);
                    setTimeout(function($m){
                    return function(){
                        $m.geomap("resize");
                    }
                    }($m),500);
                    $d.dialog("open");
                })

    }

});


/* Addresscomplete Widget - Wähle eine Adresse aus Vervollständigungsvorschlägen aus */

$.widget("custom.addresscomplete",{
    options : {
        target : null, // Element für die Suchvorschläge
        map : null, // Element der Map
        layers : "address,venue", // Suchvervollständigungstypen
        hideOnOutside : true, // Verstecken sobald außerhalb geklickt wurde?
        choose : function(val){ // Funktion bei Auswahl

        }
    },
    _create : function(){
        //console.log("Addresscomplete widget");
        var self = this;
        this.options.target.addClass("addresscomplete-sugg");


        this.element.on("input change",function(){
                var val = $(this).val();
                var to = $(this).data("timeout");
                if(to) clearTimeout(to);

                if($(this).is(":focus"))
                $(this).data("timeout",setTimeout(function(){

                 if(val.length >= 3){

                    $.ajax( {
                      url: "https://search.mapzen.com/v1/autocomplete",
                      dataType: "json",
                      data: {
                        "focus.point.lat" : currentLocation.lat,
                        "focus.point.lon" : currentLocation.lon,
                        "layers" : self.options.layers,
                        "api_key" : config.mapzenkey,
                        "text" : val
                      },
                      success: function( data ) {
                        //console.log(data);
                        var suggestions = [];
                        for (var i = 0; i < data.features.length; i++) {
                            suggestions.push({
                              label: data.features[i].properties.name,
                              desc: (data.features[i].properties.locality) ? (data.features[i].properties.locality+", "+data.features[i].properties.country) : data.features[i].properties.country,
                              value: data.features[i].label,
                              obj : data.features[i]
                            });
                          }
                        //console.log("Suchergebnis...");
                        //console.log(suggestions);

                        $ul = $("<ul />");
                        for(var i=0;i<suggestions.length;i++){
                            var item = suggestions[i];
                            var iprop = item.obj.properties;
                            var desc = "";
                            if(iprop.country){
                                if(iprop.street && iprop.housenumber)
                                    desc += iprop.street+" "+iprop.housenumber+" &nbsp;&raquo;&nbsp;";
                                if(iprop.postalcode)
                                    desc += " "+iprop.postalcode;
                                if(iprop.locality)
                                    desc += " "+iprop.locality+"";

                                    desc += " ("+iprop.country+")";

                            }

                            var $li = $("<li />")
                            .append($("<span />",{"class" : "label", text : item.label}))
                            .append("<br>")
                            .append($("<span />",{"class" : "desc"}).html(desc))
                            .click(
                            function(item){
                                return function(){
                                    self.options.map.geomap("option","center",item.obj.geometry.coordinates);
                                    self.element.val(item.obj.properties.label);
                                    self.options.choose(item.obj);
                                    self.options.target.empty().hide();

                                }
                            }(item))
                            .appendTo($ul);
                        }
                        //console.log(self);
                        self.options.target.html($ul)
                        .show();
                        if(self.options.hideOnOutside)
                        self.options.target
                        .outside("click",function(){
                            $(this).hide();
                        });


                      },
                      fail : function(){
                        alert("Suchanfrage fehlgeschlagen");
                      }
                    } );

                } else self.options.target.empty().hide();





                },500));

            })





    },
    _refresh : function(){

    },
    open : function(){
        this.element.css("display","flex");
    },
    close : function(){
        this.element.hide();
    }
});


/* Ratin Widget - Bewerte einen Benutzer oder stelle eine Bewertung dar */

$.widget("custom.rating",{
    options : {
        val : 0,
        max : 5,
        scale : 1,
        interactive : false,
        choose : function(val){
            alert(val+" Sterne");
        }
    },
    _create : function(){
        //console.log("Rating widget");
        this.element.addClass("cui-rating");
        this._refresh();

    },
    _refresh : function(){
        var self = this;
        var ceiledval = Math.ceil(this.options.val);
        var rest = 1-ceiledval+this.options.val; // Der letzte Stern
        var $e = $("<div />",{"class" : "cui-rating-container"});

        for(var i=0;i<this.options.max;i++){
            var $star = $("<div />",{"class" : "cui-rating-empty"});
            if(i<ceiledval) $star.append($("<div />",{"class" : "cui-rating-filled"}));

            if(this.options.interactive)
            $star.click(function(pos){
            return function(){
                app.confirm("Willst Du "+pos+" Sterne vergeben?",function(val){ // Zugriff auf Object app. Hier ist dieses Widget nicht mehr modular. Da es aber eigens für diese Anwendung geschrieben wurde und app.confirm einfacher aufgerufen werden kann, wird dies verwendet.
                    //console.log(val);
                    if(val){
                    self.option({val:pos,interactive:false});
                    self.options.choose(pos);
                    }
                });
            }
            }(i+1));

            $e.append($star);

        }
        if(rest > 0) // Fülle letzten Stern anteilig
            $e.find(".cui-rating-filled:last").width(rest*100+"%");

        this.element.html($e).css("transform","scale("+self.options.scale+")");
    },
    option : function(obj){
        for(var key in obj){
            this.options[key] = obj[key];
        }
        this._refresh();
    }
});


})(jQuery);