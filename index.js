require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory store for simplicity
let urlDatabase = [];
let counter = 1;


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to shorten a URL
app.post('/api/shorturl', function (req, res) {
  const inputUrl = req.body.url;

  // Validate URL format (must start with http/https)
  const urlPattern = /^(http|https):\/\/[^ "]+$/;
  if (!urlPattern.test(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = urlParser.parse(inputUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if already exists
    const found = urlDatabase.find(item => item.original_url === inputUrl);
    if (found) {
      return res.json(found);
    }

    const shortUrl = counter++;
    const newEntry = { original_url: inputUrl, short_url: shortUrl };
    urlDatabase.push(newEntry);
    res.json(newEntry);
  });
});

// GET endpoint to redirect
app.get('/api/shorturl/:short_url', function (req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const found = urlDatabase.find(item => item.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
