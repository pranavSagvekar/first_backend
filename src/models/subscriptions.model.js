import mongoose , {model, Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId, //one who is subscribing 
        ref : "User"
    },
    channel : {
        type :  Schema.Types.ObjectId, //one to whom subscriber  is subscribing 
        ref : "User"
    }

}, {timestamps : true})


export const subsscription = mongoose.model('subscription' , subscriptionSchema);