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

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlDatabase = [];
let counter = 1;

//POST the endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err || !parsedUrl.protocol || !parsedUrl.hostname) {
      return res.json({ error: 'invalid url' });
    }

    //Checking if URL already exist in database
    const existingEntry = urlDatabase.find((entry) => entry.original_url === originalUrl);
    if (existingEntry) {
      return res.json({ original_url: existingEntry.original_url, short_url: existingEntry.short_url });
    }

    const shortUrl = counter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Your first API endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
