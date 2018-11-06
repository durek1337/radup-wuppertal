/* Informationen und Funktionen für den nicht-eingeloggten Bereich (Slider, Loginformular, Registrierungsformular) */

var intro = {
    swiper : null,
    init : function(){
                  intro.appendPages(); // Füge Seiten hinzu
                  intro.initSwiper(); // Initialisiert die Swiper-Bilderserie
                  intro.login.init(); // Initialisiert das Loginformular
                  intro.register.init(); // Initialisiert das Registrierungsformular
    },
    login : {
        init : function(){ // Initialisiere Loginformular
            $("#loginform").submit(function(){
                 var m = this.matrikel.value;
                 var p = this.pw.value;


                if(m.length && p.length){

                var authfunc = function(){ // Funktion zum Einloggen
                    console.log("Versuche Matrikelnummer "+m+" einzuloggen");
                    var st = memory.get("syncstamp")
                    server.send("login",{ // Sende Logindaten
                        id : parseInt(m),
                        p : p,
                        sync : (st && typeof parseInt(st) != NaN) ? parseInt(memory.get("syncstamp")) : 0 // Synchronisationsstempel
                    });
                }

                var oldid = memory.get("id"); // Hole gespeicherte Matrikelnummer
                if(oldid && oldid != m){ // Wenn die Matrikelnummer eine andere ist als gespeichert

                app.confirm("Es wurde eine andere Matrikelnummer eingegeben. Beim Fortfahren werden alle in der App gespeicherten Informationen entfernt.",function(val){
                    if(val){
                        memory.truncate(); // Lösche lokalen Speicher
                        user.loadConfig();
                        authfunc(); // Logge ein
                    }
                });

                } else authfunc(); // Logge ein



                } else
                if(app.getActivePage() == "home")
                    app.alert("Es werden beide Felder zur Authentifizierung ben&ouml;tigt");
                else app.changePage("home");

                return false;
             });
             
        }
    },
    register : {
        init : function(){ // Initialisiere Registrierungsformular

            console.log("Initialisiere Registrierungsfomular und AGB");
            $("#dialog-agb").dialog({modal:false});

            var $rform = $("#registerform").submit(function(){ // Initialisiere Registrierungsformular
                app.confirm('Ich habe die <a href="#" onclick="$(\'#dialog-agb\').dialog(\'open\')">Leihbedingungen</a> gelesen und erkl&auml;re mich durch die Registrierung damit einverstanden.',function(val){
                    if(val) intro.register.submit();
                });
                return false;
                });

/*
            $("#dialog-gender").dialog({ // Initialisiere Geschlechtsauswahldialog
                desc : "Bitte w&auml;hlen Sie Ihr Geschlecht",
                values : [{
                    content : $("<img />",{"src" : "images/profile_female.svg"}),
                    value : 0
                },{
                    content : $("<img />",{"src" : "images/profile_male.svg"}),
                    value : 1
                }],
                modal : false,
                choose : function(val){
                    intro.swiper.slideTo(intro.swiper.slides.length-1);
                    if($rform[0].pic.value.length == 0)
                    $rform.find(".userpic").css("backgroundImage","url(images/profile_"+((val) ? "male.svg" : "female.svg")+")");
                    $rform[0].gender.value = val;
                }
            });
*/
           $rform.find(".userpic").photopicker({ // Initialisiere Bildzuschneidung
               submit : function(val){
                   console.log($rform);
                   $rform.find("input[name=pic]").val(val);
               }
           });

           $rform.find("#registerform-address").addresspicker(); // Initialisiere Addressauswahl






      },
      submit : function(){  // Funktion beim Abschicken des Registrierungsfomulars
            var $rform = $("#registerform");
            var dataobj = formArrToObj($rform.serializeArray()); // Von Formular zu Object
            /* Daten noch in entsprechende Datentypen wandeln */
            dataobj.lat = parseFloat(dataobj.lat);
            dataobj.lon = parseFloat(dataobj.lon);
            dataobj.id = parseInt(dataobj.id);
            dataobj.gender = parseInt(dataobj.gender);

            var err = [];

            //if(dataobj.gender == -1) err.push('Das Geschlecht wurde nicht ordungsgem&auml;&szlig; gew&auml;hlt. Bitte gehen Sie daf&uuml;r zur&uuml;ck und klicken Sie auf &quot;Registrieren&quot;');
            if(dataobj.pic.length == 0) err.push('Kein Anzeigebild gew&auml;hlt');
            if(dataobj.id <= 0) err.push('Matrikelnummer ung&uuml;ltig');
            if(dataobj.pw.length == 0) err.push('Passwort fehlt');
            if(dataobj.forename.length == 0) err.push('Vorname fehlt');
            if(dataobj.surname.length == 0) err.push('Nachname fehlt');
            if(dataobj.country.length == 0 || dataobj.city.length == 0 || dataobj.street.length == 0 || dataobj.housenumber.length == 0) err.push('Adresse fehlt');
            // console.log(dataobj);

            if(err.length == 0){
                if(socket.connected)
                $rform.find("input[type=submit]:first").prop("disabled",true); // deaktiviere Registrierungsbutton bis Antwort kommt
                server.send("register",dataobj); // Schicke Registrierungsdaten zum Server
            }
            else {
                $ul = $("<ul />");
                for(var i=0;i<err.length;i++) $ul.append($("<li />").html(err[i]));
                app.alert($("<b />",{text : "Es sind Fehler aufgetreten:"}).add($ul));
            }
      }
    },
    initSwiper : function(){

       if(intro.swiper !== null){
       console.log("Entbinde Swiper-Intro");
       intro.swiper.destroy(true,false);
       }
        console.log("Initialisiere Swiper-Intro");

        intro.swiper = new Swiper('#intro', { // Wandle gegebene DOM-Struktur in Swiper-Slide um
          pagination: '.swiper-pagination-h',
          mousewheelControl : true, // Erlaube Scrollrad für Desktopuser
          paginationClickable: true, // Damit man auch drücken und nicht nur swipen kann
          keyboardControl : true,
          spaceBetween: 0, // Grafiken direkt nebeneinandersetzen
          onInit : function(swiper){
            swiper.bullets.hide(); // Verstecke alle Navigationspunkte, da das Titelbild diese nicht haben soll
            console.log(swiper.container);
            //if(user.config.remember) swiper.slideTo(swiper.slides.length-2); // Wenn die App schon aufgerufen wurde sollen die Schritte nicht mehr gezeigt werden
          },
          onPaginationRendered : function(s, paginationContainer){ // Wird aufgeruden wenn sich die Anzeigegröße verändert
              var bulletcount = s.bullets.length;
              if(s.activeIndex == 0 || s.activeIndex >= bulletcount-2) s.bullets.hide(); // Verstecke alle Navigationspunkte wenn es zurück zum Titelbild geht
                $(s.bullets[bulletcount-2]).add(s.bullets[bulletcount-1]).hide(); // Zeige alle Navigationspunkte, außer den des Titelbilds
          },
          onSlideChangeStart : function(s){
              var bulletcount = s.bullets.length;
              if(s.activeIndex == 0 || s.activeIndex >= bulletcount-2) s.bullets.hide(); // Verstecke alle Navigationspunkte wenn es zurück zum Titelbild geht
              else s.bullets.not(s.bullets[0]).not(s.bullets[bulletcount-2]).not(s.bullets[bulletcount-1]).show(); // Zeige alle Navigationspunkte, außer den des Titelbilds
          },
          onTap: function(s,e){ // Gestatte die Berührung, den Tap, genauso wie das Wischen
            if(s.activeIndex < (s.bullets.length-1)) // Wenn nicht am Ende der Slides
            s.slideNext();
          },
          });

    },
    appendPages : function(){ // Sliderseiten hinzufügen
        console.log("Füge Seiten der Bilderserie hinzu");
            var intropages = 6;
            var $intropages = $();

            var descriptions = [{
                title : $("<span />",{style : "color:#97bf0f;letter-spacing:-3px;", text : "R"}).add($("<span />",{style : "color:#97bf0f", text : "ad"})).add($("<span />",{style : "color:#176fae;", text : "u"})).add($("<span />",{style : "color:#176fae;letter-spacing:-5px;", text : "p"})).add($("<span />",{style : "color:#176fae;", text : "!"})).css("font-size","150%"),//,$("<img>", {src : "images/slider/logo.svg", style : "height:100%;"}),
                text : $("<span />",{style : "font-size:125%;margin-left:-2%;", text : "In 5 Schritten auf den Sattel"}),
                marginLeft : "10%"
            },{
                title : "<span style='font-size:150%;'>1.</span>Suchen",
                text : "Suche via App ein freies<br>Rad in deiner N&auml;he",
                marginLeft : "17%"
            },{
                title : "<span style='font-size:150%;'>2.</span>Kontaktieren",
                text : "Vereinbare mit dem aktuellen<br>Nutzer per Chat die &Uuml;bergabe",
                marginLeft : "21%"
            },{
                title : "<span style='font-size:150%;'>3.</span>Erhalten",
                text : "Du erh&auml;hlst <i>Radup!</i> samt Schloss,<br>Schl&uuml;ssel, Akku und Ladekabel",
                marginLeft : "17%"
            },{
                title : "<span style='font-size:150%;'>4.</span>Best&auml;tigen",
                text : "Verifiziere die &Uuml;bergabe mit<br>dem QR-Code Scanner der App",
                marginLeft : "18%"
            },{
                title : "<span style='font-size:150%;'>5.</span>Losradeln",
                text : "Trete in die Pedale und radle<br>los, ob mit Motor oder ohne!",
                marginLeft : "18%"
            }];
            var colors = ["97bc14","97bc14","5481a2","97bc14","5481a2","97bc14"];

            for(var i=0;i<intropages;i++){ // Erstelle DOM-Elemente für Intropages und füge Hintergrundeigenschaften und Beschriftung hinzu
            var $circle = $("<div />",{"class" : "introcircle"}).css("color","#"+colors[i]);
            $circle.append($("<div />",{"class" : "introcircle-container"}).append($("<div />", {"class" : "introdesc"})
            .append($("<div />", {"class" : "introtitle"}).append(descriptions[i].title))
            .append($("<div />", {"class" : "introtext"}).css("marginLeft",descriptions[i].marginLeft).append(descriptions[i].text))
            ));

            $intropages = $intropages.add($("<div />",{"class" : "swiper-slide"}).css("background", "url(images/slider/"+i+".jpg) no-repeat center center").append($circle)); // Füge Intropage hinzu
            }


            $("#intro .swiper-wrapper").prepend($intropages); // Füge die Intropages zu Beginn des Introsliders in die DOM-Struktur ein

    }
}