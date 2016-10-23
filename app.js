import 'app.less';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap/js/tooltip.js';

$("body").tooltip({ selector: '[data-toggle=tooltip]' });

var form = document.getElementById('form');
var inputField = document.getElementById('url');
var resultsUl = document.getElementById('results');
var progressBar = document.getElementById('progress');

progressBar.style.display = 'none';

form.addEventListener('submit', function (event) {
    event.preventDefault();
    inputField.disabled = 'disabled';
    var url = inputField.value;
    if (!/^https?:/.test(url)) {
        url = 'http://' + url;
    }
    progressBar.style.display = '';
    while (resultsUl.firstChild) {
        resultsUl.removeChild(resultsUl.firstChild);
    }

    fetch('/api/1/csp/?url=' + encodeURIComponent(url))
        .then(function (response) {
            if (response.status !== 200) {
                alert('Unexpected status code: ' + response.status);
            } else if (!/^application\/json\b/.test(response.headers.get('Content-Type'))) {
                alert('Unexpected response type: ' + response.headers.get('Content-Type'));
            } else {
                return response.json().then(function (obj) {
                    Object.keys(obj.parseTree).forEach(function (directive) {
                        var li = document.createElement('li');
                        li.className = 'list-group-item';
                        var directiveSpan = document.createElement('span');
                        directiveSpan.className = 'directive';
                        directiveSpan.appendChild(document.createTextNode(directive));
                        li.appendChild(directiveSpan);
                        obj.parseTree[directive].forEach(function (sourceExpression) {
                            li.appendChild(document.createTextNode(' '));
                            var labelSpan = document.createElement('span');
                            labelSpan.className = 'label label-primary';
                            labelSpan.appendChild(document.createTextNode(sourceExpression));
                            var tooltipText;
                            var relationIds = obj.additions[directive] && obj.additions[directive][sourceExpression];
                            if (relationIds) {
                                var tooltipText = relationIds.map(function (relationId) {
                                    var relationInfo = obj.relations[relationId];
                                    return relationInfo.type + ' in ' + obj.assets[relationInfo.from].url;
                                }).join('\n');
                            } else if (sourceExpression === "'unsafe-inline'") {
                                tooltipText = 'The page contains at least one inline ' + (directive === 'style-src' ? 'stylesheet' : 'script') +
                                    ', so this token is needed for browsers that only support CSP level 1. It will be ignored by CSP2+ compliant browsers due to the presence of hashes.';
                            } else if (sourceExpression === "'none'") {
                                if (directive === 'default-src') {
                                    tooltipText = 'Disallow all types of content that are not explicitly listed. This is a good starting point.';
                                } else {
                                    tooltipText = 'Allow no content of this type.'
                                }
                            }
                            if (tooltipText) {
                                labelSpan.setAttribute('title', tooltipText);
                                labelSpan.setAttribute('data-toggle', 'tooltip');
                                labelSpan.setAttribute('data-placement', 'bottom');
                            }
                            li.appendChild(labelSpan);
                        });
                        li.appendChild(document.createTextNode(';'));
                        resultsUl.appendChild(li);
                    });
                });
            }
        })
        .then(function () {
            progressBar.style.display = 'none';
            inputField.disabled = 'disabled';
        });

    return false;
});
