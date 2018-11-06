const fs = require('fs');
const path = require('path');

var modobj = {}, mods = null, app = null, dir = path.resolve(__dirname+"/../");

module.exports = function(m,a){
mods = m;
app = a;
modobj.init = function(v){
    app.get('/userpic/:id', function(req, res){ // URL mit http aufgerufen
            var file = parseInt(req.params.id)+'.jpg';
            var path = dir + '/public/userpics/';

            /* Verhindere Caching des Profilbilds */
            /*
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);
            */

            if(fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/pic/:id/:userid/:sessionid', function(req, res, next){ // URL mit http aufgerufen
            var u = mods.usermanager.find(req.params.userid);
            console.log("HTTP pic: ",req.params);
            if(u == null) return;
            if(u.id != req.params.userid || u.socket.id !== req.params.sessionid){
                res.sendStatus(401);
                return;
            }
            mods.db.query("SELECT `data` FROM `picture` WHERE id = ?",[req.params.id],function(result){
                var data = result[0].data;
                res.writeHead(200, {
                    'Content-Type': "image/jpeg",
                    'Content-disposition': 'attachment;filename='+req.params.id+'.jpg',
                    'Content-Length': data.length
                });
                res.end(new Buffer(data, 'binary'));
            })




            /* Verhindere Caching des Profilbilds */
            /*
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);
            */


        });
        app.get('/sponsorpic/:id', function(req, res){ // URL mit http aufgerufen
            var file = parseInt(req.params.id)+'.jpg';
            var path = dir + '/public/sponsorpics/';

            if(fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/stationpic/:id/:type', function(req, res){ // URL mit http aufgerufen
            var file = parseInt(req.params.type)+'.jpg';
            var path = dir + '/public/stationpics/'+req.params.id+'/';

            if(fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/chargepic/:id/:type', function(req, res){ // URL mit http aufgerufen
            var file = parseInt(req.params.type)+'.jpg';
            var path = dir + '/public/chargepics/'+req.params.id+'/';

            if(fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/repairpic/:id/:type', function(req, res){ // URL mit http aufgerufen
            var file = parseInt(req.params.type)+'.jpg';
            var path = dir + '/public/repairpics/'+req.params.id+'/';

            if(fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/bikepic/:id/:type', function(req, res){ // URL mit http aufgerufen
            var types = ["profile", "thumb", "1", "2", "3", "thumb_1", "thumb_2", "thumb_3"];
            var file = null;
            if(types.indexOf(req.params.type > -1))
            file = parseInt(req.params.id)+"/"+req.params.type+'.jpg';

            var path = dir + '/public/bikepics/';

            /* Verhindere Caching der Bilder @TODO : Sollte eig. schon ok sein
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            */

            if(file != null && fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/sponsorpic/:id/:type', function(req, res){ // URL mit http aufgerufen
            var types = ["banner"];
            var file = null;
            if(types.indexOf(req.params.type > -1))
            file = parseInt(req.params.id)+"/"+req.params.type+'.jpg';

            var path = dir + '/public/sponsorpics/';

            /* Verhindere Caching der Bilder @TODO : Sollte eig. schon ok sein
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            */

            if(file != null && fs.existsSync(path+file))
                res.sendFile(path+file);
            else res.sendFile(dir + '/public/greylogo.jpg');
        });
        app.get('/activate/:id/:code', function(req, res){ // URL mit http aufgerufen
            var id= req.params.id;
            var code = req.params.code;
            console.log(code);
            if(mods.usermanager.generateActivationKey(id,config.statickey) == code){
                mods.db.query("UPDATE `user` SET `activated` = 1 WHERE `id` = ? AND `activated` = 0",[id], function(userresult){
                    if(userresult.affectedRows > 0) res.send("Die Aktivierung war erfolgreich!");
                    else res.send("Die Aktivierung schlug fehl, ggf. ist Ihr Account bereits aktiviert!");
                })

            } else res.send("Die Aktivierung schlug fehl! Vergewissern Sie sich, ob der ganze Link aufgerufen wurde.");
        });


        app.get('/', function(req, res){ // URL mit http aufgerufen
          res.sendFile(__dirname + '/public/index.html');
          res.header("Access-Control-Allow-Origin", "*");
          //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          res.jsonp({version: v});
        });
        app.get('/download/', function(req, res){ // URL mit http aufgerufen
        console.log(res);

          res.sendFile(__dirname + '/public/download.html');
          //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        });
}

return modobj;
}