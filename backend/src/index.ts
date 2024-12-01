import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { AccessToken } from 'livekit-server-sdk';

const createToken = async () => {
    // If this room doesn't exist, it'll be automatically created when the first
    // participant joins
    const roomName = 'quickstart-room';
    // Identifier to be used for participant.
    // It's available as LocalParticipant.identity with livekit-client SDK
    const participantName = 'quickstart-username';
  
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantName,
      // Token to expire after 10 minutes
      ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: roomName });
  
    return await at.toJwt();
  };
  const app = express();
  const port = 3000;

  app.get('/getToken',async(req,res)=>{
    res.send(await createToken());
  })
  app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
  })
// console.log(process.env.LIVEKIT_API_KEY);
