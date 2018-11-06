var mysql = require("mysql");  // MySQL-Modul

module.exports = function ConPool(obj,cb){ // Klasse / Prototyp zur MySQL-Verbindung
console.log("Teste MySQL-Verbindung".cyan);
var test = mysql.createConnection(obj); // Eine einfache MySQL-Verbindung zur initialen Prüfung

test.connect(function(err){
    if(err){
        console.log("MySQL-Verbindung fehlgeschlagen!".red);
        console.log(err);
        process.exit(1);
    } else {
        //console.log(test._protocol._handshakeSequence._handshakeInitializationPacket.serverVersion);
        console.log("MySQL-Verbindung erfolgreich!".green);
        test.end();
        console.log("Trenne Verbindung und erzeuge MySQL-Verbindungspool".cyan);
        this.pool = mysql.createPool(obj);
    }

    this.query = function(sql,values,callback){ // Callback-Function um den Programmfluss nach Ausführung fortzuführen

                this.pool.getConnection(function(err, connection) {
                if(err) {
                  console.log(err);
                  return;
                }
                //console.log("Nutze MySQL-Verbindung...");
                connection.query(sql, values, function(err, rows){
                    if(err) {
                      console.log(err.red);
                      connection.release();
                      return;
                    }
                    callback(rows);
                    connection.release();
                });

                }
                )

            }

    cb(this);
    });

};