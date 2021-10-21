module.exports = ({ env, file }) => ({
	plugins: {
		'postcss-import': {},
		'postcss-custom-media': {},
		'postcss-mixins': {},
		'postcss-nested': {},
		autoprefixer: {},
		// Prefix editor styles with class `editor-styles-wrapper`.
		'postcss-editor-styles':
			file.basename === 'editor.css'
				? {
						scopeTo: '.editor-styles-wrapper',
						ignore: [':root', '.editor-styles-wrapper.editor-styles-wrapper'],
						remove: ['html', ':disabled', '[readonly]', '[disabled]'],
						tags: ['button', 'input', 'label', 'select', 'textarea', 'form'],
				  }
				: false,
		// Minify styles on production using cssano.
		cssnano:
			env === 'production'
				? {
						preset: ['default', { discardComments: { removeAll: true } }],
				  }
				: false,
	},
});
