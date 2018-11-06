Die Client- und Serveranwendung zu dem Projekt "Radup-Wuppertal".

# Allgemeines

Es hat lange gedauert, aber es ist endlich veröffentlicht. Ich habe mich schwer getan ein so großes Projekt, länger nicht angerührtes Projekt zu veröffentlichen. Ich tue es aber nun, wohl wissend, dass einige Fehler  und viele Unschönheiten zu finden sind. Ich empfehle das Öffnen der Konsole im Browser während der Aufrufe. Viele Konsolenausgaben sind vermutlich überflüssig aber damit verschafft man sich zunächst einen guten Überblick.

Schaut in die Konfigurationen und verwendet soweit wie möglich eure eigenen Daten für Dienste wie Mapzen und OneSIgnal.

# Datenbank

Die Datenbankdaten befinden sich in "radup.sql" und sind mit einigen Beispieldaten gefüllt. Passwörter werden in Klartext gespeichert. Das ist gefährlich und sollte nur für den Entwicklungsprozess so gehandhabt werden.

# Client

Der Client in Form einer WebApp vor und kann somit im Browser geöffnet werden: "index.html".

Sie enthält entsprechende Fallunterscheidungen, um als eine hybride App zu nutzen.

Konfiguriert wird er unter "scripts/config.js".

Der Client lief auf einem lokalen Apache-Server mit xampp, er aber kann auch in nodejs über einen Port erreichbar gemacht werden.

# Server

Die Serveranwendung wurde in JavaScript für nodejs geschrieben. Man kann ihn mit "node index.js" ausführen. Die Datei "start.bat" enthält genau diesen Befehl.

Konfiguriert wird er unter "inc/config.js".