Die Client- und Serveranwendung zu dem Projekt "Radup-Wuppertal". Schaut in die Konfigurationen und verwendet soweit wie möglich eure eigenen Daten für Dienste wie Mapzen und OneSignal.

# Allgemeines

Es hat lange gedauert, aber es ist endlich veröffentlicht. Ich habe mich schwer getan ein so großes, länger nicht angerührtes Projekt zu veröffentlichen. Ich tue es aber nun, wohl wissend, dass einige Fehler  und viele Unschönheiten zu finden sind. Mittlerweile würde ich Vieles Grundlegend anders angehen. Dies soll in diesem Dokument als klare Empfehlung zum Ausdruck kommen; es ist aber ziemlich zeitaufwendig, wenn man alleine daran  arbeitet. Das Projekt ist so wie es nun ist, das Ergebnis zweier Bachelorarbeiten.

## Kurzfassung
In einem registrierten Nutzerkreis verantwortungsbewusster Menschen lässt sich etwas teilen. Das geht mit Büchern in der Bibliothek aber auch mit Fahrrädern. Diese Idee liegt Radup! zu Grunde. Es handelt sich um besondere Fahrräder: E-Bikes. Ein umweltbewusster Kompromiss als Ausgleich der erschwerenden Topographie Wuppertals. Um sie koordiniert untereinander verleihen zu können, ist ein Kommunikationsmedium nötig, welches jeder nutzen kann: Die hybride App. Basierend auf Webseiten ist sie ein Kalkül plattformunabhängiger Ressourcen, welches sich für alle modernen Geräte generieren lässt, und schon so im Browser funktioniert. Durch gegliederte Phasen der Softwareentwicklung entsteht nach und nach eine ansprechende Benutzer- sowie eﬃziente Serveranwendung geschrieben in JavaScript mit Node.js.


## Beteiligte
Wir, "das Projekt Radup Wuppertal", wollen ganz Wesentlich zugunsten der Umwelt handeln und durch die App zunächst auch eine soziale Komponente in Form eines Chats für einen eingeschränkten Nutzerkreis bieten. Der AStA der Uni-Wuppertal ist das Bindeglied zwischen diesem technischen Projekt und der Studierendenschaft. Zunächst möchte ich betonen, dass jeder sich an diesem technischen Projekt beteiligen darf. Wer sich an dem Design der technischen Umsetzung beteiligen möchte sollte sich mit Vektorgrafiken auskennen. Ich bin sicher der AStA freut sich aber bestimmt genauso über Beteiligung. Das betrifft Promoting, Design und wirtschaftliche Interessen. Die E-Bikes sollen vom AStA verwaltet werden; sie dürfen ggf. mit Werbung verziert, gespendet werden.


AStA und mehr: - PLatzhalter -


Die Designüberlegungen und fast alle Grafiken sind von **Caroline Groneberg** (http://www.carolinegroneberg.com/about) im Zuge einer Bachelorarbeit entstanden. Die meisten Grafiken sind aus dieser Ausfertigung und auch in der späteren technischen Umsetzung in Kooperation entstanden. Frage: Bachelorarbeit veröffentlichen? Persönlicher Kommentar?

Die technische Umsetzung ab dem ersten Push ist überwiegend im Zuge der Bachelorarbeit von **Dominik Höltgen** entstanden. Dort sind Entscheidungsvorgänge dokumentiert, welche Qualitätsstandards und Umsetzung des Designs betreffen. Eine überarbeitete Version davon soll noch Folgen.
Persönlicher Kommentar: Seit einiger Zeit bin ich eher passiv dabei. Durch den Weg in das github-Verzeichnis will ich die Aktivität dieses Projekts vorantreiben und mich zunächst auch weiterhin auf Anfrage zur Verfügung stellen. Ich habe für mich wichtige Empfehlungen formuliert, da ich mittlerweile viel dazugelernt habe und somit Heute Vieles anders machen würde.

Hier müssen mehr stehen! Github-Rechte nach Absprache möglich.

## Datenbank
Die Datenbankdaten befinden sich in "radup.sql" und sind mit einigen Beispieldaten gefüllt. Passwörter werden in Klartext gespeichert. Das ist gefährlich und sollte nur für den Entwicklungsprozess so gehandhabt werden. Es existieren abstraktere Definitionen für das Programm VisualParadgim. Diese folgen noch.

### Empfehlung
"UML-Diagramme" bzw. ihre Datenstruktur weiterhin verwenden. Diese Projekt soll möglichst profesionell dokumentiert bleiben.

## Client
Der Client ist in Form einer WebApp und kann somit im Browser geöffnet werden: "index.html".
Als Framework wurde JQuery Mobile verwendet.

Ich empfehle das Öffnen der Konsole im Browser während der Aufrufe. Viele Konsolenausgaben sind überflüssig aber damit verschafft man sich zunächst einen guten Überblick.


Sie enthält entsprechende Fallunterscheidungen, um als eine hybride App zu nutzen.
Konfiguriert wird er unter "scripts/config.js".
Der Client lief auf einem lokalen Apache-Server mit xampp, er aber kann auch in nodejs über einen Port erreichbar gemacht werden.

### Empfehlungen
* Evtl. von JQuery Mobile weg; Bootstrap sagt mir mittlerweile mehr zu.
* Zur Verwaltung von Drittanbieter-Plugins einen package-Verwalter nutzen.
* webpack (oder Alternative?) zur Generierung eines bundle-Scripts verwenden.
* HTML-Code vollständig mit W3C validieren
* HTML-Tags semantisch festlegen. Bspw. statt einem einfachen <div></div> für Navigationsleisten den Tag <nav></nav> nutzen usw. Dies sind die Empfehlungen seit HTML5, da eine Seite so besser interpretiert und in Zukunft bspw. automatisch barrierefrei werden könnte.
* Einen stärker-objektorientierten Ansatz überlegen.

### Bugs
* Noch keine eingetragen



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
