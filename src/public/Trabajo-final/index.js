const express = require('express');
const path = require('path');
const ppt = require('./PPTLS/piedraPapelTijera.js')
const app = express();
const PORT = 3000;


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));