const fs = require('node:fs');
const crypto = require('crypto');
const wordlists = {
	'bip-39-word-list': readTextFile('bip-39-word-list.txt').split(' ')
}
if (wordlists['bip-39-word-list'].length !== 2048) throw 'bip39 wordlist corrupt!';
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
	const pseudoIntegerSource = pseudoRandomNumber(input); //generate a pseudo random integer from the input
	const checksumIndex = Math.round(pseudoIntegerSource * WORD_LIST.length);
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

function convertBase(str, fromBase, toBase) {
	const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
	const add = (x, y, base) => {
		let z = [];
		const n = Math.max(x.length, y.length);
		let carry = 0;
		let i = 0;
		while (i < n || carry) {
			const xi = i < x.length ? x[i] : 0;
			const yi = i < y.length ? y[i] : 0;
			const zi = carry + xi + yi;
			z.push(zi % base);
			carry = Math.floor(zi / base);
			i++;
		}
		return z;
	}
	const multiplyByNumber = (num, x, base) => {
		if (num < 0) return null;
		if (num == 0) return [];
		let result = [];
		let power = x;
		while (true) {
			num & 1 && (result = add(result, power, base));
			num = num >> 1;
			if (num === 0) break;
			power = add(power, power, base);
		}
		return result;
	}
	const parseToDigitsArray = (str, base) => {
		const digits = str.split('');
		let arr = [];
		for (let i = digits.length - 1; i >= 0; i--) {
			const n = DIGITS.indexOf(digits[i])
			if (n == -1) return null;
			arr.push(n);
		}
		return arr;
	}
	const digits = parseToDigitsArray(str, fromBase);
	if (digits === null) return null;
	let outArray = [];
	let power = [1];
	for (let i = 0; i < digits.length; i++) {
		digits[i] && (outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase));
		power = multiplyByNumber(fromBase, power, toBase);
	}
	let out = '';
	for (let i = outArray.length - 1; i >= 0; i--) out += DIGITS[outArray[i]];
	return out;
}

function pseudoRandomInteger(seed) {
	let hash = sha256(seed);
	return convertBase(hash, 16, 10);
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

function stringToNJoinArray(string, n) {
	isString(string, string);
	isInteger(n, n);
	if (string.length % n !== 0) throw 'string length must be divisible by n';
	const NJoinArray = [];
	for (i = 0; i < string.length; i += n) {
		NJoinArray.push(string.substr(i, n));
	}
	return NJoinArray;
}

function binaryArrayToBase10Array(binaryArray) {
	const base10Array = binaryArray.map((binaryString) => {
		return parseInt(binaryString, 2);
	})
	return base10Array;
}

function ASCIICharsFromNumberArray(numberArray) {
	const charSet = [];
	for (let i = 33; i < 127; i++) {
		charSet.push(String.fromCharCode(i));
	}
	const charSetLength = charSet.length;
	let ASCIIChars = '';
	const chars = numberArray.map((number) => {
		ASCIIChars += charSet[number % charSetLength];
	});
	return ASCIIChars;
}

function base64ToHex(str) {
	const raw = atob(str);
	let result = '';
	for (let i = 0; i < raw.length; i++) {
		const hex = raw.charCodeAt(i).toString(16);
		result += (hex.length === 2 ? hex : '0' + hex);
	}
	return result.toLocaleLowerCase();
}

function hexToBinary(hex) {
	hex = hex.replace("0x", "").toLowerCase();
	var out = "";
	for (var c of hex) {
		switch (c) {
			case '0':
				out += "0000";
				break;
			case '1':
				out += "0001";
				break;
			case '2':
				out += "0010";
				break;
			case '3':
				out += "0011";
				break;
			case '4':
				out += "0100";
				break;
			case '5':
				out += "0101";
				break;
			case '6':
				out += "0110";
				break;
			case '7':
				out += "0111";
				break;
			case '8':
				out += "1000";
				break;
			case '9':
				out += "1001";
				break;
			case 'a':
				out += "1010";
				break;
			case 'b':
				out += "1011";
				break;
			case 'c':
				out += "1100";
				break;
			case 'd':
				out += "1101";
				break;
			case 'e':
				out += "1110";
				break;
			case 'f':
				out += "1111";
				break;
			default:
				return "";
		}
	}
	return out;
}

function hasInvalidASCIIChars(checkString) {
	var invalidCharsFound = false;
	for (var i = 0; i < checkString.length; i++) {
		var charValue = checkString.charCodeAt(i);
		/**
		 * do not accept characters over 127
		 **/
		if (charValue > 127) {
			invalidCharsFound = true;
			break;
		}
	}
	return invalidCharsFound;
}

function getFileNameFromFolderUrl(folderUrl) {
	const pattern = /.*?\/?([\w-]+)\.txt$/gm;
	const fileName = pattern.exec(folderUrl)[1];
	return fileName;
}

function saveFile(fileUrl, content) {
	fs.writeFileSync(fileUrl, content);
	console.log(fileUrl, 'saved successfully');
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
	pseudoRandomInteger,
	getFirstN,
	getLastN,
	stringToNJoinArray,
	binaryArrayToBase10Array,
	ASCIICharsFromNumberArray,
	base64ToHex,
	hexToBinary,
	hasInvalidASCIIChars,
	getFileNameFromFolderUrl,
	saveFile
}
