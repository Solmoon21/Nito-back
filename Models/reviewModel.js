import mongoose from "mongoose";
import { Schema } from "mongoose";

const reviewSchema = mongoose.Schema({
    // _id: { type: Schema.Types.ObjectId },
    productID : {
        type : String,
        required : true
    },
    userID : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    text : {
        type : String,
        required : true
    },
    rating : {
        type : Number
    }
})

export const Review = mongoose.model('review', reviewSchema);