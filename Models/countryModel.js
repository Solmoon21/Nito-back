import mongoose from "mongoose";
import { Schema } from "mongoose";

export const countrySchema = mongoose.Schema({
    // _id: { type: Schema.Types.ObjectId },
    name :  {
        type: String,
        required: true
    },
    preferences : {
        type: Map,
        of: Number,
        required: true,
        default: {}
    }
})

export const CountryPreferences = mongoose.model('countryPreferences', countrySchema);