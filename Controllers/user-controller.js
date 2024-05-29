import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from "../Models/userModel.js";
import { Merchant } from '../Models/merchantModel.js';
import * as utils from '../utils.js';
import { Product } from '../Models/productModel.js';
import { Review } from '../Models/reviewModel.js';


export const verifyUser = async (req, res, next) => {

    const user = {...req.body};
    const model = user.isMerchant ? Merchant : User;

    const exist = await model.findOne({ email : user.email });
    if(!exist) 
        return res.status(404)
    next();
}

export const getUser = async (req, res) => {
    const emailQuery = req.params.email;
    const userDB = await User.findOne({ email : emailQuery });
    const exists = userDB !== null;

    if(exists){
        return res.status(201).send({
            message : ""
        });
    }
    else{
        return res.status(404).send({
            message : "User doesn't exist"
        });
    }
}

export const register = async (req, res) => {
    
    const user  = {...req.body}; 

    if(utils.hasEmptyKeys(user)) {
        return res.status(500).send({
            message : "Server Error"
        })
    }

    const isMerchant = user.isMerchant === 'on';
    const dataModel = isMerchant ? Merchant : User;
    
    const emailUsed = await dataModel.findOne( {email: user.email} )

    if(emailUsed !== null){
        return res.status(409).send({
            message: "Email is already used"
        })
    }
    
    const canCollectData = user.canCollectData === 'on';
    await utils.saveUser(user, isMerchant, canCollectData);

    return res.status(201).send({
        message : "Successful register"
    });
}

export const login = async (req,res) => {
    try{

    const credentials = {...req.body};
    // if(utils.hasEmptyKeys(credentials)) {
        // return res.status(404).send({
            // message : "Invalid data"
        // })
    // }


    const model = credentials.isMerchant ? Merchant : User;

    const user = await model.findOne( {email : credentials.email} );
    if(!user) {
        
        return res.status(404).send({
            message : "Invalid email or Password"
        })
    }
    
    const isCorrect = await bcrypt.compare(credentials.password, user.password);
    if(!isCorrect){
        // return res.status(404)
        return res.status(404).send({
            message : "Invalid email or Password"
        })
    }

    return res.status(201).send({
        user: {
            firstname : user.firstname,
            id : String(user._id),
            email : user.email,
        }
    });
    }
    catch(e) {
    }

}

export const resetPassword = async (req, res) => {
    const user = {...req.body};
    try {
        const userDB = await User.findOne( { email : user.email} )
        userDB.password = await bcrypt.hash(user.password, 10);
        await userDB.save();
        return res.status(201).send({ msg : "Password Updated...!"})
    }
    catch(e) {
        return res.status(500).send({ msg : "Error Updating"})
    }
}

export const addRemoveProduct = async (req, res) => {
    try {

        const {userID, container, operation, ammount, productProperties} = {...req.body};

        const user = await User.findById(userID);

        const product = await Product.findById(productProperties.productID);

        const merchant = await Merchant.findById(product.merchantID)

        const availableColorAndSizeIndex = merchant.inStock.findIndex((elem) => elem.amount > 0)

        if(productProperties.color === ''){
            productProperties.color = merchant.inStock[availableColorAndSizeIndex].color;
        }

        if(productProperties.size === ''){
            productProperties.size = merchant.inStock[availableColorAndSizeIndex].size;
        }
        switch (operation) {
            case 'add':
                user[container].push({...productProperties,amount:ammount});
                break;
            case 'remove':
                user[container] = user[container].filter(id => id !== productProperties.productID);
                break;
            default:
                break;
        }

        await user.save();
        return res.status(201).send({message : `Successful ${operation}`});
    }
    catch(e) {
        return res.status(500).send({message : `Server Error`});
    }
}

export const getContainer = async (req, res) => {
    const id = req.params.id;
    const containerType = req.query.containerType;

    try{
        const user = await User.findById(id);
        const requests = await Promise.all(user[containerType].map(async (item) => {
            const product = await Product.findById(item.productID);
            return {
                image: product.previewImages[0],
                name: product.name,
                description: product.description,
                price: product.price,
                color: item.color,
                size: item.size,
                amount: item.amount,
                productID: item.productID,
            };
        }));
        return res.status(201).send({
            container : requests
        });
    }
    catch(e){
        throw e;
        return res.status(500).send({
            message : "Server Error"
        })
    }
}

export const submitReview = async (req, res) => {
    
    const data = {...req.body};


    try{
        const user = await User.findById(data.userID);
        const pastOrder = user.history.find(order => order.productID === data.productID);
        if(!pastOrder){
            return res.status(403).send({
                message : "Buy first"
            })
        }

        const hasReviewed = await Review.find({
            name: user.firstname
        })


        if(hasReviewed.length) {
            return res.status(403).send({
                message : "Can submit only once"
            })
        }

        const { userID, productID, name, text, rating } = {...data};

        const product = await Product.findById(productID)
        const pastReviews = await Review.find({productID: productID})

        product.rating = Math.floor(( product.rating * pastReviews + rating ) / (pastReviews + 1))
        await product.save()
        

        await Review.create({userID,productID,name,text,rating})
        return res.status(201).send({
            message : 'Success Review'
        })
    }
    catch(e) {
        return res.status(500).send({
            message : "Server Error"
        })
    }
}

export const subscribeNews = async (req, res) => {
    try{
        const { userID } = req.body;
        const user = await User.findById(userID);
        user.subscribed = true;
        user.save();
        return res.status(201).send({
            message : "Successfully Subscribed"
        })
    }
    catch(e) {
        return res.status(500).send({
            message : "Server Error"
        })
    }
}

export const clearCart = async (req, res) => {
    const { userID } = req.body
    const user = await User.findById(userID)

    const boughtProducts = user.cart 

    await User.findByIdAndUpdate(userID, {
        cart: [],
        $push : {
            history: boughtProducts
        }
    })

    await Promise.all(boughtProducts.map(async (prod) => {
        try {
            const product = await Product.findById(prod.productID)

            await Merchant.findOneAndUpdate(
                {
                    _id : product.merchantID,
                    inStock: { $elemMatch: {  productID: prod.productID, color: prod.color, size: prod.size } }
                },
                {
                    $push : {
                        history : prod
                    },
                    $inc : {
                        "inStock.$.amount" : -prod.amount
                    }
                }
            )
            return res.status(200).send({
                message: "Cleared"
            })
        
        } catch (e) {
            return res.status(500).send({
                message : "Server Error"
            })
        }

    }))

}