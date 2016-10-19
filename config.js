/*global System*/
System.config({
    baseURL: '/',
    transpiler: 'plugin-babel',

    devConfig: {
        inlineCssSourceMaps: true,
        cssNano: false
    },

    packages: {
        // Work around .js being appended to .css and .less
        // Will be unnecessary once the default extension support is removed from system.js:
        '': {},
        'node_modules/systemjs-plugin-less': {
            map: {
                css: 'node_modules/systemjs-plugin-css',
                lesscss: {
                    node: '@node/less',
                    browser: 'node_modules/less/dist/less.min.js'
                }
            }
        }
    },

    meta: {
        '*.less': {},
        '*.css': {}
    },

    map: {
        less: 'node_modules/systemjs-plugin-less/less',
        asset: 'node_modules/systemjs-asset-plugin/asset-plugin.js',
        'plugin-babel': 'node_modules/systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build': 'node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
        bootstrap: 'node_modules/bootstrap'
    }
});
