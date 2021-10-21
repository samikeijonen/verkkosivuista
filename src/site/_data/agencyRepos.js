const fetchData = require('../helpers/fetchData.js');
const agencies = require('./agencies.json');

module.exports = async function fetchPosts() {
	let agencyRepos = {};

	for(let agency of agencies.items) {
		const data =
		agency.repoApi
		? await fetchData(`${agency.slug}-repos`, `${agency.repoApi}?per_page=3&sort=pushed`, 1)
		: [];
		agencyRepos[agency.slug] = data;
	}

	return agencyRepos;
};
