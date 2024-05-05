const {
	readTextFile,
	sha256,
	convertBase,
	hasInvalidASCIIChars,
	getFileNameFromFolderUrl,
	saveFile,
	quickRandNumber
} = require("./factory");
const crypto = require('crypto');
const chacha20 = require('chacha20');
const {
	writeFile
} = require("fs");
const {
	buildPassword
} = require("./password-builder");
const nounceArray = readTextFile('8-bit-random-array.txt').split('\n');

function encrypt(key, text) {
	if (key.length !== 32) throw 'key length must be 32';
	const keyBuffer = Buffer.from(key, 'utf-8');
	const nounceBuffer = Buffer.from(nounceArray[quickRandByte(key)], 'base64');
	const textBuffer = Buffer.from(text);
	const cipherText = chacha20.encrypt(keyBuffer, nounceBuffer, textBuffer);
	const cipherTextHex = cipherText.toString('hex');
	return cipherTextHex;
}

function decrypt(key, text) {
	const decrypted = burteForceNonce(key, text);
	return decrypted;
}

function encryptFromFile(key, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	const fileText = readTextFile(fileUrl);
	const cipherTextHex = encrypt(key, fileText);
	const cipherTextHexUrl = fileUrl.replace(`${fileName}.txt`, `${fileName}-chacha20-cipher.hex`)
	saveFile(cipherTextHexUrl, cipherTextHex);
}

function callEncryptFromFile(base, extendedBase, baseKeyHash, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	console.log('file name: ', fileName);
	const key = buildPassword(base, extendedBase, baseKeyHash, fileName, 32);
	encryptFromFile(key, fileUrl);
	return key;
}

function enc(fileUrl, baseKeyHash) {
	base = process.env.base;
	const extendedBase = process.env.extendedBase;
	return callEncryptFromFile(base, extendedBase, baseKeyHash, fileUrl)
}

function decryptFromFile(key, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	const fileText = readTextFile(fileUrl);
	const decrypted = decrypt(key, fileText);
	const decryptedUrl = fileUrl.replace(`${fileName}.hex`, `${fileName}-chacha20-decrypted.txt`).replace('-chacha20-cipher', '');
	saveFile(decryptedUrl, decrypted);
}

function quickRandByte(key) {
	const scalar = (2 ** 8) - 1
	const randByte = quickRandNumber(key, scalar);
	return randByte;
}

function burteForceNonce(key, cipherText) {
	if (!cipherText.match(/^([0-9A-Fa-f])+$/)) throw 'cipher text must be hex'
	const keyBuffer = Buffer.from(key, 'utf-8');
	const cipherTextBuffer = Buffer.from(cipherText, 'hex');
	let decrypted;
	for (let nounce of nounceArray) {
		decrypted = chacha20.decrypt(keyBuffer, Buffer.from(nounce, 'base64'), cipherTextBuffer);
		if (!hasInvalidASCIIChars(decrypted.toString())) return decrypted.toString();
	}
	throw 'invalid key or invalid data!!';
}
module.exports = {
	quickRandByte,
	encrypt,
	decrypt,
	encryptFromFile,
	callEncryptFromFile,
	decryptFromFile,
	enc
}
