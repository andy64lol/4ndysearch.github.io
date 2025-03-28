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
    'https://www.cors-everywhere.herokuapp.com/'
];

function hasExistingBypasser(url) {
    return bypassers.some(bypasser => url.startsWith(bypasser));
}

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
        option.textContent = `Proxy ${index + 1}`;
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
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
    }

    let finalUrl = hasExistingBypasser(targetUrl) ? targetUrl : `${bypassers[currentBypasserIndex]}${encodeURI(targetUrl)}`;

    fetch(finalUrl, { 
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
        console.error('Error:', error);
        
        if (retryCount < bypassers.length - 1) {
            currentBypasserIndex = (currentBypasserIndex + 1) % bypassers.length;
            document.getElementById('cors-bypasser').selectedIndex = currentBypasserIndex;
            alert(`Switching to Proxy ${currentBypasserIndex + 1}`);
            navigate(retryCount + 1);
        } else {
            alert('All proxies failed. Try again later.');
            iframe.srcdoc = `<h1>Error loading page</h1><p>${error.message}</p>`;
        }
    });
}

function goBack() {
    iframe.contentWindow?.history?.back();
}

function goForward() {
    iframe.contentWindow?.history?.forward();
}

function refreshPage() {
    iframe.contentWindow?.location?.reload();
}

urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigate();
});

urlBar.value = 'start_page.html';
navigate();
