const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginSvgSprite = require("eleventy-plugin-svg-sprite")
// const pluginPageAssets = require('eleventy-plugin-page-assets')
const markdownIt = require('markdown-it')
const markdownItAttrs = require('markdown-it-attrs')
const markdownItFootnote = require("markdown-it-footnote")
const markdownItAnchor = require("markdown-it-anchor")
const markdownItToCDoneRight= require("markdown-it-toc-done-right")

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')

const IS_PRODUCTION = process.env.ELEVENTY_ENV === 'production'

const CONTENT_GLOBS = {
    articles: 'src/articles/**/*.md',
    notes: 'src/notes/*.md',
    media: '*.jpg|*.jpeg|*.png|*.gif|*.mp4|*.webp|*.webm'
}

module.exports = function (config) {
    // Plugins
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)
    config.addPlugin(pluginSvgSprite, {
        path: "./src/assets/icons",
        svgSpriteShortcode: "iconsprite"
    })

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    let markdownItOptions = {
        html: true, 
        breaks: true, 
        linkify: true, 
        typographer: true
    };
    let markdownLib = markdownIt(markdownItOptions)
                        .use(markdownItAttrs)
                        .use(markdownItFootnote)
                        .use(markdownItAnchor, {
                            permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true })
                        })
                        .use(markdownItToCDoneRight)
    //TODO:!! add [num] infront of footnotes
    markdownLib.renderer.rules.footnote_block_open = () => (
        
        '<section class="footnotes">\n' +
        '<h4 class="mt-3">Footnotes</h4>\n' +
        '<ol class="footnotes-list">\n'
    );
    config.setLibrary('md', markdownLib)

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('article', 'article.njk')

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')

    // Pass-through for article-images
    config.addPassthroughCopy('src/articles/*/*.{jpg,jpeg,png,gif,mp4,webp,webm,avif}')
    
    //SuperDuperStatic directories
    //config.addPassthroughCopy('cv')

    // Deep-Merge
    config.setDataDeepMerge(true)

    // Base Config
    return {
        passthroughFileCopy: true,
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
