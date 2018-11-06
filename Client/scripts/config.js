var config = {
    support : { // Support-/Impressum-Daten
        name : "Radup-Administration",
        mail : "system@radup-wuppertal.de"
    },
    //socketurl : window.location.origin+":3001",//"http://127.0.0.1:3001", // URL zum Socket. Zur Verwendung von SSL https statt http nutzen
    socketurl : "http://127.0.0.1:3001",//"http://192.168.2.108:3001", // URL zum Socket. Zur Verwendung von SSL https statt http nutzen. Serverkonfiguration beachten.

    rootPath : "/radup", // Pfad vom erreichbaren http-Root-Verzeichnis zu Projektordner. Leer lassen falls nicht in einem Unterordner.
    biketime : 5, // Maximale Ausleihzeit in der der Punkt gr�n bleibt
    mapzenkey : "mapzen-VF2QM2T", // MapZen-Key f�r Adressdaten (https://mapzen.com/)
    onesignal : {
        id : "eff85bcc-a897-4fa1-aa65-730e5738a092",
        sdname : "arenawars" // Subdomain-Name
    },
    defaultLocation : {lat: 51.24570, lon : 7.14980} // Uni-Wuppertal (Falls Ortungsdienste nicht verwendet werden)
}

/* Folgendes kann konstant bleiben */
config.userpicsPath = config.socketurl+"/userpic/"; // /%ID%/ Pfad zu den Profilbildern
config.stationpicsPath = config.socketurl+"/stationpic/"; // /%ID%/ Pfad zu den Profilbildern
config.repairpicsPath = config.socketurl+"/repairpic/"; // /%ID%/ Pfad zu den Profilbildern
config.chargepicsPath = config.socketurl+"/chargepic/"; // /%ID%/ Pfad zu den Profilbildern
config.bikepicsPath = config.socketurl+"/bikepic/"; // /%Bike-ID%/NAME (thumb, profile, 1, 2, 3)
config.sponsorpicsPath = config.socketurl+"/sponsorpic/"; // /%Sponsor-ID%/NAME (banner)
