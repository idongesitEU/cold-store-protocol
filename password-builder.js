'use strict';
const {
	WORD_LIST,
	validateInput,
	isString,
	isInteger,
	readTextFile,
	sha256,
	sha256NTimes,
	sha256Base64NTimes,
	pseudoRandomChecksumWord,
	pseudoRandomNumber,
	getFirstN,
	getLastN,
	base64ToHex,
	hexToBinary,
	stringToNJoinArray,
	binaryArrayToBase10Array,
	ASCIICharsFromNumberArray,
	pseudoRandomInteger
} = require('./factory');

function buildPassword(base, extendedBase, baseKeyHash, siteName, callback) {
	const NUMBER_OF_HASHES = 10 ** 7;
	isString(baseKeyHash);
	if (base.match(/\s+$/gm)) throw 'base cannot contain a whitespace at the end';
	isString(siteName);
	if (siteName === '') throw 'site name cannot be empty';
	if (siteName.toLowerCase() != siteName) throw 'site name must be in lower case';
	const baseKey = getBaseKey(base, extendedBase);
	validateInput(baseKey, baseKeyHash);
	const sitePseudoRandomInteger = pseudoRandomInteger(addWordToPhrase(baseKey, siteName));
	const rawPassword = `${baseKey} ${sitePseudoRandomInteger}`;
	if (NUMBER_OF_HASHES !== 10 ** 7) console.log('WARNING!! NUMBER OF HASHES IS NOT 10,000,000\nnumber of hashes is currently ' + NUMBER_OF_HASHES);
	const rawPasswordHashes = {
		"hexHashes": [sha256NTimes(rawPassword, NUMBER_OF_HASHES)],
		"base64Hashes": [sha256Base64NTimes(rawPassword, NUMBER_OF_HASHES)]
	}
	const combinedPasswordHash = `${rawPasswordHashes.hexHashes.join('')}${rawPasswordHashes.base64Hashes.map(base64Hash => base64ToHex(base64Hash)).join('')}`;
	const password = getASCIIPassword(combinedPasswordHash); //map 512 bit output to 16 ASCII characters
	return password;
}

function getBaseKey(base, extendedBase) {
	isString(base);
	const baseChecksumWord = pseudoRandomChecksumWord(base);
	let baseKey = addWordToPhrase(base, baseChecksumWord);
	if (extendedBase) baseKey = addWordToPhrase(baseKey, extendedBase);
	return baseKey;
}

function addWordToPhrase(phrase, word) {
	return `${phrase} ${word}`;
}

function getASCIIPassword(combinedPasswordHash) {
	const binaryString = hexToBinary(combinedPasswordHash);
	const binaryStringArray = stringToNJoinArray(binaryString, 32);
	const numberArray = binaryArrayToBase10Array(binaryStringArray);
	const ASCIIPassword = ASCIICharsFromNumberArray(numberArray);
	return ASCIIPassword;
}
module.exports = {
	WORD_LIST,
	buildPassword,
	getBaseKey
}
