import { createTransport } from "nodemailer"
import { config } from "dotenv"
import { User } from '../Models/userModel.js'
import { Product } from "../Models/productModel.js";
import { emailTemplate } from '../consts.js';
import { createProductsHTML } from "./mailCreator.js";
import mongoose from "mongoose";
import express from 'express';

config();

async function sendEmail() {

  const transporter = createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_EMAIL_PASSWORD
    }
  })

  const users = await User.find({subscribed : true})
  users.forEach(async user => {
    let highestValueCategory = null;
    let max = -1; 
    user.preferences.forEach(
        (value,key) => {
            if(highestValueCategory === null) highestValueCategory = key;
            if(value > max){ max=value; highestValueCategory=key; }
        }
    )

    const productsWithUserPreference = await Product.find({
      category : highestValueCategory
    }).sort([['rating','desc']]).limit(5);
    
    const currentIds = productsWithUserPreference.map((prod) => prod._id) 
    let otherProducts = [] 
    const prod = await Product.findById('6652e022a4b40a0560e4c55e')
    Array.from({length:4}, (_,k) => k).forEach(() => otherProducts.push(prod) )

    // let otherProducts = []
    // if(currentIds.length < 5) {
      // otherProducts = await Product.find({_id: {$nin: currentIds}}).limit(5 - currentIds.length)
    // }
  
    const productsHTML = createProductsHTML(productsWithUserPreference.concat(otherProducts));
    const template = emailTemplate.replace('xxx', productsHTML);
    const mail_config = {
      from: process.env.MY_EMAIL,
      to: user.email,
      subject: 'Nito OS Recommendations',
      html: template,
    }


    transporter.sendMail(mail_config, function(err, info){
      if(err){
        console.log(err)
      }
    })
  })

}

const app = express();
mongoose.connect(process.env.mongoDB_URL)
.then(
    async () => {
        console.log('App connected to DB');
        app.listen(3001, async () => {
          await sendEmail();
          console.log('all sent')
        })
    }
)
