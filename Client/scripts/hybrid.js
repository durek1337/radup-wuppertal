/* Funktionen der hybriden App */
if(app.isApp()){
var hybrid = {
    init : function(){

            console.log("Cordovaversion");
            //document.removeEventListener( "backbutton", function(){}, false );
            document.addEventListener( "backbutton", function(){
                app.closeDialog();
            }, false );

            hybrid.notification.init();

    },
    connection : {
        getInfo : function(){
                var states = {};
                states[Connection.UNKNOWN]  = 'Unklar';
                states[Connection.ETHERNET] = 'Ethernet';
                states[Connection.WIFI]     = 'WiFi';
                states[Connection.CELL_2G]  = '2G';
                states[Connection.CELL_3G]  = '3G';
                states[Connection.CELL_4G]  = '4G';
                states[Connection.CELL]     = 'Mobilfunk';
                states[Connection.NONE]     = 'Offline';

            return {
                networkState : states[navigator.connection.type]
            }
        }
    },
    notification : {
        init : function(){
            /* Geräte-Version */

            var iosSettings = {kOSSettingsKeyAutoPrompt : true, kOSSettingsKeyInAppLaunchURL : false};
            //alert(config.onesignal.id);

            try{

                window.plugins.OneSignal
                    .startInit(config.onesignal.id)
                    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
                    .handleNotificationOpened(function(e){
                        try{
                        //if(!e.notification.isAppInFocus)
                        //alert(JSON.stringify(e, null, 2));
                        if("groupedNotifications" in e.notification)
                            data = e.notification.groupedNotifications[0].additionalData;
                        else
                            data = e.notification.payload.additionalData;
                        if(data.type == 0)
                        chat.gotoConversation(data.id)
                        else
                        alert(JSON.stringify(e, null, 2));

                        } catch(er){
                            alert(er);
                            alert(JSON.stringify(e, null, 2));
                        }

                    })
                    .iOSSettings(iosSettings)
                    .endInit();

            } catch(e){
                alert(e);
            }
        },
        unsubscribe : function(){
            window.plugins.OneSignal.setSubscription(false);
            hybrid.notification.set(false);
        },
        subscribe : function(){
            window.plugins.OneSignal.setSubscription(true);
            hybrid.notification.set(true);
        },
        set : function(b){
            window.plugins.OneSignal.getIds( function(ids) {
              user.setNotification(ids.userId,b);
            });
        }
    },
    barcodeScan : function(){
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                  if(!result.canceled) server.send("validatesession",result.text);
                },
                function (error) {
                  app.alert("Scannen fehlgeschlagen " + error);
                },
                {
                  preferFrontCamera : false, // iOS and Android
                  showFlipCameraButton : true, // iOS and Android
                  showTorchButton : true, // iOS and Android
                  torchOn: false, // Android, launch with the torch switched on (if available)
                  prompt : "Bitte den Radup!-QR-Code scannen", // Android
                  resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                  formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                  orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                  disableAnimations : true // iOS
                }
           );
    }
}
}