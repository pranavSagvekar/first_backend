import asyncHandler from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/apiResponce.js';

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

    if(!username || !email){
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


const logOutUser = asyncHandler(async(res,res)=> {
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





export {registerUser , loginUser ,logOutUser};