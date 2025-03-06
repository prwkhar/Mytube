import dotenv from "dotenv" 
import mongoose from "mongoose";
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDb().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`process is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err);
})