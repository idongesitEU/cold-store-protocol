function getDatePadding() {
	let weekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const d = new Date();
	const p = `_${weekNames[d.getDay()]}_${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}`;
	console.log(p);
}
getDatePadding();