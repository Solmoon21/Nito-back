import mongoose from "mongoose";
import { Schema } from "mongoose";

export const orderSchema = mongoose.Schema({
    // _id: { type: Schema.Types.ObjectId },
    productID : {
        type: String,
        required: true
    },
    color: {
        type: String,
    },
    size: {
        type: String
    },
    amount : {
        type: Number,
        required: true
    }
})

export const merchantSchema = mongoose.Schema({
    // _id: { type: Schema.Types.ObjectId },
    firstname : {
        type: String,
        required: true
    },
    lastname : {
        type: String,
        required: true
    },
    email : {
        type : String,
        required : true,
    },
    phone : {
        type : String,
        required : true,
        default : '',
    },
    password : {
        type : String,
        required : true,
    },
    history : {
        type : [orderSchema],
        default: []
    },
    inStock : {
        type : [orderSchema],
        default: []
    }
})

export const Merchant = mongoose.model('merchant', merchantSchema);