const fetchData = require('../helpers/fetchData.js');
const agencies = require('./agencies.json');

module.exports = async function fetchPosts() {
	let agencyPosts = {};

	for(let agency of agencies.items) {
		const data = await fetchData(agency.slug, `${agency.restPosts}?_embed&per_page=3&_fields=date,id,excerpt,title,link`, 1);
		agencyPosts[agency.slug] = data;
	}

	return agencyPosts;
};
