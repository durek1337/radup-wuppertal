module.exports = {
    port : 3001, // Serverport für Verbindungen und Versionsabgleich
    usessl : false,
    socketurl : "http://server.radup-wuppertal.de:3001", // Socket-URL für externe Zugriffe (Aktivierungslink). Muss mit der des Clients übereinstimmen.
    statickey : "qwKpmnHesjEYNVmp6tYqPUTw", // Dieser Wert wird verwendet um Aktivierungsschlüssel algorithmisch zu generieren, um ihn nicht abspeichern zu müssen. Eine Veränderung bewirkt, dass bereits versendete Registrierungsschlüssel ungültig werden.
    sql : {
        host: "127.0.0.1",//"127.0.0.1", // Eine Domain wie "localhost" erzeugt irgendwann eine Exception, IP nutzen bis Fix erscheint
        user: "root", // MySQL-Benutzername
        password: "", // MySQL-Benutzerpasswort
        database: "radup" // MySQL-Datenbank
        },
    mail : {
        senderMail : "system@radup-wuppertal.de", // Absender-Emailadresse
        receiverDomain : "uni-wuppertal.de", // Suffix nach Matrikelnummer@
        smtpConfig : {
            pool: false, // Erzeugt einen Verbindungspool, wodurch nicht immer erneut mit dem smtp-server verbunden werden müsste
            host: 'in-v3.mailjet.com', // SMTP-Host
            port: 465, // SMTP-Port
            secure: true, // Benutze SSL
            auth: { // SMTP-Zugangsdaten
                user: '232c083dd9a205ea206af9ca1ce61130',
                pass: '1b2f6569730c68678c0488a4f38c14f0'
            }
        }
    },
    onesignal : { // Meine privaten Daten, bitte nur zum Testen nutzen
        id : "eff85bcc-a897-4fa1-aa65-730e5738a092",
        key : "MjFlYTdmYmQtMDI0ZS00M2RmLTliN2ItNDgzNDQwYTk0MGFh"
    },
    protection : {
        timeBetweenRequests : 5 // 5ms
    }
}
