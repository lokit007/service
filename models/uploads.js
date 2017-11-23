// import { Error } from "mongoose";

let multer = require("multer")
let fs = require("fs")
const pathRoot = "./public/uploads/";

/**
 * Add new Folder for user
 * @param {* Object User, user.username is not null} user 
 * @param {* Name folder} folder 
 * @param {* false if user is exists else true} isNewUser 
 */
function newFolder(user, folder, isNewUser=false, cb) {
	let pathUser = pathRoot + user.username;
	try {
		if(fs.existsSync(pathUser)) {
			pathUser = pathUser + "/" + folder;
			if(fs.existsSync(pathUser) === false) {
				fs.mkdirSync(pathUser)
				cb(null, {state: true, fullpath: pathUser});
			} else cb(null, {state: true, fullpath: pathUser});
		} else {
			if(isNewUser) {
				fs.mkdirSync(pathUser)
				pathUser = pathUser + "/" + folder;
				fs.mkdirSync(pathUser)
				cb(null, {state: true, fullpath: pathUser});
			} else {
				cb(new Error("User not exists!"), {state: false});
			}
		}
	} catch (error) {
		cb(error, {state: false});
	}
}
/**
 * Rename folder
 * @param {* User curent} user 
 * @param {* Name folder Old} folderOld 
 * @param {* Neme new Folder} folderNew 
 */
function renameFolser(user, folderOld, folderNew, cb) {
	let pathUser = pathRoot + user.username;
	try {
		fs.rename(pathUser + "/" + folderOld, pathUser + "/" + folderNew, (err) => {
			if(err) cb(err, {state: false});
			else cb(null, {state: true, fullpath: pathUser + "/" + folderNew});
		});
	} catch (error) {
		cb(error, {state: false});
	}
}
/**
 * Delete forder
 * @param {* User curent} user 
 * @param {* Folder delete} folder 
 */
function deleteFolder(user, folder, cb) {
	let pathUser = pathRoot + user.username + "/" + folder;
	try {
		if(fs.existsSync(pathUser)) {
			getInfoPath(user, folder, (err, data) => {
				if(err) cb(err, {state: false});
				else if(data.info.isFile) {
					fs.unlink(pathUser, (err) => {
						if(err) cb(err, {state: false});
						else cb(null, {state: true});
					});
				} else {
					fs.rmdir(pathUser, (err) => {
						if(err) cb(err, {state: false});
						else cb(null, {state: true});
					});
				}
			})
		} else {
			cb(null, {state: true});
		}
	} catch (error) {
		cb(error, {state: false});
	}
}
/**
 * Get list file and folder in user.username
 * @param {* User curent} user 
 * @param {* Fillter} fillter 
 */
function getFolder(user, folder, cb) {
	let pathUser = pathRoot + user.username;
	if (folder !== null) pathUser = pathUser + "/" + folder
	try {
		fs.readdir(pathUser, "utf8", (err, pathSub) => {
			if(err) cb(err, {state: false});
			else {
				cb(null, {state: true, files: pathSub});
			}
		})
	} catch (error) {
		cb(error, {state: false});
	}
}
/**
 * Get Info Path data {isFile, size}
 * @param {* User curent} user 
 * @param {* Path check} path 
 * @param {* Callback} cb 
 */
function getInfoPath(user, path, cb) {
	let pathUser = pathRoot + user.username + "/" + path
	try {
		fs.stat(pathUser, (err, stats) => {
			if(err) cb(err, {state: false})
			else cb(null, {state: true, info: {isFile: stats.isFile(), size: stats["size"]}})
		})
	} catch (error) {
		cb(error, {state: false})
	}
}

/**
 * Upload file
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder upload} filename 
 * @param {* Callback} cb 
 */
function upload(req, res, folder, cb) {
	try {
		let storage = multer.diskStorage({
			destination: function (req, file, cb1) {
				if(folder == null) cb1(null, 'uploads/')
				else {
					newFolder({username: req.params.user}, folder, false, (err, data) => {
						if(err) cb1(null, 'uploads/')
						else cb1(null, data.fullpath)
					})
				}
			},
			filename: function (req, file, cb1) {
				cb1(null, file.originalname)
			}
		});
		let uploadfile = multer({ storage: storage }).any();
		uploadfile(req, res, (err) => {
			if(err) { 
				cb(err, {uploads: false});
			}
			cb(null, {uploads: true, data: req.files});
		});
	} catch (error) {
		cb(error, {uploads: false});
	}
}
module.exports.upload = upload
/**
 * Upload file Promise
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder upload} filename 
 */
module.exports.uploadAsyn = (req, res, folder) => {
	return new Promise((resolve, reject) => {
		upload(req, res, folder, (err, data) => {
			if (err) reject(error);
			else resolve(data);
		});
	});
}
/**
 * Get all folder
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder} folder 
 * @param {* Callback} cb 
 */
function folder(req, res, folder, cb) {
	try {
		getFolder({username: req.params.user}, folder, (err, data) => {
			if(err) cb(err, data)
			else cb(null, data)
		})
	} catch (error) {
		cb(error, {state: false});
	}
}
module.exports.folder = folder
/**
 * Rename Folder
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder Old} folderOld 
 * @param {* Folder New} folderNew 
 * @param {* Callback} cb 
 */
function rename(req, res, folderOld, folderNew, cb) {
	try {
		renameFolser({username: req.params.user}, folderOld, folderNew, (err, data) => {
			if(err) cb(err, data)
			else cb(null, data)
		})
	} catch (error) {
		cb(error, {state: false});
	}
}
module.exports.rename = rename
/**
 * Delete folder
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder} folder 
 * @param {* Callback} cb 
 */
function del(req, res, folder, cb) {
	try {
		deleteFolder({username: req.params.user}, folder, (err, data) => {
			if(err) cb(err, data)
			else cb(null, data)
		})
	} catch (error) {
		cb(error, {state: false});
	}
}
module.exports.del = del
/**
 * Get info folder
 * @param {* Req} req 
 * @param {* Res} res 
 * @param {* Folder} folder 
 * @param {* Callback} cb 
 */
function info(req, res, folder, cb) {
	try {
		getInfoPath({username: req.params.user}, folder, (err, data) => {
			if(err) cb(err, data)
			else cb(null, data)
		})
	} catch (error) {
		cb(error, {state: false});
	}
}
module.exports.info = info