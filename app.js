import 'app.less';

var form = document.getElementById('form');
var inputField = document.getElementById('url');
var resultTextArea = document.getElementById('result');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    var url = inputField.value;
    if (!/^https?:/.test(url)) {
        url = 'http://' + url;
    }
    fetch('/api/1/csp/?url=' + encodeURIComponent(url))
        .then(function (response) {
            return response.json();
        })
        .then(function (obj) {
            resultTextArea.className = 'ready';
            resultTextArea.value = obj.contentSecurityPolicy.replace(/; /g, ';\n');
        });

    return false;
});
