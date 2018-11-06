window.onerror = function(messageOrEvent, source, lineno, colno, error) { // Wenn ein Fehler auftritt
    var r = {
            messageOrEvent : messageOrEvent,
            source : source,
            lineno : lineno,
            colno : colno,
            error : error
    }
    app.report(0,"JavaScript Runtime Error",r);
}


$(function(){ // Sobald alle DOM-Elemente geladen wurden
console.log("Initialisierung eingeleitet");

        if(!app.isApp()){ // Browser-Aufruf
           notification.init();

           $(document).keyup(function(e) {
                 if (e.keyCode == 27) app.closeDialog(); // ESC
            });


        } else { // App-Aufruf
            $.getScript( "cordova.js", function() {
                document.addEventListener('deviceready', hybrid.init, false);
            });
        }

        currentLocation = config.defaultLocation;

        $.mobile.defaultPageTransition = 'none';
        //notification.init();
        app.initStructures(); // Initialisiere einige Strukturen/Widgets wie Dialogfenster ...
        intro.init(); // Bilderserie, Registrierungs- und Loginformular
        user.getStorage();
        server.connect(); // Verbinde zu Server
       //$(window).resize(app.resize);

    $.mobile.pageContainer
    .on("pagecontainerchange",function(event, ui){
    var pageId = ui.toPage.attr("id");
        app.initPage(pageId);
    })
    .on("pagecontainerbeforeshow",function(event, ui){
        console.log(ui);
    var pageId= ui.toPage.attr("id");
    var $pageId = $("#"+pageId);


    });

    $(".fillable-user").initialize(function(){
        console.log("FILLABLE USER INITIALISIEREN ",$(this));
        visualisation.fillUserFields($(this));
        //console.log("FILL USERINFO #"+uid);
    });
    $(".fillable-station").initialize(function(){
        console.log("FILLABLE STATION INITIALISIEREN ",$(this));
        visualisation.fillStationFields($(this));
        //console.log("FILL USERINFO #"+uid);
    });
    $(".fillable-repair").initialize(function(){
        console.log("FILLABLE REPAIR INITIALISIEREN ",$(this));
        visualisation.fillRepairFields($(this));
        //console.log("FILL USERINFO #"+uid);
    });
    $(".fillable-charge").initialize(function(){
        console.log("FILLABLE CHARGE INITIALISIEREN ",$(this));
        visualisation.fillChargeFields($(this));
        //console.log("FILL USERINFO #"+uid);
    });

    $(".userpic").initialize(function(){
        var $d = $(this);
        if(typeof $d.attr("data-userid") != "undefined") $d.css("backgroundImage","url('"+config.userpicsPath+$d.attr("data-userid")+"')");
    });

    $("#supportform").initialize(function(){
        $("#supportform-pictures").data("pictures",[]);
        $form = $(this).submit(function(){
            var $form = $(this);
            app.confirm("Sind Sie sicher, dass Sie dieses Ticket erstellen wollen?",function(r){
                if(r){
                    $form.find("input[type=submit]:first").prop("disabled",true);
                    var obj = formArrToObj($form.serializeArray());
                    obj.type = parseInt(obj.type);
                    obj.pictures = $form.find("#supportform-pictures").data("pictures");
                     console.log(obj);
                    server.send("support", obj, true);
                }
            })

        return false;
        });

        var $s = $form.find("select[name=type]");
        for(var i in db.support.ticket.type)
        $s.append($("<option />",{text : db.support.ticket.type[i], value : i}));


        var $b = $form.find("button");

        $b.photopicker({
            isContainer : false,
            size : {width: 600},
            viewport : {
            width: 270,
            height: 270,
            type: 'square'
            },
            boundary : {
                width: 280,
                height: 280
            },
            submit : function(val){
                if(val){
                    var $imgcontainer = $("#supportform-pictures");
                var reader = new FileReader();
                reader.readAsDataURL(val);
                reader.onloadend = function(){
                    $imgcontainer.data("pictures").push(val);

                    $("<div>",{"class" : "filepicker-item"})
                    .css("backgroundImage","url("+reader.result+")")
                    .append($("<button />",{text : "X"}).click(function(){
                        $imgcontainer.data("pictures").splice($(this).parent().parent().index(this)-1,1);
                        $(this).parent().remove();
                    }))
                    .appendTo($imgcontainer);

                }
                }
            },
            dialogId : "dialog-croppie-support",
            enableExif : true,
            enableResize : true,
            type : "blob"
        });
/*
        $b.photopicker({
            isContainer : false,
            size : "original",
            submit : function(val){
                if(val){
                    var $imgcontainer = $("#supportform-pictures");
                    $imgcontainer.data("pictures").push(val);
                    $("<div>",{"class" : "filepicker-item"})
                    .css("backgroundImage","url("+val+")")
                    .append($("<button />",{text : "X"}).click(function(){
                        $imgcontainer.data("pictures").splice($(this).parent().parent().index(this)-1,1);
                        $(this).parent().remove();
                    }))
                    .appendTo($imgcontainer);


                }
            },
            dialogId : "dialog-croppie-support",
            enableExif : true,
            enableResize : true,
            type : "base64"
        });
*/

    })



      /** Panel Initialisierung **/
$("body>[data-role='panel']").panel();

    /** Header anhand von Template für jede Seite ähnlich aufbauen **/
        $h = $("#pageheader");
        $pheaders = $("div[data-role=header]");
        $pheaders.each(function(i,v){ // Nehme jeden Header ohne Menübutton
            var $e = $(this);

            var $leftbuttons = $e.find(".cui-headericon-left").remove();
            var $rightbuttons = $e.find(".cui-headericon-right").remove();

            var content = $e.html();
            var $newh = $h.clone(); // Kopiere den Templateheader

            $leftbuttons.appendTo($newh.find(".ui-btn-left")); // Füge enstprechende Icons links neben des Titels ein
            $rightbuttons.appendTo($newh.find(".ui-btn-right"));

            $newh.append(content); // Füge Header ohne Menübutton ein
            $e.html($newh.html()); // Füge DOM hinzu
        });

/* SERVICEWORKER */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('scripts/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });

}



});