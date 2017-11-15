let Db = require("../../models/database.js");
let moment = require("moment");

module.exports = (app, pool) => {
	app.get("/error", (req, res, next) => {
		res.send("Error : Stop now!!!");
	});

	app.get("/service", (req, res, next) => {
		let date = moment(new Date());
		res.render("service/home", {data: "Da chay server, đây là client " + date.add(1, "M").format("YYYY/MM/DD HH:mm:ss")});
	});

	app.get("/service/email", (req, res, next) => {
		let db = new Db(pool);
		let sql = "select * from keymail limit 50;"
		try {
			db.getData(sql)
			.then(results => {
				res.render("service/allmailkey", {data: results});
			})
			.catch(err => {
				console.log(err);
				res.redirect("/error");
			});
		} catch (error) {
			console.log(error);
			res.redirect("/error");
		}
	});

	app.get("/service/email/:key", (req, res, next) => {
		let db = new Db(pool);
		let sql = "select * from keymail where MacKey = ? limit 1;"
		try {
			db.getData(sql, req.params.key)
			.then(results => {
				if(results.length > 0)
					res.json({requets: true, keyvalue: results[0].MacKey});
				else
					res.json({requets: false, keyvalue: "ErrorValue"});
			})
			.catch(err => {
				console.log(err);
				res.json({requets: false, keyvalue: "ErrorValue"});
			});
		} catch (error) {
			console.log(error);
			res.json({requets: false, keyvalue: "ErrorValue"});
		}
	});

	app.get("/service/addmail/:key", (req, res, next) => {
		let db = new Db(pool);
		let sql = "insert into keymail set ?"
		let obj = {}
		let strState = "0"
		let admin = "lokit007"
		let date = moment(new Date());
		
		try {
			strState = req.query.state;
			admin = req.query.user;
			if(admin != "lokit0072020") {
				res.json({requets: false, keyvalue: req.params.key});
			} else {
				obj = {
					MacKey: req.params.key,
					State: strState,
					DateBlock: date.add(1, "M").format("YYYY/MM/DD")
				};
				pool.getConnection(function(err, connection) {
					connection.beginTransaction(function(errTran) {
						if(errTran) res.json({requets: false, keyvalue: "ErrorValue"});
						else db.executeQuery(sql, obj, connection)
						.then(results => {
							connection.commit(function(errComit) {
								if(errComit) connection.rollback(function() {
									res.json({requets: false, keyvalue: "ErrorValue"});
								})
								else {
									res.json({requets: true, keyvalue: req.params.key});
								}
							});
						})
						.catch(error => {
							connection.rollback(function() {
								res.json({requets: false, keyvalue: "ErrorValue"});
							});
						});
					});
				});
			}
		} catch (error) {
			console.log(error);
			res.json({requets: false, keyvalue: "ErrorValue"});
		}
	});
}