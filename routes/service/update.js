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
						res.json({requets: true, files: lines})
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
		let strResult = fs.readFileSync("./public/uploads/app.txt", "utf-8");
		let lines = strResult.replace(/\r/gi, "").split("\n");
		for(i=0; i<lines.length-1; i+=2) {
			list.push({key:lines[i], name:lines[i+1]});
		}
		res.render("service/update", {title:"Quản lí cập nhật phiên bản phầm mềm", list:list, files:{}});
	}); 
	app.post("/service/update", (req, res, next) => {
		let app = req.body.app
		let ver = req.body.ver
		if(app == undefined || app == "" || ver == undefined || ver == "") res.send("Error")
		else {
			let pathRoot = req.baseUrl + "/uploads/" + app
			let path = "./public/uploads/" + app + "/version.txt"
			let strWrite = ver
			strWrite += "\n" + pathRoot
			fs.open(path, "a+", (err, fd) => {
				if(err) res.send("Error")
				else {
					fs.readdir("./public/uploads/" + app, "utf8", (err, pathSub) => {
						if(err) {
							res.send("Error")
						} else {
							pathSub.forEach(val => {
								if(val != "version.txt") strWrite += "\n" + val
							})
							fs.writeFile(path, strWrite, 'utf8', (err) => {
								if(err) { 
									res.send("Error")
								}
								res.send("Success")
							})
						}
					})
				}
			})
		}
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
						if(element != "version.txt") {
							file.info.name = element
							let size = parseFloat(file.info.size) / 1024
							if(parseInt(size) >= 1024) file.info.size = (file.info.size/1024).toFixed(2) + " MB"
							else file.info.size = size.toFixed(2) + " KB"
							fileInfo.push(file.info)
						}
						if(i >= listFiles.length - 1) rel(fileInfo)
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
	app.get("/service/add", (req, res) => {
		let strHtml = "<form action='/service/act/addnew' method='post' id='f-add-app'><label>Key app</label><input type='text' name='key' placeholder='key app ...'><label>Tên app</label><input type='text' name='name' placeholder='Tên app ...'></form>"
		res.send(strHtml);
	})
	app.post("/service/act/:val", (req, res) => {
		let act = req.params.val
		let key = req.body.key
		let app = req.body.name

		if(act == "addnew") {
			fileServer.add(req, res, key, (err, data) => {
				if(err) res.send("Error")
				fs.appendFileSync("./public/uploads/app.txt", key + "\n" + app + "\n", "utf8")
				res.send({status:"Success", obj:{key:key, name:app}})
			})
		} else if(act == "del") {
			console.log(key + " - " + app)
			fileServer.folder(req, res, key, (err, data) => {
				if(err) res.send("Error")
				else if(data.state) {
					data.files.forEach(val => {
						try {
							fs.unlinkSync("./public/uploads/" + key + "/" + val)
						} catch (error) {
							res.send("Error")
							return
						}
					})
					fileServer.del(req, res, key, (err, data) => {
						if(err) res.send("Error")
						else fs.readFile("./public/uploads/app.txt", "utf-8", (err, data) => {
							if(err) res.send("Error")
							else {
								let lines = data.replace(/\r/gi, "").split("\n");
								if(lines.length > 0) {
									let strResult = lines.filter(val => !(val == key || val == app)).join("\n")
									fs.writeFile("./public/uploads/app.txt", strResult, 'utf8', (err) => {
										if(err) res.send("Error")
										else res.send("Success")
									})
								} else res.send("Success")
							}
						})
					})
				} else res.send("Error")
			})
		} else res.send("Error")
	})
}