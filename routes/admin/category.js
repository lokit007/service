let Db = require("../../models/database.js");

module.exports = (app, pool) => {
    app.get("/category", (req, res, next) => {
        res.render("admin/category");
    });
    app.get("/admin/category", (req, res, next) => {
        res.render("admin/category", {title: "Category", data: []});
    });
}
