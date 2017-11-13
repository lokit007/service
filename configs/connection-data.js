/**
 * Config Connection MySql
 */
// Demo localhost
module.exports.datalocalhost = {
    // Số lượng kết nối tối đa
    connectionLimit: 1000,
    connectTimeout : 60 * 60 * 1000,
    aquireTimeout  : 60 * 60 * 1000,
    timeout        : 60 * 60 * 1000,
    host           : "localhost",
    port           : "3306",
    user           : "root",
    password       : "nhanviet1",
    database       : "grocerydb",
    multipleStatements : true
};
// Demo online : mysql://b20a7ec83541b0:64ffe227@us-cdbr-iron-east-03.cleardb.net/heroku_633ee9287d27a78?reconnect=true
module.exports.dataonline = {
    connectionLimit: 1000,
    connectTimeout : 60 * 60 * 1000,
    aquireTimeout  : 60 * 60 * 1000,
    timeout        : 60 * 60 * 1000,
    host           : "us-cdbr-iron-east-03.cleardb.net",
    port           : "3306",
    user           : "b20a7ec83541b0",
    password       : "64ffe227",
    database       : "heroku_633ee9287d27a78",
    multipleStatements : true
};