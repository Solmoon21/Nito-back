import mongoose from "mongoose";
import { Schema } from "mongoose";
import { orderSchema } from "./merchantModel.js";

export const userSchema = mongoose.Schema(
    {
        // _id: { type: Schema.Types.ObjectId },
        firstname : {
            type : String,
            required : true,
        },
        lastname : {
            type : String,
            required : true,
        },
        email : {
            type : String,
            required : true,
        },
        phone : {
            type : String,
            required : false,
            default : '',
        },
        password : {
            type : String,
            required : true,
        },
        cart : {
            type : [orderSchema],
            default : [],
        },
        wishlist : {
            type : [orderSchema],
            default : [],
        },
        history : {
            type : [orderSchema],
            default : []
        },
        canCollectData : {
            type : Boolean,
            default : false,
            required: true,
        },
        isMerchant : {
            type : Boolean,
            default : false,
            required: true,
        },
        preferences : {
            type: Map,
            of: Number,
            default: {
                'headwear' : 0.0,
                'upperbodywear' : 0.0,
                'lowerbodywear' : 0.0,
                'footwear' : 0.0,
            }
        },
        subscribed : {
            type : Boolean,
            default: false,
        }
    }
)

export const User = mongoose.model('user', userSchema);
// export const User = mongoose.model.User || mongoose.model('user', userSchema);