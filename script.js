const iframe = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');

let currentBypasserIndex = 0;
const bypassers = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.org/',
    'https://corsproxy.io/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://yacdn.org/proxy/',
    'https://www.cors-everywhere.herokuapp.com/',
    'https://cors.bridged.cc/'
];

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('cors-bypasser');
    bypassers.forEach((bypasser, index) => {
        const option = document.createElement('option');
        option.value = bypasser;
        option.textContent = `Bypasser ${index + 1}`;
        select.appendChild(option);
    });
    select.value = bypassers[0];
});

function updateCorsBypasser() {
    const selectElement = document.getElementById('cors-bypasser');
    currentBypasserIndex = selectElement.selectedIndex;
}

function navigate(retryCount = 0) {
    let targetUrl = urlBar.value.trim();
    
    if (!targetUrl) {
        alert('Please enter a URL or search terms');
        return;
    }

    if (!isURL(targetUrl)) {
        const encodedQuery = encodeURIComponent(targetUrl);
        targetUrl = `https://www.bing.com/search?q=${encodedQuery}`;
    } else {

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
        }
    }

    const proxyUrl = `${bypassers[currentBypasserIndex]}${encodeURI(targetUrl)}`;

    fetch(proxyUrl, { 
        method: 'GET',
        headers: {
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
    })
    .then(data => {
        iframe.srcdoc = data;
    })
    .catch(error => {
        console.error('Error fetching the URL:', error);
        
        if (retryCount < bypassers.length - 1) {
            currentBypasserIndex = (currentBypasserIndex + 1) % bypassers.length;
            document.getElementById('cors-bypasser').selectedIndex = currentBypasserIndex;
            alert(`CORS error detected. Switching to bypasser ${currentBypasserIndex + 1}`);
            navigate(retryCount + 1);
        } else {
            alert('All CORS bypassers failed. Please try again later or use a different query.');
            iframe.srcdoc = `<h1>Error loading page</h1><p>${error.message}</p>`;
        }
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
