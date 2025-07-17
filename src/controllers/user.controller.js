import asyncHandler from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/apiResponce.js';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefereshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
    } catch (error) {
        throw new apiError(500 , 'something went wrong while genrating refresh and access token')
    }
} 


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


const loginUser = asyncHandler(async(req , res) => {
    //Todo's 
    //req body -> data
    //username and email
    //find the user
    //password cheak
    //access and refresh token 
    //send in the cookies 

    const {email ,username , password} = req.body

    if(!username && !email){
        throw new apiError(400 , 'username or email is requird')
    }

    const user = await User.findOne({
        $or : [{email} , {username}]
    })

    if(!user){
        throw new apiError(404 , 'User does not exist')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new apiError(401 , 'password incorrect')
    }

    const {accessToken , refreshToken} =await generateAccessTokenAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //sending the cookies 

    const options = {
        httpOnly : true, 
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponce(200 , {
            user : loggedInUser , accessToken , refreshToken,

        },
    "User loggin succesfully !")
    )


})


const logOutUser = asyncHandler(async(req,res)=> {
    User.findByIdAndUpdate(
        req.user._id , {
            $set : {
                refreshToken : undefined
            }
        },{
            new : true 
        }
    )

    const options = {
        httpOnly : true, 
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponce(200 , {} , "User logout succesfully" ))
})


const refreshAccessToken = asyncHandler(async (req , res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshTokenv|| req.body.refreshToken;
    
        if (!incomingRefreshToken){
            throw new apiError(401 , "Error happend when sending an refreshToken ")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new apiError(401 , "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken ){
            throw new apiError(401 , "Refresh token is expired");
    
        }
    
        const options  = {
            httpOnly : true , 
            secure : true
        }
        const {accessToken , newrefreshToken} = await generateAccessTokenAndRefereshTokens(user._id);
        
       return res
       .status(200)
       .cookie('accessToken' , accessToken)
       .cookie('refreshToken' , newrefreshToken)
       .json(new ApiResponce(200  ,
        { accessToken  , newrefreshToken} ,
        "Access Token Refreshed succesfully" ))
    
    } catch (error) {
        throw  new apiError(401  , error?.message || "Invalid access token");
    }

})

const changePassword = asyncHandler(async(req , res) => {
    const {oldPassword  , newPassWord}  = req.body;
    const user = User.findById(req.user?._id);
    const isPasswordCorrect  = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apiError(400 , "invalid password");
    }

    user.password = newPassWord;
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponce(200 , {} , "Password  change succesfully"));
})

const getCurrentUser = asyncHandler(async (req , res) => {
    return res
    .status(200)
    .json(200 , req.body , "current user fetch successfully");
})

const updateAccountDetails = asyncHandler(async (req , res) => {
    const {fullName ,  email } = req.body;

    if(!fullName || !email){
        throw new apiError(404 , "All field is required ");
    }

    const user = await User.findByIdAndUpdate(
        req.body?._id,
    {
        $set : {
            fullName,
            email : email,
        }
    },
    {new : true},
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponce(200 , user , "Account detail updated succesfully " ))
    
})

const updateAvatar = asyncHandler(async (req ,res) =>{
    const avatarPath = req.files?.path;

    if(!avatarPath){
        throw new apiError(400 , "avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    if(!avatar){
        throw new apiError(400 , "Error while uploading on cloudnary")
    }

    const user = await User.findByIdAndUpdate(user?._id , {
        $set : {
            avatar
        }
    } , {
        new: true
    }).select("-password")

    if(!user){
        throw  new apiError(400 , "Error on uploading avatar")
    }

    return res 
    .status(200)
    .json(200 , user , "avatr is update successfully ");

})


const updateUserCoverImage  = asyncHandler(async (req ,res) =>{
    const coverImagePath = req.files?.path;

    if(!coverImagePath){
        throw new apiError(400 , "coverimage  file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImagePath)
    if(!coverImagePath){
        throw new apiError(400 , "Error while uploading on cloudnary")
    }

    const user = await User.findByIdAndUpdate(user?._id , {
        $set : {
            coverImage
        }
    } , {
        new: true
    }).select("-password")

    if(!user){
        throw  new apiError(400 , "Error on uploading coverImage")
    }
    return res 
    .status(200)
    .json(200 , user , "avatr is update successfully ");

})



export {    registerUser ,
            loginUser ,
            logOutUser ,
            refreshAccessToken ,
            changePassword ,
            getCurrentUser,
            updateAccountDetails,
            updateAvatar,
            updateUserCoverImage
        
        };
