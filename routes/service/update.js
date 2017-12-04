let Db = require("../../models/database.js");
let constant = require("../../models/constant.js");
let moment = require("moment");
let fs = require("fs");
let multer = require("multer")
let fileServer = require("../../models/uploads.js")

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
		let listFiles = [];
		let fileInfo = [];
		list.push({key:"sendmail", name:"App Send Email Marketing"});
		list.push({key:"english", name:"App Leaning English"});
		list.push({key:"nihongo", name:"App Minano Nihongo"});
		fileServer.folder(req, res, null, (err, data) => {
			if(err) console.log(err)
			let tyle = req.query.tyle
			if(tyle == undefined || tyle == "" || tyle=="all") listFiles = data.files
			else {
				let math = new RegExp(constant.regex(tyle))
				data.files.forEach(element => {
					if(math.test(element)) listFiles.push(element)
				});
			}
			new Promise((rel, rej) => {
				Array.forEach((element, i, listFiles) => {
					fileServer.info(req, res, element, (err, file) => {
						if(err) rej(err)
						file.info.name = element
						fileInfo.push(file.info)
						if(i == listFiles.length - 1) rel(fileInfo)
					})
				})
			}).then(result => {
				res.render("service/update", {title:"Update App", list:list, files:result});
			}).catch(err => {
				res.render("service/update", {title:"Update App", list:list, files:[]});
			})
		})
	});

	app.post("/service/upl/:keyapp", (req, res) => {
		let folder = req.params.keyapp
		if(folder == undefined || folder == "") folder = null
		fileServer.upload(req, res, folder, (err, result) => {
			if(err) res.send(401, err)
			res.send(result.data)
		})
	});

	
}