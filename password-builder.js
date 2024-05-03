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
const NUMBER_OF_HASHES = 10 ** 7;
const PASSWORD_BLOCK_SIZE = 16;

function callSiteBuilder(siteName, baseKeyHash) {
	const base = process.env.base;
	const extendedBase = process.env.extendedBase;
	return buildPassword(base, extendedBase, baseKeyHash, siteName, 16);
}

function buildPassword(base, extendedBase, baseKeyHash, siteName, passwordLength = 16, callback) {
	const baseKey = getBaseKey(base, extendedBase);
	if (runChecks(base, extendedBase, baseKeyHash, siteName, passwordLength, NUMBER_OF_HASHES)) {
		const sitePseudoRandomInteger = pseudoRandomInteger(addWordToPhrase(baseKey, siteName));
		const rawPassword = `${baseKey} ${sitePseudoRandomInteger}`;
		const combinedPasswordHash = getCombinedPasswordHash(rawPassword, passwordLength);
		const password = getASCIIPassword(combinedPasswordHash, passwordLength); //map generated hash output to 16 ASCII characters
		return password;
	} else throw 'checks failed, ensure you called with the right paramaters';
}

function getCombinedPasswordHash(rawPassword, passwordLength) {
	if (rawPassword && passwordLength) {
		if (passwordLength % PASSWORD_BLOCK_SIZE !== 0) throw 'password length must be divisible by ' + PASSWORD_BLOCK_SIZE;
		if (passwordLength > 64) throw 'max password length is 64';
		const rawPasswordHashes = {
			"hexHashes": [],
			"base64Hashes": []
		}
		const iterations = passwordLength / PASSWORD_BLOCK_SIZE;
		for (let currentHashIndex = 0; currentHashIndex < iterations; currentHashIndex++) {
			if (rawPasswordHashes.hexHashes.length === 0 && rawPasswordHashes.base64Hashes.length === 0) {
				rawPasswordHashes.hexHashes.push(sha256NTimes(rawPassword, NUMBER_OF_HASHES));
				rawPasswordHashes.base64Hashes.push(sha256Base64NTimes(rawPassword, NUMBER_OF_HASHES));
			} else {
				const lastHashIndex = currentHashIndex - 1;
				const lastHashHex = rawPasswordHashes.hexHashes[lastHashIndex];
				const lastHashBase64 = rawPasswordHashes.base64Hashes[lastHashIndex];
				rawPasswordHashes.hexHashes.push(sha256NTimes(lastHashHex, NUMBER_OF_HASHES));
				rawPasswordHashes.base64Hashes.push(sha256Base64NTimes(lastHashBase64, NUMBER_OF_HASHES));
			}
		}
		const combinedPasswordHash = `${rawPasswordHashes.hexHashes.join('')}${rawPasswordHashes.base64Hashes.map(base64Hash => base64ToHex(base64Hash)).join('')}`;
		return combinedPasswordHash;
	} else {
		throw 'missing arguement'
	}
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

function runChecks(base, extendedBase, baseKeyHash, siteName, passwordLength) {
	if (base && extendedBase && baseKeyHash && siteName && passwordLength) {
		if (NUMBER_OF_HASHES !== 10 ** 7) console.log('WARNING!! NUMBER OF HASHES IS NOT 10,000,000\nnumber of hashes is currently ' + NUMBER_OF_HASHES);
		if (base.match(/\s+$/gm)) throw 'base cannot contain a whitespace at the end';
		isString(baseKeyHash);
		isString(siteName);
		if (siteName === '') throw 'site name cannot be empty';
		if (siteName.toLowerCase() != siteName) throw 'site name must be in lower case';
		if (passwordLength % PASSWORD_BLOCK_SIZE !== 0) throw 'password length must be divisible by ' + PASSWORD_BLOCK_SIZE;
		const baseKey = getBaseKey(base, extendedBase);
		validateInput(baseKey, baseKeyHash);
		return true;
	} else throw 'incomplete arguements';
}

function getASCIIPassword(combinedPasswordHash, passwordLength) {
	if (combinedPasswordHash && passwordLength) {
		if (passwordLength % PASSWORD_BLOCK_SIZE !== 0) throw 'Password length must be divisible by ' + PASSWORD_BLOCK_SIZE;
		const binaryString = hexToBinary(combinedPasswordHash);
		const blockSize = binaryString.length / passwordLength;
		const binaryStringArray = stringToNJoinArray(binaryString, blockSize);
		const numberArray = binaryArrayToBase10Array(binaryStringArray);
		const ASCIIPassword = ASCIICharsFromNumberArray(numberArray);
		return ASCIIPassword;
	} else throw 'missing arguements';
}
module.exports = {
	WORD_LIST,
	buildPassword,
	getBaseKey,
	callSiteBuilder
}
