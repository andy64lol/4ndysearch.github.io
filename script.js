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

function processUrl(inputUrl) {
    let url = inputUrl.trim();
    
    for (const proxy of bypassers) {
        if (url.startsWith(proxy)) {
            url = url.replace(proxy, '');
            break;
        }
    }
    
    if (!isURL(url)) {
        url = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    }
    
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    
    return `${getCurrentProxy()}${encodeURI(url)}`;
}

function handleIframeLinks() {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const links = iframeDoc.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const originalHref = link.href;
            const processedHref = processUrl(originalHref);
            
            link.href = processedHref;
            link.target = '_top';
            
            link.addEventListener('click', e => {
                e.preventDefault();
                urlBar.value = processedHref;
                navigate();
            });
        });
    } catch (error) {
        console.log('Error processing links:', error);
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
    
    iframe.addEventListener('load', handleIframeLinks);
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
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.text();
    })
    .then(data => {
        iframe.srcdoc = data.replace(/<a /g, '<a target="_top" ');
        urlBar.value = targetUrl;
    })
    .catch(error => {
        if (retryCount < bypassers.length - 1) {
            currentBypasserIndex = (currentBypasserIndex + 1) % bypassers.length;
            document.getElementById('cors-bypasser').selectedIndex = currentBypasserIndex;
            navigate(retryCount + 1);
        } else {
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

urlBar.addEventListener('keypress', e => e.key === 'Enter' && navigate());

urlBar.value = 'www.example.com';
navigate();
