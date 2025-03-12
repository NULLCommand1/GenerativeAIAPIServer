const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FILE_SIZE_LIMIT } = require('../constants/main.constants');

const generateFolderName = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}-upload`;
};

const createDirectory = (dir, cb) => {
    fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
            return cb(err);
        }
        cb(null, dir);
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = generateFolderName();
        const dir = path.join(__dirname, '../uploads/', folderName);
        createDirectory(dir, cb);
        req.fileUploadedPath = `${folderName}/${file.originalname}`;
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT * 1024 * 1024
    }
});

module.exports = upload;