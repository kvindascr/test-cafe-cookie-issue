const express = require('express');
const cookies = require("cookie-parser");
const cors = require('cors')
const WebSocket = require('ws');
const http = require('http');



const app = express();
const port = 4000;

app.use(cookies());
app.use(cors());

//initialize a simple http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/test-cookies', (req, res) => {
  console.log('test-cookies:', req.cookies['username'], req.cookies['cookie2']);
  if (!req.cookies['username'] || !req.cookies['cookie2']){
    res.status(400).send('No cookies found');
    return;
  }
  res.status(200).send('Cookies found');
})


wss.on('connection', (ws, req) => {
  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {
    //log the received message and send it back to the client
    console.log('received: %s', message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  const hasCookies = req.headers.cookie && req.headers.cookie.includes('testUsername=') && req.headers.cookie.includes('testCookie2=');
  //send immediatly a feedback to the incoming connection
  console.log(`CookiesResult: ${hasCookies ? 'Cookies found' : 'ERROR Cookies NOT found'}`);
  ws.send(hasCookies ? 'Cookies found' : 'ERROR Cookies NOT found');
});




server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
