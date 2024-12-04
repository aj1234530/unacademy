import express,{Request,Response} from 'express';
import multer,{FileFilterCallback} from 'multer';
import fs from 'fs';
import path from 'path';
import {v4 as uuid} from 'uuid';
import * as dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import { AccessToken ,AccessTokenOptions,VideoGrant} from 'livekit-server-sdk';

//dir folder
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const createToken = async () => {
    // If this room doesn't exist, it'll be automatically created when the first
    // participant joins
    const roomName = 'myroom';
    // Identifier to be used for participant.
    // It's available as LocalParticipant.identity with livekit-client SDK
    const participantName = 'quickstart-username';
  
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: `${participantName}-${Date.now()}` ,
      // Token to expire after 10 minutes
      ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: roomName });
  
    return await at.toJwt();
  };
  const app = express();
  const port = 3000;
app.use(express.json());
app.use(cors())

//serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage  = multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null,dir);
  },
  filename:(req,file,cb) =>{
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
})

// const fileFilter: multer.Options['fileFilter'] = (req,file,cb) =>{
//   if(file.mimetype === 'application/pdf'){
//     cb(null,true)
//   }else{
//     cb(new Error('Only PDF files are allowed'), false);
//   }
// }
//multer instance

const upload = multer({
  storage:storage,
  limits:{fileSize:10*1024*1024}
})

app.post('/upload',upload.single('file'),(req:Request,res:Response):any=>{
  if(!req.file){
    return res.status(400).send("no file uploaded")
  }
  return res.send(`pdf file uploaded: ${req.file.fieldname}`)
})

  app.get('/getToken',async(req,res)=>{
    res.send(await createToken());
  })
  app.get("/ping",(req,res)=>{
    res.status(200).json({message:"Pong"})
  })

  app.post("/createClass",async(req:Request,res:Response)=>{
    const {roomName,teacherName} = req.body;
    console.log("hello")
    if(!roomName || !teacherName){
       res.status(400).json({message:"all manadatory"})
       return;
    }~
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
      at.addGrant({roomJoin:true, room:roomName});
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
  app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
  })
// console.log(process.env.LIVEKIT_API_KEY);


//learnings
//1. you need to call the function
//2. you need to await the async function while calling (why?)