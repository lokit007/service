
/**
 * Module Dependencies
 */
// const errors = require('restify-errors');
const manage = require('../../models/uploads.js');

module.exports = function(app, pool) {
    app.post("/:user/upload", (req, res, next) => {
		let folder = req.query.dir
		if (folder == undefined) folder = null
		manage.upload(req, res, folder, (err, data) => {
			dataupload = data
			if(err) {
				res.send(data);
			} else {
				res.send(data);
			}
		})
	});

	app.post("/:user/uploadsync", (req, res, next) => {
		manage.uploadAsyn(req, res, null)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			console.log(err)
			res.send({uploads: false});
		});
	});

	app.get("/:user/folder", (req, res, next) => {
		let folder = req.query.dir
		if (folder == undefined) folder = null
		manage.folder(req, res, folder, (err, data) => {
			if(err) {
				res.send(data);
			} else {
				res.send(data);
			}
		})
	});

	app.post("/:user/rename", (req, res, next) => {
		let folderOld = req.query.old
		let folderNew = req.query.new
		manage.rename(req, res, folderOld, folderNew, (err, data) => {
			if(err) {
				res.send(data);
			} else {
				res.send(data);
			}
		})
	});

	app.post("/:user/delete", (req, res, next) => {
		let folder = req.query.dir
		manage.del(req, res, folder, (err, data) => {
			if(err) {
				console.log(err.message)
				res.send(data);
			} else {
				res.send(data);
			}
		})
	});

	app.get("/:user/info", (req, res, next) => {
		let folder = req.query.dir
		manage.info(req, res, folder, (err, data) => {
			if(err) {
				res.send(data);
			} else {
				res.send(data);
			}
		})
	});

}