/* Das memory-object dient als Schnittstelle der lokalen Speicherung, damit es leichter austauschbar wird */
var memory = {
    requestQueue : {
        user : [],
        bike : [],
        station : [],
        repair : []
    },
    request: function(type,id){
        var q = memory.requestQueue[type];
        if(q.indexOf(id) == -1){
            q.push(id);
            server.send("request", {type : type, id : id});
        }

    },
    biketypes : {0: "Bike", 1: "E-Bike"},
    holdertypes : {0 : "Benutzer", 1 : "Station", 2 : "Werkstatt"},
    truncate : function(){
        localStorage.clear();
    },
    get : function(name){
        return localStorage.getItem(name);
    },
    set : function(name,value){
        return localStorage.setItem(name,value);
    },
    getUser : function(id){
        if(id == user.data.id) return user.data;
        if(id in memory.users) return memory.users[id];
        else return null;
    },
    getBike : function(id){
        if(id in memory.bikes) return memory.bikes[id];
        else return null;
    },
    getStation : function(id){
        if(id in memory.stations) return memory.stations[id];
        else return null;
    },
    getRepair : function(id){
        if(id in memory.repairs) return memory.repairs[id];
        else return null;
    },
    getCharge : function(id){
        if(id in memory.charges) return memory.charges[id];
        else return null;
    },
    getSponsor : function(id){
        if(id in memory.sponsors) return memory.sponsors[id];
        else return null;
    },
    users : {},
    chats : {},
    bikes : {},
    sponsors : {},
    applyData : function(data){
        var ch = {}, bi = {}, st = {}, re = {}, cr = {}, sp = {};

        if(memory.get("chats"))
            ch = JSON.parse(memory.get("chats"));
        if(memory.get("bikes"))
            bi = JSON.parse(memory.get("bikes"));
        if(memory.get("stations"))
            st = JSON.parse(memory.get("stations"));
        if(memory.get("repairs"))
            re = JSON.parse(memory.get("repairs"));
        if(memory.get("charges"))
            cr = JSON.parse(memory.get("charges"));
        if(memory.get("sponsors"))
            sp = JSON.parse(memory.get("sponsors"));

        memory.chats = ch;
        memory.bikes = bi;
        memory.stations = st;
        memory.repairs = re;
        memory.charges = cr;
        memory.sponsors = sp;

        if("messages" in data){
            console.log("Speichere Nachrichten");
            for(var i in data.messages) memory.addMessage(data.messages[i]);
        }

        if("bikes" in data){
            console.log("Speichere Fahrraddaten");
            for(var i in data.bikes) memory.addBike(data.bikes[i]);
            memory.saveBikes();
        }
        if("stations" in data){
            for(var i in data.stations) memory.addStation(data.stations[i]);
            memory.saveStations();
        }
        if("repairs" in data){
            for(var i in data.repairs) memory.addRepair(data.repairs[i]);
            memory.saveRepairs();
        }
        if("charges" in data){
            for(var i in data.charges) memory.addCharge(data.charges[i]);
            memory.saveCharges();
        }
        if("sponsors" in data){
            for(var i in data.sponsors) memory.addSponsor(data.sponsors[i]);
            memory.saveSponsors();
        }

        if(("chats" in data) || ("messages" in data)) memory.saveChats();

        chat.generateConversationList();
    },
    applySyncstamp : function(s){
        memory.set('syncstamp',s); // Speichere Serverzeit
    },
    addMessage : function(m){
        var msg = {
            type : m.type,
            self : m.self,
            content : m.content,
            timestamp : m.timestamp
        }

        if(!(m.id in memory.chats)) memory.chats[m.id] = {id : m.id, messages : [], lastmessage : null, unread : true};

        var c = memory.chats[m.id];

        if(chat.currentChatid != m.id) c.unread = true;
        c.lastmessage = m.timestamp;

        c.messages.push(msg);
    },
    addBike : function(b){
        memory.bikes[b.id] = b;
    },
    addStation : function(s){
        memory.stations[s.id] = s;
    },
    addRepair : function(r){
        memory.repairs[r.id] = r;
    },
    addCharge : function(c){
        memory.charges[c.id] = c;
    },
    addSponsor : function(s){
        memory.sponsors[s.id] = s;
    },
    saveChats : function(){
        memory.set("chats",JSON.stringify(memory.chats));
    },
    saveBikes : function(){
        memory.set("bikes",JSON.stringify(memory.bikes));
    },
    saveRepairs : function(){
        memory.set("repairs",JSON.stringify(memory.repairs));
    },
    saveStations : function(){
        memory.set("stations",JSON.stringify(memory.stations));
    },
    saveCharges : function(){
        memory.set("charges",JSON.stringify(memory.charges));
    },
    saveSponsors : function(){
        memory.set("sponsors",JSON.stringify(memory.sponsors));
    }
};