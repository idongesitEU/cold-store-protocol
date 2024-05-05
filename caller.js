const {
	sha256
} = require('js-sha256');
const {
	readTextFile,
	WORD_LIST,
	getWord
} = require("./factory");
const {
	callSiteBuilder,
	buildPassword,
	getBaseKey
} = require("./password-builder");
const {
	Runtime
} = require('./classes');
const {
	encryptFile,
	decryptAes,
	decryptChacha,
	getDecryptionKey
} = require('./file-enc');
const {
	Logger
} = require('./Logger');
const BASE_KEY_HASH = readTextFile('/storage/emulated/0/cold-store/auth-hash.bin');
var args = process.argv.slice(2)
Logger.warn();
const keyArg = args[0];
const subArg = args[1];

function call() {
	if (!(keyArg && subArg)) throw 'incomplete arguements!!';
	if (keyArg === 'site') siteCall(subArg)
	else if (keyArg === 'encryptFile') encryptCall(subArg)
	else if (keyArg === 'decryptAes') decryptAesCall(subArg);
	else if (keyArg === 'decryptChacha') decryptChachaCall(subArg);
	else if (keyArg === 'getDecryptionKey') getDecryptionKeyCall(subArg);
	else throw 'invalid params';
	clearLogsS();
}

function siteCall(SITE_NAME) {
	const r = new Runtime();
	const p = callSiteBuilder(SITE_NAME, BASE_KEY_HASH)
	Logger.log(SITE_NAME + ': ' + p + '\nDURATION: ' + r.end() + 's');
}

function encryptCall(fileUrl) {
	encryptFile(fileUrl);
}

function decryptAesCall(fileUrl) {
	decryptAes(fileUrl);
}

function decryptChachaCall(fileUrl) {
	decryptChacha(fileUrl);
}

function getDecryptionKeyCall(fileName) {
	getDecryptionKey(fileName);
}

function clearLogsS(s = 120) {
	setTimeout(Logger.clear, s * 1000)
}

function getEncKey() {}
module.exports = {
	call
}