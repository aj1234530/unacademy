import express,{Request,Response} from 'express';
import multer,{FileFilterCallback} from 'multer';
import fs, { promises } from 'fs';
import path from 'path';
import {v4 as uuid} from 'uuid';
import * as dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import { AccessToken ,AccessTokenOptions,VideoGrant} from 'livekit-server-sdk';
import { PrismaClient } from '@prisma/client';
const prisma  = new PrismaClient();
//dir folder
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const createToken = async (roomName:string,participantIdentity:string) => {
    
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantIdentity ,
      ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: roomName });
    return await at.toJwt();
  };
  const app = express();
  const port = 3000;
app.use(express.json());
app.use(cors())

  app.get("/ping",(req,res)=>{
    res.status(200).json({message:"Pong"})
  })

  app.post("/createClass",async(req:Request,res:Response)=>{
    const {roomName,teacherName} = req.body;
    console.log("hello")
    if(!roomName || !teacherName){
       res.status(400).json({message:"all manadatory"})
       return;
    }
    console.log("2")

    try {
      const createTeacherToken = async()=>{
        if(!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET){
          throw new Error("Keys not fetched")
        }
      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET,{
        identity:`${teacherName}-${Date.now()}`,
        ttl: '10m'
      });
      at.addGrant({roomJoin:true, room:roomName+Date.now()});
      return await at.toJwt();
      }
      res.status(200).send(await createTeacherToken()); //why awaiting>>as an async function, which means it always returns a Promise. 

    } catch (error) {
      // return res.status(400).json({message:"Internal Error"}) //this is giving typer error why?
       res.status(400).json({message:"Internal Error"})// this is not giving typer error why?
       return;

    }
  })
  app.post("/joinClass",async(req,res)=>{
    const {roomName,studentName} = req.body;
    if(!roomName || !studentName){
      res.status(400).json({message:"all manadatory"});
      return;
    }
    try {
      const createStudentToken = async()=>{
        if(!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET){
          throw new Error("Keys not fetched")
        }
      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET,{
        identity:`${studentName}-${Date.now()}`,
        ttl: '10m'
      });
      const grant:VideoGrant = {
        room:roomName,
        roomJoin:true,
        canPublish:false,
        canPublishData:true,
      } 
      at.addGrant(grant);
      return await at.toJwt();
      }
      res.status(200).send(await createStudentToken());
      return;

    } catch (error) {
      console.log(error);
       res.status(400).json({message:"Internal Error"});
    }
   })
   

app.post("/api/v1/signup",async(req:Request,res:Response):Promise<any>=>{
  const {username,email,password} = req.body;
  if(!username || !email || !password){
    return res.status(409).json({message:"all fields manadatory "})
  }
  //TODO - JWT impln, 
  //uniquesses of email will be checkd by the prisma itself
 try {
  const user = await prisma.user.create({
    data:{
      username: username,
      email:email,
      password:password
    }
  })
  return res.status(200).json({message:"User created"})
 } catch (error) {
  res.status(500).json({message:"internal error"})
 }
})
app.post("/api/v1/createSession",async(req:Request,res:Response)=>{
    const {sessionTitle,email,startTime, status} = req.body;
    //TODO - we will use email encoded in the jwt , for now we accept in request body;
    try {
      const sessionToken:string = await createToken(sessionTitle,email) // when calling await the async fxn so that resolves,using the sessiontitle as room name and the email as identity of the user
    const session = await prisma.session.create({
      data:{
        sessionTitle:sessionTitle,
        sessionId:`${Date.now()}`,//TODO - generate unique id
        sessionToken: sessionToken,
        userEmail: email,
        startTime: startTime,
        status:status,
      }
    })
    res.status(200).json({sessionId:session.sessionId,sessionToken:session.sessionToken})
    } catch (error) {
      console.log(error)
       res.status(500).json({message:"internal error"})
    }
})
//token has been created , now need to have a endpoint for starting the stream
app.post("/api/v1/session/:sessionId/start",async(req:Request,res:Response):Promise<any>=>{ 
  const {sessionId} = req.params;
  try {
    const session = await prisma.session.findFirst({where:{sessionId}});
    const token = session?.sessionToken;
    return res.status(200).json({livekitToken:token})
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})


  app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
  })