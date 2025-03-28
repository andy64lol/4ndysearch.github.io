const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/search', async (req, res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching results');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
