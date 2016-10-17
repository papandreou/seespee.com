/*global System*/
System.config({
    meta: {
        '*.less': {
            loader: 'node_modules/systemjs-plugin-less/less',
            loaderOptions: {
                relativeUrls: true,
                fileAsRoot: true
            }
        },
        '*.css': {
            loader: 'node_modules/systemjs-plugin-css/css'
        }
    }
});
