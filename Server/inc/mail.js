var nodemailer = require('nodemailer');
/*
    Konfiguration über config.js
*/
var senderMail = null; // Absender-Emailadresse
var receiverDomain = null; // Suffix nach Matrikelnummer@
var transporter = null;

/* Templates f�r die E-Mail-Benachrichtigungen in Text- und HTML-Version */
var template = {
    "registration" : {
        subject : 'Willkommen bei Radup!',
        text : 'Hallo {{name}},\nherzlich willkommen bei Radup!\nUm Ihre Matrikelnummer an der Uni-Wuppertal zu best�tigen, rufen Sie bitte folgenden Aktivierungslink auf:\n\n{{activationurl}}\n\nIhr Passwort lautet: {{password}}',
        html : 'Hallo {{name}},<br>herzlich willkommen bei Radup!<br>Um Ihre Matrikelnummer an der Uni-Wuppertal zu best&auml;tigen, rufen Sie bitte folgenden Aktivierungslink auf:<br><br><a href="{{activationurl}}">{{activationurl}}</a><br><br>Ihr Passwort lautet: {{password}}'
    },
    "password" : {
        subject : 'Radup!: Passwort vergessen',
        text : 'Hallo {{name}},\nIhr Passwort wurde bei Radup! als vergessen angegeben und angefordert.\nIhr Passwort lautet: {{password}}',
        html : 'Hallo {{name}},<br>Ihr Passwort wurde bei Radup! als vergessen angegeben und angefordert.<br>Ihr Passwort lautet: {{password}}'
    }
};


module.exports = function(cfg){
receiverDomain = cfg.receiverDomain;
senderMail = cfg.senderMail;
transporter = nodemailer.createTransport(cfg.smtpConfig);

return {
    verify : function(cb){ // Prüfe verbindung zum SMTP-Server
        console.log("Verbinde zum SMTP-Server...".cyan);
        transporter.verify(function(error, success) {
           if (error) {
                console.log('Verbindung zum SMTP-Server fehlgeschlagen'.red)
                console.log(error);
                process.exit(1);
           } else {
                console.log('SMTP-Server ist bereit'.green);
                cb();
           }
        });
    },
    send : function(receiver, tpl, context){
        var s = transporter.templateSender(template[tpl], {from : senderMail}); // Lade Template
        s({
            to : receiver+"@"+receiverDomain
        },
        context,
        function(err, info){
            if(err){
                console.log(err.toString().red);
            } else {
                console.log(("Mail an "+receiver+" gesendet: "+template[tpl].subject).magenta);
            }
        });
    }
};
}
