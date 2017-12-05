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
		list.push({key:"", name:"*** Chọn ứng dụng ***"});
		list.push({key:"sendmail", name:"App Send Email Marketing"});
		list.push({key:"english", name:"App Leaning English"});
		list.push({key:"nihongo", name:"App Minano Nihongo"});
		res.render("service/update", {title:"Update App", list:list, files:{}});
	});

	app.post("/service/info/:keyapp", (req, res, next) => {
		let listFiles = [];
		let fileInfo = [];
		let folder = req.params.keyapp
		if(folder == undefined || folder == "") folder = null
		fileServer.folder(req, res, folder, (err, data) => {
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
				if(folder != null) req.params.user = folder
				listFiles.forEach((element, i) => {
					fileServer.info(req, res, element, (err, file) => {
						if(err) rej(err)
						file.info.name = element
						let size = parseFloat(file.info.size) / 1024
						if(parseInt(size) >= 1024) file.info.size = (file.info.size/1024).toFixed(2) + " MB"
						else file.info.size = size.toFixed(2) + " KB"
						fileInfo.push(file.info)
						if(i == listFiles.length - 1) rel(fileInfo)
					})
				})
			}).then(result => {
				res.send({status:"Success", ver:"v1.00.0000", data:result});
			}).catch(err => {
				res.send({status:"Error", ver:"", data:{}});
			})
		})
	})

	app.post("/service/upl/:keyapp", (req, res) => {
		let folder = req.params.keyapp
		if(folder == undefined || folder == "") folder = null
		fileServer.upload(req, res, folder, (err, result) => {
			if(err) res.send(401, err)
			res.send(result.data)
		})
	});

	app.post("/service/del", (req, res) => {
		let folder = req.body.app + "/" + req.body.key
		if(folder == undefined || folder == "") folder = null
		console.log(req.body)
		fileServer.del(req, res, folder, (err, data) => {
			if(err) res.send(401, err)
			res.send(data)
		})
	});
	
}