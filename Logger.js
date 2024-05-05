const {
	readTextFile,
	saveFile,
	isString
} = require('./factory');
const logFile = process.env.logFile;
class Logger {
	static log(content) {
		isString(content);
		let prevContent = readTextFile(logFile);
		content = prevContent + '\n\n' + content
		saveFile(logFile, content)
	}
	static warn() {
		if (readTextFile(logFile) !== '') {
			console.log('Items STILL in logger!!!');
		} else console.log('logger is empty!!');
	}
	static clear() {
		saveFile(logFile, '');
		console.log('logger cleared');
	}
}
module.exports = {
	Logger
}
