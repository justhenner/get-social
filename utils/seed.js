const connection = require('../config/connection');
const { Thought , User } = require('../models');
const { users, thoughts } = require('./data');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');

  await Thought.deleteMany({});

  await User.deleteMany({});

  await User.collection.insertMany(users);
  
  await Thought.collection.insertMany(thoughts);
  
  console.table(users);
  console.table(thoughts);
  console.info('Seeding complete!');
  process.exit(0);
});