//________FIrst APPROCH ________//
// const app = express()


// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error" , (error) => {
//             console.log("ERROR : " , error);
//             throw error
//         })

//         app.listen(process.env.PORT , () => {
//             console.log(`app is listing at port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("ERROR : ",error);
//         throw err
//     }
// })()
import { app } from './app.js';
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
dotenv.config({
    path : './env'
})


connectDB()
.then( () => {
    app.listen(process.env.PORT || 3000 , () => {
        console.log(`server is runing at : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo db conncection failed !!");
})