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
    getLastN
} = require('./factory');

function buildPassword(base, padding, baseKeyHash, siteName, callback, wordLength = 20){
    const NUMBER_OF_HASHES = 10**3;
    isString(base);
    isString(padding);
    isString(baseKeyHash);
    isString(siteName);
    if(siteName === '') throw 'site name cannot be empty';
    if(siteName.toLowerCase() != siteName) throw 'site name must be in lower case';
    const baseChecksumWord = pseudoRandomChecksumWord(base);
    const paddingArray = padding.split(/\s/);
    const firstPadding = paddingArray[0], secondPadding = paddingArray[1];
    const baseKey = `${firstPadding} ${base} ${baseChecksumWord} ${secondPadding}`;
    validateInput(baseKey, baseKeyHash);
    const baseKeySitePseudoRandomNumber = pseudoRandomNumber(`${baseKey} ${siteName}`);
    const rawPassword = `${baseKey} ${baseKeySitePseudoRandomNumber}`;
    if(NUMBER_OF_HASHES !== 10**7) console.log('WARNING!! NUMBER OF HASHES IS NOT 10,000,000\nnumber of hashes is currently '+NUMBER_OF_HASHES);
    const rawPasswordHexHash = sha256NTimes(rawPassword, NUMBER_OF_HASHES);
    const rawPasswordBase64Hash = sha256Base64NTimes(rawPassword, NUMBER_OF_HASHES);
    if(wordLength%4 != 0) throw 'word length must be divisible by 4';
    const portionLength = wordLength/4;
    const firstHex = getFirstN(rawPasswordHexHash, portionLength), firstBase64 = getFirstN(rawPasswordBase64Hash, portionLength);
    const lastHex = getLastN(rawPasswordHexHash, portionLength), lastBase64 = getLastN(rawPasswordBase64Hash, portionLength);
    const password = firstHex + firstBase64 + lastHex + lastBase64;
    console.log(portionLength, wordLength);
    console.log(baseKey, baseKeySitePseudoRandomNumber);
    console.log(rawPassword);
    console.log(rawPasswordHexHash, rawPasswordBase64Hash);
    console.log(firstHex, firstBase64);
    console.log(lastHex, lastBase64);
    console.log(password);
}

module.exports = {
    WORD_LIST,
    buildPassword
}