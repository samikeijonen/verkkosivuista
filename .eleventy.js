const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");
const eleventyImage = require("@11ty/eleventy-img");

const isDev = process.env.NODE_ENV === "development";

const shortcodes = {
	image: async function(filepath, alt, widths, classes, sizes) {
		let options = {
			formats: ["avif", "webp", "png"],
			widths: widths || [null],
			urlPath: "/img/built/",
			outputDir: "./dist/img/built/",
		};

		let stats;
		if(process.env.ELEVENTY_SERVERLESS) {
			stats = eleventyImage.statsSync(filepath, options);
		} else {
			stats = await eleventyImage(filepath, options);
		}

		return eleventyImage.generateHTML(stats, {
			alt,
			loading: "lazy",
			decoding: "async",
			sizes: sizes || "(min-width: 32em) 40vw, 100vw",
			class: classes || "image",
		});
	},
	getScreenshotHtml: async function(siteSlug, siteUrl, widths, classes, sizes) {
		let filepath = `./src/img/screenshots/${siteSlug}.png`;

		let options = {
			formats: ["jpeg"], // we don’t use AVIF here because it was a little too slow!
			widths: widths || [null],
			urlPath: "/img/built/",
			outputDir: "./dist/img/built/",
		};

		let stats = await eleventyImage(filepath, options);

		return eleventyImage.generateHTML(stats, {
			alt: `Kuvankaappaus sivustosta ${siteUrl}`,
			loading: "lazy",
			decoding: "async",
			sizes: sizes || "(min-width: 32em) 40vw, 100vw",
			class: classes || "sites-screenshot",
		});
	}
};

module.exports = function(eleventyConfig) {
	// Layout aliases make templates more portable.
	eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

	// Adds a universal shortcode to embed bundled CSS. In Nunjack templates: {% bundledCss %}
	eleventyConfig.addShortcode("bundledCss", function() {
		return `<link href="/assets/main.css" rel="stylesheet" />`;
	});

	// Adds a universal shortcode to embed bundled JS. In Nunjack templates: {% bundledJs %}
	eleventyConfig.addShortcode("bundledJs", function() {
		return `<script src="/assets/main.js"></script>`;
	});

	// Images and screenshots.
	eleventyConfig.addNunjucksAsyncShortcode("image", shortcodes.image);
	eleventyConfig.addNunjucksAsyncShortcode("getScreenshotHtml", shortcodes.getScreenshotHtml);

	// Readable date.
	eleventyConfig.addFilter("readableDate", (dateObj) => {
		return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat("dd.LL.yyyy");
	});

	// Valid date string.
	// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get path from URL.
	eleventyConfig.addFilter('urlPath', (fullUrl) => {
		const url = new URL(fullUrl);
		return url.pathname.replace(/\/+$/, '');
	});

	// Get post author by ID.
	eleventyConfig.addFilter('thisPostAuthor', (array, ID) => {
		return array.filter( user => {
			return user.id === ID;
		});
	});

	// Get post comments by ID.
	eleventyConfig.addFilter('thisPostComments', (array, ID) => {
		return array.filter( item => {
			return item.post === ID;
		});
	});

	// Get posts by tag IDs.
	eleventyConfig.addFilter('postsByTagId', (array, ID) => {
		return array.filter( item => {
			return item.tags.includes(ID);
		});
	});

	// Get posts by category IDs.
	eleventyConfig.addFilter('postsByCategoryId', (array, ID) => {
		return array.filter( item => {
			return item.categories.includes(ID);
		});
	});

	// Get post tags by array of tag IDs in that post.
	eleventyConfig.addFilter('thisPostTags', (allTags, postTags) => {
		return allTags.filter( item => {
			return postTags.includes(item.id);
		});
	});

	// Get post categories by array of category IDs in that post.
	eleventyConfig.addFilter('thisPostCategories', (allCategories, postCategories) => {
		return allCategories.filter( item => {
			return postCategories.includes(item.id);
		});
	});

	// A debug utility.
	eleventyConfig.addFilter("dump", obj => {
		return util.inspect(obj);
	});

	eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
		if( outputPath.endsWith('.html') ) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true
		});

			return minified;
		}

		return content;
	});

	// Copy all images directly to dist.
	eleventyConfig.addPassthroughCopy({ "src/img": "img" });

	// Copy all fonts directly to dist.
	eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });

	// Copy external dependencies to dist.
	eleventyConfig.addPassthroughCopy({ "src/vendor": "vendor" });

	// Reload the page every time the CSS/JS are changed.
	eleventyConfig.setBrowserSyncConfig({ files: [ 'dist/assets/**/*.css', 'dist/assets/**/*.js' ] });

	return {
		dir: {
			input: "src/site",
			includes: "_includes", // relative to dir.input
			output: "dist",
		},
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		passthroughFileCopy: true,
	};
};
