import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME || 'quest');
  const a1Teams = await db.collection('arena1_teams').find().toArray();
  console.log("Arena1 Teams:");
  for (const t of a1Teams) {
    console.log(`- ${t._id}: ${t.name}`);
  }
  process.exit(0);
}
run();
