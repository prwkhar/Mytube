import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET// Click 'View API Keys' above to copy your API secret
});

const cloudinary_uploader = async (filepath) => {
    try {
        if(!filepath) return null
        const response = await cloudinary.uploader.upload(filepath,{
            resource_type: "auto"
        })
        console.log("file uploaded successfully")
        fs.unlinkSync(filepath)
        return response;
    } catch (error) {
        fs.unlinkSync(filepath)//removes the locally saved file
        return null;
    }
}

export {cloudinary_uploader}