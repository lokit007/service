let Db = require("../../models/database.js");
let moment = require("moment");
let fs = require("fs");

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
		let sql = "select * from keymail order by State desc limit 0, 20;"
		sql += "select State, count(State) as SoLuong from keymail group by State order by State desc;"
		sql += "select substr(DateBlock, 1, 7) as MonthRegit, count(DateBlock) as Number from keymail group by MonthRegit;"
		try {
			db.getData(sql)
			.then(results => {
				let dataChart = {
					data1: results[1],
					data2: results[2]
				}
				res.render("service/allmailkey", {data: results[0], dataChart: dataChart});
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

	app.get("/service/searchemail", (req, res, next) => {
		let db = new Db(pool);
		let sql = "select * from keymail where MacKey = ? or NameUser like N? or Phone like ? order by State desc limit ?, 20;"
		let intPage = parseInt(req.query.page)
		let textSearch = req.query.key
		try {
			if(textSearch == undefined) textSearch = "";
			if(isNaN(intPage) || intPage < 1) intPage = 1;
			db.getData(sql, [textSearch, "%"+textSearch+"%", "%"+textSearch+"%", (intPage-1)*20])
			.then(results => {
				res.send({req: true, data: results});
			})
			.catch(err => {
				res.json({req: false, data: null});
			});
		} catch (error) {
			res.json({req: false, data: null});
		}

	})

	app.post("/service/changestate", (req, res, next) => {
		let db = new Db(pool);
		let sql = "update keymail set State = ?, DateBlock = ? where Id = ?"
		let obj = []
		let strState = req.body.new
		let strId = req.body.key
		let date = moment(new Date());
		
		try {
			obj = [strState, date.add(1, "M").format("YYYY/MM/DD"), strId];
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
								res.json({requets: true, keyvalue: date.add(1, "M").format("YYYY/MM/DD")});
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
		} catch (error) {
			console.log(error);
			res.json({requets: false, keyvalue: "ErrorValue"});
		}
	});

	app.get("/service/email/:key", (req, res, next) => {
		let db = new Db(pool);
		let sql = "select * from keymail where MacKey = ? limit 1;"
		try {
			db.getData(sql, req.params.key)
			.then(results => {
				if(results.length > 0) {
					let state = results[0].State;
					switch(state) {
						case -2, -1:
							res.json({requets: false, keyvalue: "ErrorValue"});
							break;
						case 0: case 1: case 5:
							res.json({requets: true, keyvalue: results[0].MacKey});
							break;
						case 2: case 3:
							let date = moment(new Date());
							let datablock = moment(results[0].DateBlock);
							if(datablock.diff(date, 'days') > -1){
								res.json({requets: true, keyvalue: results[0].MacKey});
							} else res.json({requets: false, keyvalue: "ErrorValue"});
							break;
						default:
							res.json({requets: false, keyvalue: "ErrorValue"});
					}
				} else res.json({requets: false, keyvalue: "ErrorValue"});
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
					DateBlock: date.add(1, "M").format("YYYY/MM/DD"),
					NameUser: req.query.name,
					Phone: req.query.phone,
					Email: req.query.email
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

	app.get("/service/checkversion/:app", (req, res, next) => {
		let app = req.params.app;
		let ver = req.query.ver;
		let lines = [];
		let strResult = "";
		try {
			switch (app) {
				case "sendmail":
					strResult = fs.readFileSync("./public/uploads/sendmail/version.txt", "utf-8");
					console.log(strResult);
					lines = strResult.replace(/\r/gi, "").split("\n");
					if (lines[0] != ver) {
						res.json({requets: true, files: lines, data: strResult})
					} else {
						res.json({requets: false, files: []});
					}
					break;
				default :
					res.json({requets: false, files: []});
			}
		} catch (error) {
			res.json({requets: false, files: []});
		}
	});
}