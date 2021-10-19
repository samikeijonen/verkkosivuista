const flatcache = require('flat-cache');
const path = require('path');

const getNumPages = require('./getNumPages.js');
const getCacheKey = require('./getCacheKey.js');
const fetchAll = require('./fetchAll.js');

module.exports = async function fetchOnce(type, endPoint) {
	const cache = flatcache.load(type, path.resolve('./src/site/_datacache'));
	const key = getCacheKey();
	const cachedData = cache.getKey(key);

	// Fetch again if we don't have cache.
	if (!cachedData) {
		// Fetch all.
		const allPosts = await fetchAll(numPages, endPoint);

		// Set and save cache.
		cache.setKey(key, allPosts);
		cache.save();
		return allPosts;
	}

	// And return them.
	return cachedData;
};
