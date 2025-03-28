document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value;
    const searchUrl = `/search?q=${encodeURIComponent(query)}`;
    document.getElementById('resultFrame').src = searchUrl;
});
