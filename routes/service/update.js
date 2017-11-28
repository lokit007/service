let Db = require("../../models/database.js");
let moment = require("moment");
let fs = require("fs");
let multer = require("multer")

module.exports = (app, pool) => {
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

	app.get("/service/update", (req, res, next) => {
		let list = [];
		list.push({key:"sendmail", name:"App Send Email Marketing"});
		list.push({key:"english", name:"App Leaning English"});
		list.push({key:"nihongo", name:"App Minano Nihongo"});
		res.render("service/update", {title:"Update App", list:list});
	});

	app.post("/service/upl", (req, res) => {
		let upl = multer({dest: "./public/uploads/sendmail"}).any()
		upl(req, res, (err) => {
			res.send(req.files)
		})
	});

	
}