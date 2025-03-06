import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()
 
var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
   
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
  
//routes importing
import userRouter from './routes/user.routes'

//routes declaration


export {app}