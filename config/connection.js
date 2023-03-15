const { connect, connection } = require('mongoose');

connect('mongodb://localhost/getSocial', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connection;