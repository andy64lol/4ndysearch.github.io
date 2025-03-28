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

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

function getCurrentProxy() {
    return bypassers[currentBypasserIndex];
}

function isAbsoluteUrl(url) {
    return /^https?:\/\//i.test(url);
}

function processUrl(url) {
    if (!isURL(url)) {
        return `${getCurrentProxy()}https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    }
    
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    
    if (url.includes(location.hostname)) {
        const actualUrl = new URL(url).searchParams.get('url') || url.split('?url=')[1] || url;
        if (actualUrl) {
            url = actualUrl;
        }
    }
    
    if (!url.startsWith(getCurrentProxy()) && !bypassers.some(b => url.startsWith(b))) {
        url = `${getCurrentProxy()}${encodeURI(url)}`;
    }
    
    return url;
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
    
    iframe.addEventListener('load', function() {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const links = iframeDoc.querySelectorAll('a[href]');
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    let href = this.getAttribute('href');
                    
                    if (!isAbsoluteUrl(href)) {
                        const iframeLocation = iframe.contentWindow.location;
                        const baseUrl = `${iframeLocation.protocol}//${iframeLocation.host}`;
                        href = new URL(href, baseUrl).href;
                    }
                    
                    if (!href.startsWith(getCurrentProxy())) {
                        href = `${getCurrentProxy()}${encodeURI(href)}`;
                    }
                    
                    urlBar.value = href;
                    navigate();
                });
            });
        } catch (error) {
            console.log('Error processing iframe links:', error);
        }
    });
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

    targetUrl = processUrl(targetUrl);

    fetch(targetUrl, {
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
        urlBar.value = targetUrl;
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
