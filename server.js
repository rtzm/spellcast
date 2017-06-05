const express = require('express');
const app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
  console.log("sending index.html")
  res.statusCode = 200;
  res.sendFile( __dirname + "/" + "index.html" );
})

const server = app.listen(3000, function () {
   const host = server.address().address
   const port = server.address().port

   console.log("Spellcast listening at http://%s:%s", host, port)
})

