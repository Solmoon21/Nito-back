import mongoose from "mongoose";
import { Schema } from "mongoose";


export const productSchema = mongoose.Schema({
  // _id: { type: Schema.Types.ObjectId },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default : ''
  },
  price: {
    type: Number,
    required: true
  },
  colors: {
    type: [String],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  },
  category : {
    type: String,
    required: true
  },
  season : {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  gender: {
    type: String,
    required:true
  },
  merchantID : {
    type : String,
    required : true
  },
  previewImages : {
    type : [String],
    default : []
  },
});

// export const Product = mongoose.model.Product || mongoose.model('product', productSchema);
export const Product = mongoose.model('product', productSchema);