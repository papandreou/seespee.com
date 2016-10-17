var express = require('express');
var seespee = require('seespee');
var purify = require('purify');
var HttpError = require('httperrors');

var pathModule = require('path');

var isProduction = process.env.NODE_ENV === 'production';
var publicDir = pathModule.resolve(__dirname, 'http-pub');

express()
    .use('/api/1', express()
        .get('/csp', function (req, res, next) {
            var url = purify.url(req.query.url);
            if (url) {
                seespee(url).then(function (result) {
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
