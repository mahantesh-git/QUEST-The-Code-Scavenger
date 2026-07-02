import { io } from 'socket.io-client';
import { signToken } from './src/auth';
import dotenv from 'dotenv';
dotenv.config();

const teamId = '6a4632d4d517fcff4708ba04'; // demo team ID
const token = signToken({
  kind: 'team',
  teamId,
  teamName: 'demo',
  role: 'solver',
});

const socket = io('http://localhost:4000', {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log(`Connected as solver! Socket ID: ${socket.id}`);
  console.log(`Listening for events in team_${teamId}`);
});

socket.on('runner:location', (data) => {
  console.log('RECEIVED runner:location:', data);
});

socket.on('webrtc:signal', (data) => {
  console.log('RECEIVED webrtc:signal:', data);
});

setTimeout(() => {
  console.log("Shutting down test client...");
  process.exit(0);
}, 20000);
