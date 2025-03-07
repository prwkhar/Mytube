import express from "express"
import multer from "multer"
import fs from "fs"
const app = express()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    },
  })
export const upload = multer({ storage })