const fs = require('node:fs');
const crypto = require('crypto');
const wordlists = {
	'bip-39-word-list': readTextFile('bip-39-word-list.txt').split(/\s/)
}
const WORD_LIST = wordlists['bip-39-word-list'];

function sha256(input, algorithm = 'sha256') {
	const hash = crypto.createHash(algorithm);
	hash.update(input);
	return hash.digest('hex');
}
/**
 * performns a sha256 hash function on a given input n times
 * @param {string} input 
 * @param {integer} n 
 */
function sha256NTimes(input, n) {
	if (!input || !n) throw 'missing arguements';
	for (let i = 0; i < n; i++) {
		input = sha256(input);
	}
	return input;
}
/**
 * returns the sha256 hash of a string in base64
 * @param {string} text 
 * @returns {string}
 */
function sha256Base64(text) {
	const hash = crypto.createHash('sha256');
	hash.update(text);
	return hash.digest('base64');
}
/**
 * performs sha256Base64 n number of times
 * @param {string} input 
 * @param {number} n 
 * @returns {string}
 */
function sha256Base64NTimes(input, n) {
	if (!input || !n) throw 'missing arguements';
	for (let i = 0; i < n; i++) {
		input = sha256Base64(input);
	}
	return input;
}
/**
 * verify that the hash of an input is same as a given hash
 * @param {string} input 
 * @param {string} hash 
 */
function validateInput(input, hash) {
	if (sha256(input) != hash) throw 'invalid input!!, hash does not match';
}
/**
 * checks if variable is a valid string
 * @param {string} input
 * @param {string} varName 
 * @returns {boolean}
 */
function isString(input, varName) {
	varName = varName || 'input';
	if (typeof input != 'string') throw `input is not a string, ${varName} must be string`;
	else return true;
}
/**
 * checks if input is a valid integer
 * @param {number} input 
 * @param {string} varName 
 */
function isInteger(input, varName, throwVar = true) {
	varName = varName || 'input';
	if (!input.toString().match(/^[0-9]+$/gm) || input.toString() === input) {
		if (throwVar) throw `${varName} is not an integer, ${varName} must be integer`;
		else return false;
	} else return true;
}
/**
 * read a text file given the url
 * @param {string} fileName 
 * @returns {string}
 */
function readTextFile(fileName) {
	try {
		// Read the file synchronously
		const data = fs.readFileSync(fileName, 'utf8');
		// Display the content of the file
		return data;
	} catch (err) {
		console.error('Error reading the file:', fileName, err);
		//throw error to terminate program
		throw 'terminated at readFile'
	}
}
/**
 * check if a string contains a valid phrase without ending space
 * @param {string} phrase 
 * @param {boolean} throwBol 
 * @returns {boolean}
 */
function isValidPhrase(phrase, throwBol) {
	const isValid = phrase.match(/^([A-Za-z]+\s)+[A-Za-z]+$/gm);
	if (throwBol && !isValid) throw 'invalid phrase';
	else if (isValid) return true;
	else return false;
}
/**
 * get a pseudo random bip39 word of a phrase
 * @param {string} input 
 * @returns {string}
 */
function pseudoRandomChecksumWord(input) {
	isValidPhrase(input, true); //end if input is not valid phrase
	isString(input) //check if input is strring
	const pseudoInteger = pseudoRandomNumber(input); //generate a pseudo random integer from the input
	const checksumIndex = Math.round(pseudoInteger * WORD_LIST.length);
	const checksumWord = WORD_LIST[checksumIndex];
	return checksumWord;
}
/**
 * Generates a pseudo random number between 0 and 1 from a string
 * @param {string} seed 
 * @returns {number}
 */
function pseudoRandomNumber(seed) {
	isString(seed);
	const hash = sha256(seed);
	const MAX_64_LENGTH_HEX = 'f'.repeat(64);
	const integer = divideHexAsBase10(hash, MAX_64_LENGTH_HEX);
	return integer;
}

function getWord(wordNumber) {
	isInteger(wordNumber);
	if (wordNumber >= 1 && wordNumber <= WORD_LIST.length) {
		return WORD_LIST[wordNumber - 1];
	} else throw "word number must be greater than 1 and less than the length of the word list "
}
/**
 * divide 2 hex numbers and return the quotient in base 10
 * @param {string} numerator 
 * @param {string} denominator 
 * @returns {number}
 */
function divideHexAsBase10(numerator, denominator) {
	numerator = parseInt(numerator, 16);
	denominator = parseInt(denominator, 16);
	const quotient = numerator / denominator;
	return quotient;
}
/**
 * get first n characters in a string 
 * @param {string} string 
 * @param {number} n 
 */
function getFirstN(string, n) {
	isInteger(n, n);
	if (n >= 1 && n <= string.length) {
		let characters = '';
		for (let i = 0; i < n; i++) {
			characters += string[i];
		}
		return characters;
	} else throw 'n must be greater than or equal to 1 and less than the string length';
}
/**
 * get last n characters in a string
 * @param {string} string 
 * @param {number} n 
 */
function getLastN(string, n) {
	isInteger(n, n);
	if (n >= 1 && n <= string.length) {
		let characters = [];
		for (let i = string.length - 1; i > string.length - n - 1; i--) {
			characters.unshift(string[i]);
		}
		return characters.join('');
	} else throw 'n must be greater than or equal to 1 and less than the string length';
}
module.exports = {
	WORD_LIST,
	sha256,
	sha256NTimes,
	sha256Base64,
	sha256Base64NTimes,
	validateInput,
	isString,
	isInteger,
	readTextFile,
	pseudoRandomChecksumWord,
	pseudoRandomNumber,
	getFirstN,
	getLastN
}
