import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary =async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload the file in cloudinary
        const responce = await cloudinary.uploader.upload(localFilePath , {
            resource_type : 'auto'
        })
        //file upload successfully 
        console.log("file is uploaded on cloudinary");
        console.log("Responce :" , responce.url);
        return responce
        // fs.unlinkSync(localFilePath)
    } catch (error) {
        
            fs.unlinkSync(localFilePath);
        
 //remove the locally uploaded temprory file if the opration get failed 
        return null;
    }
}

export {uploadOnCloudinary};