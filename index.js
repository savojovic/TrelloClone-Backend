const express = require('express')
const app = express()
const port = 5000

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.use('/api/v1/members', require('./public/api/v1/members'));
app.use('/api/v1/board', require('./public/api/v1/board'));
app.use('/api/v1/list', require('./public/api/v1/list'));
app.use('/api/v1/token', require('./public/api/v1/token'));
app.use('/api/v1/app_key', require('./public/api/v1/app_key'));
app.use('/register', require('./public/register'))
app.use('/api/v1/cards', require('./public/api/v1/cards'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



//podaci za admin admin
// const app_key = "21232f297a57a5a743894a0e4a801fc3"
// const app_token = "465c194afb65670f38322df087f0a9bb225cc257e43eb4ac5a0c98ef5b3173ac"

//pravi trello
// const app_key = "b1d26eaa13c9a50eda759ec6580344fc"
// const app_token = "ac4e5383b2b706bf4a19a47c3dc109197329daa95b61eb9f34a08cee09656969"
