import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'quest';
const client = new MongoClient(uri);

// These are swap pool questions — assigned to locations but not bound to rounds.
// They are pulled in dynamically when a team triggers a swap.
const swapPoolQuestions = [
  {
    swapIndex: 1,
    title: "Count Uppercase and Lowercase Letters",
    hint: "Write a program to count the number of uppercase and lowercase letters in the given string. Return in the format 'Upper: X, Lower: Y'.",
    testCases: [
      { input: "Hello World", output: "Upper: 2, Lower: 8" },
      { input: "ABCdef", output: "Upper: 3, Lower: 3" },
      { input: "python", output: "Upper: 0, Lower: 6" }
    ],
    output: "Upper: X, Lower: Y",
    place: "Swap Location 1",
    lat: "15°25'59.1\"N",
    lng: "75°38'56.7\"E",
    qrPasskey: "SWAP-S1",
    locationQrCode: "SWAP-LOC-S1"
  },
  {
    swapIndex: 2,
    title: "Pyramid Pattern",
    hint: "Write a program to print a right-angle pyramid pattern of stars. Input is the number of rows N. Each row should have the corresponding number of stars, separated by a newline.",
    testCases: [
      { input: "3", output: "*\n**\n***" },
      { input: "5", output: "*\n**\n***\n****\n*****" },
      { input: "1", output: "*" }
    ],
    output: "Pyramid pattern of stars",
    place: "Swap Location 2",
    lat: "15°25'56.8\"N",
    lng: "75°38'50.9\"E",
    qrPasskey: "SWAP-S2",
    locationQrCode: "SWAP-LOC-S2"
  },
  {
    swapIndex: 3,
    title: "Fibonacci Series",
    hint: "Write a program to generate the first N terms of the Fibonacci series. Return the terms as space-separated numbers.",
    testCases: [
      { input: "5", output: "0 1 1 2 3" },
      { input: "8", output: "0 1 1 2 3 5 8 13" },
      { input: "1", output: "0" }
    ],
    output: "Space-separated Fibonacci numbers",
    place: "Swap Location 3",
    lat: "15°25'59.6\"N",
    lng: "75°38'49.1\"E",
    qrPasskey: "SWAP-S3",
    locationQrCode: "SWAP-LOC-S3"
  },
  {
    swapIndex: 4,
    title: "Sum of Principal Diagonal Elements",
    hint: "Find the sum of the principal diagonal elements of a square matrix. Input is rows of the matrix separated by newlines, with each row's elements space-separated. e.g., '1 2\\n3 4'.",
    testCases: [
      { input: "1 2\n3 4", output: "5" },
      { input: "1 0 0\n0 5 0\n0 0 9", output: "15" },
      { input: "2 3 4\n5 6 7\n8 9 10", output: "18" }
    ],
    output: "Sum of diagonal elements",
    place: "Swap Location 4",
    lat: "15°26'06.6\"N",
    lng: "75°38'52.4\"E",
    qrPasskey: "SWAP-S4",
    locationQrCode: "SWAP-LOC-S4"
  },
  {
    swapIndex: 5,
    title: "Find Second Largest",
    hint: "Write a program to find the second largest element in an array. Input is a space-separated list of numbers.",
    testCases: [
      { input: "10 20 30 40 50", output: "40" },
      { input: "5 5 4 3", output: "4" },
      { input: "100 1 50", output: "50" }
    ],
    output: "Second largest element",
    place: "Swap Location 5",
    lat: "15°25'59.7\"N",
    lng: "75°38'53.4\"E",
    qrPasskey: "SWAP-S5",
    locationQrCode: "SWAP-LOC-S5"
  },
  {
    swapIndex: 6,
    title: "Selection Sort",
    hint: "Implement the Selection Sort algorithm to sort an array in ascending order. Input is a space-separated list of numbers. Return sorted numbers separated by space.",
    testCases: [
      { input: "64 25 12 22 11", output: "11 12 22 25 64" },
      { input: "3 1 2", output: "1 2 3" },
      { input: "9 7 5 3 1", output: "1 3 5 7 9" }
    ],
    output: "Sorted space-separated numbers",
    place: "Swap Location 6",
    lat: "15°26'05.6\"N",
    lng: "75°38'49.8\"E",
    qrPasskey: "SWAP-S6",
    locationQrCode: "SWAP-LOC-S6"
  },
  {
    swapIndex: 7,
    title: "Remove Duplicate Characters from String",
    hint: "Write a program to remove duplicate characters from a string, keeping only the first occurrence of each character. Return the resulting string.",
    testCases: [
      { input: "programming", output: "progamin" },
      { input: "hello", output: "helo" },
      { input: "aabbcc", output: "abc" }
    ],
    output: "String with duplicates removed",
    place: "Swap Location 7",
    lat: "15°25'56.3\"N",
    lng: "75°38'57.2\"E",
    qrPasskey: "SWAP-S7",
    locationQrCode: "SWAP-LOC-S7"
  },
  {
    swapIndex: 8,
    title: "GCD (Greatest Common Divisor)",
    hint: "Write a program to find the GCD (Greatest Common Divisor) of two numbers. Input is two numbers separated by a space.",
    testCases: [
      { input: "48 18", output: "6" },
      { input: "100 75", output: "25" },
      { input: "7 5", output: "1" }
    ],
    output: "GCD of two numbers",
    place: "Swap Location 8",
    lat: "15°25'56.8\"N",
    lng: "75°38'50.9\"E",
    qrPasskey: "SWAP-S8",
    locationQrCode: "SWAP-LOC-S8"
  }
];

async function seed() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('swappool');

    console.log('Clearing existing swap pool questions...');
    await collection.deleteMany({});

    const now = new Date();
    const docs = swapPoolQuestions.map(q => ({
      swapIndex: q.swapIndex,
      p1: {
        title: q.title,
        language: "python",
        code: "",
        hint: q.hint,
        ans: "",
        output: q.output,
        testCases: q.testCases
      },
      coord: {
        lat: q.lat,
        lng: q.lng,
        place: q.place
      },
      qrPasskey: q.qrPasskey,
      locationQrCode: q.locationQrCode,
      cx: 0.5,
      cy: 0.5,
      isAvailable: true,
      createdAt: now,
      updatedAt: now
    }));

    await collection.insertMany(docs as any);
    console.log(`Successfully seeded ${docs.length} swap pool questions.`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seed();
