var modobj = {}
    modobj.sync = function(){ return new Date(Date.localNow())};
    modobj.syncstamp = function(){ return modobj.sync().toMYSQLString()};

module.exports = modobj;