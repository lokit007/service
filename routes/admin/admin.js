let Db = require("../../models/database.js");
let moment = require("moment");

module.exports = (app, pool) => {
    app.get("/", (req, res, next) => {
        res.render("admin/home");
    });
}
