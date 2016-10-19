var express = require('express');
var seespee = require('seespee');
var purify = require('purify');
var HttpError = require('httperrors');

var pathModule = require('path');

var isProduction = process.env.NODE_ENV === 'production';
var publicDir = pathModule.resolve(__dirname);

express()
    .use('/api/1', express()
        .get('/csp', function (req, res, next) {
            var url = purify.url(req.query.url);
            if (url) {
                seespee(url).then(function (result) {
                    var assetGraph = result.assetGraph;
                    result.additions = {};
                    result.policies.forEach(function (policy) {
                        Object.keys(policy.additions).forEach(function (directive) {
                            result.additions[directive] = {};
                            Object.keys(policy.additions[directive]).forEach(function (origin) {
                                result.additions[directive][origin] = policy.additions[directive][origin].map(function (relation) {
                                    return relation.id;
                                });
                            });
                        });
                    });
                    delete result.policies;
                    result.relations = {};
                    assetGraph.findRelations({}, true).forEach(function (relation) {
                        result.relations[relation.id] = {
                            type: relation.type,
                            from: relation.from.id,
                            to: relation.to.id || relation.to.url
                        };
                    });
                    result.assets = {};
                    assetGraph.findAssets({}).forEach(function (asset) {
                        result.assets[asset.id] = {
                            url: asset.urlOrDescription
                        };
                    });
                    delete result.assetGraph;
                    res.send(result);
                });
            } else {
                next(new HttpError.BadRequest());
            }
        })
    )
    .use(require('express-extractheaders')({memoize: isProduction}))
    .use(function setAdditionalHeadersForStaticFiles(req, res, next) {
        if (/(?:js|css)(?:\?|$)/.test(req.url)) {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Strict-Transport-Security', 'max-age=31536000'); // 1 year
        next();
    })
    .use('/static', express.static(pathModule.resolve(publicDir, 'static'), {maxAge: isProduction ? 365 * 24 * 60 * 60 : 0}))
    .use(function (req, res, next) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.setHeader('Expires', '-1');
        next();
    })
    .use(express.static(publicDir, {maxAge: 0}))
    .listen(1337);

console.log('Listening to port 1337');
