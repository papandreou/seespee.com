import 'app.less';
import 'bootstrap/dist/css/bootstrap.min.css';

var form = document.getElementById('form');
var inputField = document.getElementById('url');
var resultTextArea = document.getElementById('result');
var progressBar = document.getElementById('progress');

progressBar.style.display = 'none';

form.addEventListener('submit', function (event) {
    event.preventDefault();
    var url = inputField.value;
    if (!/^https?:/.test(url)) {
        url = 'http://' + url;
    }
    progressBar.style.display = '';
    fetch('/api/1/csp/?url=' + encodeURIComponent(url))
        .then(function (response) {
            return response.json();
        })
        .then(function (obj) {
            progressBar.style.display = 'none';
            resultTextArea.className = 'ready';
            resultTextArea.value = obj.contentSecurityPolicy.replace(/; /g, ';\n');
        });

    return false;
});
