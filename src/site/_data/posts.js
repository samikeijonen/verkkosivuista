const fetchData = require('../helpers/fetchData.js');

const endPoint = 'https://foxland.foxnet.fi/wp-json/wp/v2/posts?_embed&per_page=10';

module.exports = async function fetchPosts() {
	return fetchData('posts', endPoint);
};
