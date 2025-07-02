import asyncHandler from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/apiResponce.js';


const registerUser =  asyncHandler(async (req , res) => {
        //get user details from frontend S
        //validatation - not empty 
        //chek if user already exists : usrname or email
        // cheeak for images 
        //cheak for avatar
        //upload them to cloudinary                                    
        //cheak avatar upload success cloudnary
        // create user object - create entry in database
        //remove password and refresh token from responce
        //cheak for user creation 
        //return responce 

    const {fullName , email , username , password} = req.body;
    console.log( "FullName : " ,email );

    if ([fullName , email , username].some(( field) => field?.trim() === "")) {
        throw new apiError(400, "All field is  compulsary")
    }

   const existedUser =await  User.findOne({
    $or : [{username} , {email} ]
   })

   if(existedUser){
    throw new apiError(409 , "Username with email or username already exists.")
   }

   console.log(req.files);

   const avatarLocalPath = Array.isArray(req.files?.avatar) ? req.files.avatar[0]?.path : undefined;
    const coverImageLocalPath = Array.isArray(req.files?.coverImage) ? req.files.coverImage[0]?.path : undefined;
   

   if(!avatarLocalPath)throw new apiError(400 , "avatar file is required");
   
    
   const avatar = await uploadOnCloudinary( avatarLocalPath)
   const coverImage = await uploadOnCloudinary( coverImageLocalPath)

    if(!avatar){
    throw new apiError(408 , 'avtar not upload ')
    }


    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage ?.url || '',
        email,
        password,
        username : username.toLowerCase
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new apiError(500 , 'something went wrong while registring a user ')
    }

    return res.status(201).json(
        new ApiResponce(200 , createdUser , 'user registerd  succesfully' )
    )

})





export {registerUser};