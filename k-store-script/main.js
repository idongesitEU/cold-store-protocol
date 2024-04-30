const {
	buildPassword
} = require("./password-builder");
const BASE_KEY_HASH = '' + process.env.BASE_KEY_HASH;
const SITE_NAME = NAME_OF_SITE;
buildPassword(process.env.BASE, process.env.PADDING, BASE_KEY_HASH, SITE_NAME);
