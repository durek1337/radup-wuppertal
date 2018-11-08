Die Client- und Serveranwendung zu dem Projekt "Radup-Wuppertal".

# Allgemeines

Es hat lange gedauert, aber es ist endlich veröffentlicht. Ich habe mich schwer getan ein so großes Projekt, länger nicht angerührtes Projekt zu veröffentlichen. Ich tue es aber nun, wohl wissend, dass einige Fehler  und viele Unschönheiten zu finden sind. Ich empfehle das Öffnen der Konsole im Browser während der Aufrufe. Viele Konsolenausgaben sind vermutlich überflüssig aber damit verschafft man sich zunächst einen guten Überblick.

Schaut in die Konfigurationen und verwendet soweit wie möglich eure eigenen Daten für Dienste wie Mapzen und OneSIgnal.

## Datenbank

Die Datenbankdaten befinden sich in "radup.sql" und sind mit einigen Beispieldaten gefüllt. Passwörter werden in Klartext gespeichert. Das ist gefährlich und sollte nur für den Entwicklungsprozess so gehandhabt werden.

## Client

Der Client in Form einer WebApp vor und kann somit im Browser geöffnet werden: "index.html".

Sie enthält entsprechende Fallunterscheidungen, um als eine hybride App zu nutzen.

Konfiguriert wird er unter "scripts/config.js".

Der Client lief auf einem lokalen Apache-Server mit xampp, er aber kann auch in nodejs über einen Port erreichbar gemacht werden.

### Empfehlungen

* Zur Verwaltung von Drittanbieter-Plugins einen package-Verwalter nutzen. Zu der zeit habe ich (durek1337, Dominik) noch keinen verwendet. Vertreter wären bspw. bower, npm oder webpack. Letzteres soll ziemlich gut sein.
* HTML-Code mit W3C validieren
* HTML-Tags semantisch festlegen. Bspw. statt einem einfachen <div></div> für Navigationsleisten den Tag <nav></nav> nutzen usw. Dies sind die Empfehlungen seit HTML5, da eine Seite so besser interpretiert und in Zukunft automatisch barrierefrei werden könnte.
* Einen stärker-objektorientierten Ansatz überlegen

### Bugs

* Noch keine eingetragen, zögere nicht



## Server

Die Serveranwendung wurde in JavaScript für nodejs geschrieben. Man kann ihn mit "node index.js" ausführen. Die Datei "start.bat" enthält genau diesen Befehl.

Konfiguriert wird er unter "inc/config.js".



Dort sollten folgende Dienste mit **eigenen Accounts** konfiguriert werden:

* OneSignal: Vereinheitlichung von Push-Notifications für Browser und Hybride Apps.
* SMTP-Server: Exemplarisch ist aktuell ein freier SMTP-Server von "Mailjet" eingetragen. Da die Absender-E-Mailadresse nicht auf dem Beispielaccount registriert ist, kriege ich (durek1337, Dominik) bei jedem Versuch eine Mail zu senden eine Benachrichtigung.  Betrachtet diesen Hinweis als Datenschutzerklärung ;-)
* MySQL-Datenbank: Dies sollte klar sein. Zugriff auf eine von mir ist nicht standardmäßig gegeben.



### Empfehlungen

- Einen stärker-objektorientierten Ansatz überlegen



### Bugs

- Noch keine eingetragen, zögere nicht

## 