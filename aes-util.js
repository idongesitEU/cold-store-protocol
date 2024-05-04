const aesjs = require("aes-js");
const {
	readTextFile,
	quickRandNumber,
	convertBase,
	hasInvalidASCIIChars,
	getFileNameFromFolderUrl,
	saveFile
} = require("./factory");
const {
	buildPassword
} = require("./password-builder");

function getKeyBuffer(key) {
	const keyBytes = aesjs.utils.utf8.toBytes(key);
	const keyBuffer = Buffer.from(keyBytes);
	return keyBuffer;
}

function quickRand16Bytes(key) {
	const scalar = (2 ** 16) - 1
	const randByte = quickRandNumber(key, scalar);
	return randByte;
}

function encrypt(key, text) {
	const bufferKey = getKeyBuffer(key);
	const textBytes = aesjs.utils.utf8.toBytes(text);
	const nounce = new aesjs.Counter(quickRand16Bytes(key))
	const aesCtr = new aesjs.ModeOfOperation.ctr(bufferKey, nounce);
	const encryptedBytes = aesCtr.encrypt(textBytes);
	const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	return encryptedHex;
}

function decrypt(key, encryptedHex) {
	if (!encryptedHex.match(/^([0-9A-Fa-f])+$/)) throw 'cipher text must be hex';
	const counterArray = readTextFile('16-bit-random-array-base64.txt').split('\n').map(base64 => parseInt(convertBase(base64, 64, 10)));
	const bufferKey = getKeyBuffer(key);
	const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
	let isDecrypted = false;
	let decryptedText;
	for (let counter of counterArray) {
		let aesCtr = new aesjs.ModeOfOperation.ctr(bufferKey, new aesjs.Counter(counter));
		let decryptedBytes = aesCtr.decrypt(encryptedBytes);
		decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		if (!hasInvalidASCIIChars(decryptedText)) {
			isDecrypted = true;
			break;
		}
	}
	if (isDecrypted) return decryptedText;
	else throw 'invalid key or invalid data';
}

function encryptFromFile(key, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	const fileText = readTextFile(fileUrl);
	const cipherTextHex = encrypt(key, fileText);
	const cipherTextHexUrl = fileUrl.replace(`${fileName}.txt`, `${fileName}-aes-256-cipher.txt`)
	saveFile(cipherTextHexUrl, cipherTextHex);
}

function callEncryptFromFile(base, extendedBase, baseKeyHash, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	console.log('file name: ', fileName);
	const key = buildPassword(base, extendedBase, baseKeyHash, fileName, 32);
	encryptFromFile(key, fileUrl);
	return key;
}

function decryptFromFile(key, fileUrl) {
	const fileName = getFileNameFromFolderUrl(fileUrl);
	const fileText = readTextFile(fileUrl);
	const decrypted = decrypt(key, fileText);
	const decryptedUrl = fileUrl.replace(`${fileName}.txt`, `${fileName}-aes-256-decrypted.txt`).replace('-aes-256-cipher', '');
	saveFile(decryptedUrl, decrypted);
}
module.exports = {
	encrypt,
	encryptFromFile,
	callEncryptFromFile,
	decrypt,
	decryptFromFile
}