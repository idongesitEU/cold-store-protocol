const aes = require('./aes-util');
const chacha = require('./chacha20-util');
const {
	Logger
} = require('./logger');
const {
	buildPassword
} = require('./password-builder');
const {
	readTextFile,
	saveFile,
	getFileNameFromFolderUrl
} = require('./factory');
const BASE_KEY_HASH = readTextFile('/storage/emulated/0/cold-store/auth-hash.bin');
const keyFile = '/storage/emulated/0/cold-store/keyfile.kf';

function encryptFile(fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	console.log('file name: ' + fileName);
	Logger.log('file name: ' + fileName);
	const key = buildPassword(process.env.base, process.env.ebase, BASE_KEY_HASH, fileName, 32);
	aes.encryptFromFile(key, fileUrl);
	chacha.encryptFromFile(key, fileUrl);
	Logger.log('key: ' + key)
	return key;
}

function decryptAes(fileUrl, key = readTextFile(keyFile)) {
	aes.decryptFromFile(key, fileUrl);
	clearKeyFile();
}

function decryptChacha(fileUrl, key = readTextFile(keyFile)) {
	chacha.decryptFromFile(key, fileUrl);
	clearKeyFile();
}

function clearKeyFile(s = 180) {
	setTimeout(() => {
		saveFile(keyFile, ''); //clear key file
	}, s * 1000)
}

function getDecryptionKey(fileName) {
	const key = buildPassword(process.env.base, process.env.ebase, BASE_KEY_HASH, fileName, 32);
	saveFile(keyFile, key);
	clearKeyFile();
}
module.exports = {
	encryptFile,
	decryptAes,
	decryptChacha,
	getDecryptionKey
}