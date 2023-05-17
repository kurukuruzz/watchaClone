var express = require('express');
var app = express();
const port = 3000;


app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/singin', (req, res) => {
    res.sendFile(__dirname + '/public/sing_in.html');
})

app.get('/singup', (req, res) => {
    res.sendFile(__dirname + '/public/sing_up.html');
})

app.use((req, res) => {
    res.sendFile(__dirname + "/404.html");
})

app.listen(port, () => {
    console.log('Server is running on port 3000');
});