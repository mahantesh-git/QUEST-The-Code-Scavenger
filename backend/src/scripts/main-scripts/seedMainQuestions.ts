import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'quest';
const client = new MongoClient(uri);

const mainQuestions = [
  {
    round: 1,
    title: "Palindrome Check",
    hint: "Write a program to check whether the given string is palindrome or not. Return 'Yes' or 'No'.",
    testCases: [
      { input: "madam", output: "Yes" },
      { input: "hello", output: "No" },
      { input: "racecar", output: "Yes" }
    ],
    output: "Yes or No",
    place: "Location 1",
    lat: "15°26'03.7\"N",
    lng: "75°38'53.4\"E",
    qrPasskey: "QUEST-R1",
    locationQrCode: "QUEST-LOC-R1"
  },
  {
    round: 2,
    title: "Search Element",
    hint: "Write a program to search an element in an array (space-separated list). The input contains the array and the target element, separated by a comma. e.g., '1 2 3, 2'. Return 'Found' or 'Not Found'.",
    testCases: [
      { input: "1 2 3 4 5, 3", output: "Found" },
      { input: "10 20 30, 50", output: "Not Found" },
      { input: "apple banana cherry, banana", output: "Found" }
    ],
    output: "Found or Not Found",
    place: "Location 2",
    lat: "15°26'02.5\"N",
    lng: "75°38'51.6\"E",
    qrPasskey: "QUEST-R2",
    locationQrCode: "QUEST-LOC-R2"
  },
  {
    round: 3,
    title: "Count Vowels",
    hint: "Write a program to count the number of vowels in a given string.",
    testCases: [
      { input: "education", output: "5" },
      { input: "hello", output: "2" },
      { input: "rhythm", output: "0" }
    ],
    output: "Count of vowels",
    place: "Location 3",
    lat: "15°25'59.9\"N",
    lng: "75°38'50.9\"E",
    qrPasskey: "QUEST-R3",
    locationQrCode: "QUEST-LOC-R3"
  },
  {
    round: 4,
    title: "Sort Array",
    hint: "Write a program to sort the array elements in ascending order without using built-in functions. Input is a space-separated list of numbers. Return sorted numbers separated by space.",
    testCases: [
      { input: "5 2 9 1 5", output: "1 2 5 5 9" },
      { input: "10 5 1", output: "1 5 10" },
      { input: "3 3 1", output: "1 3 3" }
    ],
    output: "Sorted space-separated numbers",
    place: "Location 4",
    lat: "15°25'58.6\"N",
    lng: "75°38'58.4\"E",
    qrPasskey: "QUEST-R4",
    locationQrCode: "QUEST-LOC-R4"
  },
  {
    round: 5,
    title: "Maximum Difference",
    hint: "Find the maximum difference between any two elements in an array (space-separated list).",
    testCases: [
      { input: "10 3 6 8 20", output: "17" },
      { input: "1 5 10", output: "9" },
      { input: "100 10 50", output: "90" }
    ],
    output: "Maximum difference",
    place: "Location 5",
    lat: "15°26'07.5\"N",
    lng: "75°38'50.0\"E",
    qrPasskey: "QUEST-R5",
    locationQrCode: "QUEST-LOC-R5"
  },
  {
    round: 6,
    title: "Missing Number",
    hint: "Given numbers from 1 to N with one number missing, find the missing number. Input is space-separated numbers and the last value N is provided after a comma. e.g., '1 2 4 5, 5'.",
    testCases: [
      { input: "1 2 4 5, 5", output: "3" },
      { input: "2 3 4, 4", output: "1" },
      { input: "1 2 3, 4", output: "4" }
    ],
    output: "Missing number",
    place: "Location 6",
    lat: "15°26'05.1\"N",
    lng: "75°38'48.1\"E",
    qrPasskey: "QUEST-R6",
    locationQrCode: "QUEST-LOC-R6"
  },
  {
    round: 7,
    title: "Character Frequency",
    hint: "Count frequency of each character in a string. Return in format 'char:count' separated by comma and space in order of appearance.",
    testCases: [
      { input: "hello", output: "h:1, e:1, l:2, o:1" },
      { input: "aaa", output: "a:3" },
      { input: "test", output: "t:2, e:1, s:1" }
    ],
    output: "char:count pairs",
    place: "Location 7",
    lat: "15°26'00.4\"N",
    lng: "75°38'48.2\"E",
    qrPasskey: "QUEST-R7",
    locationQrCode: "QUEST-LOC-R7"
  },
  {
    round: 8,
    title: "Special Characters",
    hint: "Count special characters (non-alphanumeric) in a string.",
    testCases: [
      { input: "hello@123!", output: "2" },
      { input: "abc123", output: "0" },
      { input: "#$%^", output: "4" }
    ],
    output: "Count of special characters",
    place: "Location 8",
    lat: "15°25'57.8\"N",
    lng: "75°38'54.6\"E",
    qrPasskey: "QUEST-R8",
    locationQrCode: "QUEST-LOC-R8"
  },
  {
    round: 9,
    title: "Common Elements",
    hint: "Find common elements in two arrays. Input is two space-separated arrays separated by a comma. Return common elements separated by space in order of first array.",
    testCases: [
      { input: "1 2 3, 2 3 4", output: "2 3" },
      { input: "a b c, d e f", output: "" },
      { input: "apple banana, cherry apple", output: "apple" }
    ],
    output: "Common elements separated by space",
    place: "Location 9",
    lat: "15°26'01.0\"N",
    lng: "75°38'55.0\"E",
    qrPasskey: "QUEST-R9",
    locationQrCode: "QUEST-LOC-R9"
  }
];

async function seed() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('questions');

    console.log('Clearing ALL existing questions...');
    await collection.deleteMany({});

    const now = new Date();
    const docs = mainQuestions.map(q => ({
      round: q.round,
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
      createdAt: now,
      updatedAt: now
    }));

    await collection.insertMany(docs as any);
    console.log(`Successfully seeded ${docs.length} main questions.`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seed();
