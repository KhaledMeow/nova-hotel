const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Replace with your connection string
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('hotel_website'); // Replace with your database name
    const collection = db.collection('rooms'); // Replace with your collection name

    // Example: Insert a document
    await collection.insertOne({ roomType: 'Standard', price: 100, isAvailable: true });
    console.log('Document inserted');
  } finally {
    await client.close();
  }
}

run().catch(console.dir);