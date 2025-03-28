const iframe = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');

let currentBypasserIndex = 0; // Initialize the index for the CORS bypassers
const bypassers = [
    'https://cors-anywhere.herokuapp.com/',
    'https://another-cors-proxy.com/'
];

function updateCorsBypasser() {
    const selectElement = document.getElementById('cors-bypasser');
    const selectedBypasser = selectElement.value;
    currentBypasserIndex = bypassers.indexOf(selectedBypasser);
}


function navigate() {
    let url = urlBar.value;
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }
    
    const proxyUrl = `${bypassers[currentBypasserIndex]}${url}`;
    
    fetch(proxyUrl, { method: 'GET', headers: {
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
    }})
        .then(response => response.text())
        .then(data => {
            iframe.srcdoc = data;
        })
        .catch(error => {
            console.error('Error fetching the URL:', error);
        });
}

function goBack() {
    iframe.contentWindow.history.back();
}

function goForward() {
    iframe.contentWindow.history.forward();
}

function refreshPage() {
    iframe.contentWindow.location.reload();
}

urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigate();
});

urlBar.value = 'start_page.html';
navigate();
