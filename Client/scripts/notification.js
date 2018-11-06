var OneSignal = OneSignal || [];
var notification = {
    init : function(){
        console.log("Initialisiere Notifications");
        /* BROWSERVERSION */
                OneSignal.push(function(){
                //OneSignal.SERVICE_WORKER_PARAM = {scope : config.rootPath+"/onesignal/"};
                    OneSignal.init(
                        {
                            appId: config.onesignal.id,
                            subdomainName: config.onesignal.sdname,
                            //path : "onesignal/",
                            autoRegister : false,
                            httpPermissionRequest: {
                                enable: true
                            },
                            notifyButton: {
                                enable: false
                            },
                            promptOptions : {
                                actionMessage : "Wir würden Sie gerne benachrichtigen, falls sie eine Nachricht oder Leihanfrage erhalten.",
                                exampleNotificationTitleDesktop : "Radup!",
                                exampleNotificationMessageDesktop : "Leihanfrage von Max M.",
                                exampleNotificationTitleMobile : "Radup!",
                                exampleNotificationMessageMobile : "Sie haben eine neue Leihanfrage erhalten.",
                                exampleNotificationCaption : "Jederzeit deaktivierbar",
                                acceptButtonText : "Zulassen",
                                cancelButtonText : "Ablehnen",
                                showCredit : false

                            },
                            welcomeNotification: {
                                "title": "Radup!",
                                "message": "Sie haben die Benachrichtigungen aktiviert.",
                                // "url": "" /* Leave commented for the notification to not open a window on Chrome and Firefox (on Safari, it opens to your webpage) */
                            }
                    });
                });
                OneSignal.push(function(){
                    console.log("Subscription-Event-Handler gebunden");
                  // Occurs when the user's subscription changes to a new value.
                  OneSignal.on('subscriptionChange', function (isSubscribed) {
                    console.log("Benachrichtungsstatus ist nun:", isSubscribed);
                    OneSignal.getUserId( function(playerid) {
                        user.setNotification(playerid,isSubscribed);
                    });
                  });

                OneSignal.getNotificationPermission(function(permission) {
                    console.log("Site Notification Permission:", permission);

                    // (Output) Site Notification Permission: default
                });


                })
    },
    subscribe : function(){
        console.log("Frage Push-Subscription an");
        if(!app.isApp())
            OneSignal.push(function() {
                OneSignal.getNotificationPermission(function(p){
                    if(p != "granted") {
                        Notification.requestPermission();
                        app.alert("Benachrichtigungen, sog. Push-Notifications wurden auf diesem Client nicht zugelassen.<br><br>Insofern Sie diese Funktion wünschen, geben Sie die nötigen Rechte und aktivieren diese anschließend unter:<br>Konto &raquo; Einstellungen &raquo; Anwendung");
                        user.setConfig('notifications',0);
                    } else
                        OneSignal.getUserId(function(i){
                            OneSignal.isPushNotificationsEnabled(function(isEnabled) {
                                if(isEnabled)
                                        OneSignal.setSubscription(true);
                                else {
                                    console.log("Registriere Push neu...");

                                    OneSignal.registerForPushNotifications({
                                        modalPrompt: true
                                    });

                                    //OneSignal.showHttpPrompt();
                                    }
                            });
                        })
                })
            });
            else app.confirm("Möchten Sie Push-Benachrichtigungen auf diesem Gerät aktivieren?", function(val){
                if(val) hybrid.notification.subscribe(); else user.setConfig('notifications',0);
            });
    },
    unsubscribe : function(){
        if(!app.isApp()) OneSignal.setSubscription(false);
        else hybrid.notification.unsubscribe();
    }
};