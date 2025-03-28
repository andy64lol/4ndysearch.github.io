const iframe = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');

function navigate() {
    let url = urlBar.value;
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }
    
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    iframe.src = proxyUrl;
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

urlBar.value = 'https://example.com';
navigate();
