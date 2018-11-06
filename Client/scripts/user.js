var user = {
    config : {},
    defaultConfig : {
      remember : 0,
      autologin : 1,
      notifications : -1
    },
  saveConfig : function(){
    memory.set("userconfig",JSON.stringify(user.config));
  },
  setConfig : function(n,v){
    user.config[n] = v;
    user.saveConfig();
  },
  loadConfig : function(){
      var uc = memory.get("userconfig");
    if(uc) user.config = JSON.parse(uc);
    else user.config = Object.assign({},user.defaultConfig);
  },
  getStorage : function(){
        user.loadConfig();

        var $f = $("#loginform");

      var id = memory.get("id");
      if(id) $f.find("input[name=matrikel]").val(id);

      if(user.config.remember == 1){
        intro.swiper.slideTo(intro.swiper.slides.length-2);

        $f.find("input[name=remember]").prop("checked",true);
        var pw = memory.get("pw");
        if(pw) $f.find("input[name=pw]").val(pw);
      }

  },
  logout : function(){
      notification.unsubscribe();
      memory.truncate();
      user.loadConfig();
      user.data = {};
      if(user.online)
      server.send('logout',null);
      else
      app.changePage("home");
  },
  setLogin : function(userinfo){
        user.online = true;
        user.data = userinfo;

        if(user.config.notifications == -1)
            if(app.isApp())
                hybrid.notification.subscribe(); // Ohne Dialog, geschieht automatisch
            else
                notification.subscribe(); // Wenn noch nicht angefragt wurde


  },
  setLogout : function(){
        user.online = false;
        user.info = {};
  },
  gotoProfile : function(id){
      visualisation.applyUserProfile(id);
      app.changePage("profile");
  },
  forgotPassword : function(){
        var $form = $("<form />")
        .append("Matrikelnummer:<br>")
        .append($("<input />", {type : "text", placeholder : "", name : "id", "class" : "loginfield"})).append("<br>Vorname:<br>")
        .append($("<input />", {type : "text", placeholder : "", name : "forename", "class" : "loginfield"})).append("<br>Nachname:<br>")
        .append($("<input />", {type : "text", placeholder : "", name : "surname", "class" : "loginfield"})).append("<br>")
        .append($("<input />", {type : "submit", value : "Passwort anfordern"}))
        .submit(function(){
            if(this.id.value.length > 0 && this.forename.value.length > 0 && this.surname.value.length > 0){
            $("#dialog-abbort").dialog("close");
            server.send('forgotpw',{id: parseInt(this.id.value), forename : this.forename.value, surname: this.surname.value});
            } else app.alert("Es m&uuml;ssen alle Felder ausgef&uuml;llt werden!");
        });

        $("#dialog-abbort").dialog("option",{
            desc : $form.css("textAlign","left")
        })
        .dialog("open");
        $form.find("input[type=submit]").button();


  },
  changePassword : function(){
        var $form = $("<form />").append("Aktuelles Passwort:<br>")
        .append($("<input />", {type : "password", placeholder : "", name : "pw", "class" : "loginfield"})).append("<br>Neues Passwort:<br>")
        .append($("<input />", {type : "password", placeholder : "", name : "newpw", "class" : "loginfield"})).append("<br>")
        .append($("<input />", {type : "submit", value : "Passwort ändern"}))
        .submit(function(){
            if(this.pw.value.length > 0 && this.newpw.value.length > 0){
                $("#dialog-abbort").dialog("close");
                server.send('changepw',{pw: this.pw.value, newpw : this.newpw.value});
            } else app.alert("Bitte f&uuml;llen Sie beide Felder aus.");

            return false;
        });

        $("#dialog-abbort").dialog("option",{
            desc : $form.css("textAlign","left")
        })
        .dialog("open");

        $form.find("input[type=submit]").button();
  },
  setNotification : function(playerid,b){
      if(user.online && ((b) ? 1 : 0) != user.config.notifications){
          user.setConfig("notifications", (b) ? 1 : 0);
          server.send("setNotification",{bind : b, playerid : playerid});
      }
  },
  getConnectionInfo : function(){
        if(app.isApp()){
            var info = hybrid.connection.getInfo();
            return info.networkState;
        } else return "PC";
  },
  online : false,
  data : {} // Daten über den user, werden beim Login übergeben
};