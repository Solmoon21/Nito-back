import { s3Uploadv3 } from "../S3-uploader.js";
import { Merchant } from "../Models/merchantModel.js"
import { Product, productSchema } from "../Models/productModel.js";
// import mongoose from "mongoose";

export const getHistory = async (req, res) => {
    const id = req.params.id;
    try{
        const merchant = await Merchant.findById(id);
        const requestedProducts = await Promise.all(merchant.history.map(
            async (prod) => {
                const product = await Product.findById(prod.productID);
                return { 
                    name : product.name,
                    image: product.previewImages[0], 
                    amount : prod.amount,
                    color : prod.color,
                    size : prod.size,
                };
            }
        ));
        
        return res.status(201).send({
            container : requestedProducts
        });
    }
    catch(e){
        return res.status(404).send({
            message : 'Not Found'
        })
    }
}

export const getStorage = async (req, res) => {
    const id = req.params.id;
    try{
        const merchant = await Merchant.findById(id);
        if(!merchant) {
            return res.status(404).send({
                message : 'Not Found'
            })
        }
        const requestedProducts = await Promise.all(merchant.inStock.map(
            async (prod) => {
                const product = await Product.findById(prod.productID);
                return { 
                    name : product.name,
                    image: product.previewImages[0], 
                    price: product.price,
                    color : prod.color,
                    size : prod.size,
                    amount : prod.amount
                };
            }
        ));
        return res.status(201).send({
            message : 'Fetched',
            container : requestedProducts
        });
    }
    catch(e){
        return res.status(404).send({
            message : 'Not Found',
            container : []
        })
    }
}

export const addProduct = async (req, res) => {
    try {

        const merchantID = req.params.id;
        const data = {...req.body};
        let sizes = [];
        let colors = [];
        data.inStock.forEach((item) => {
            if(sizes.indexOf(item.size) === -1) sizes.push(item.size)
            if(colors.indexOf(item.color) === -1) colors.push(item.color)
        })

        const product = {
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            season: data.season,
            gender: data.gender.length > 1 ? 'all' : data.gender[0],
            previewImages: data.previewImages,
            sizes,
            colors,
            merchantID,
        }
        const merchant = await Merchant.findById(merchantID);
        if(!merchant) {
            return res.status(500).send({
                message : 'Server Error'
            })
        }

        const productUploaded = await Product.create(product);
        const newProductID = productUploaded._id;
        data.inStock.forEach((item) => {
            merchant.inStock.push({ productID:newProductID, ...item})
        })
        merchant.save();
        return res.status(201).send({
            message : 'Product Added Successfully'
        })
    }
    catch(e) {
        return res.status(500).send({
            message : 'Server Error'
        })
    }
}

export const editInStock = async (req, res) => {
    const merchantID = req.params.id;
    const { productID, inStock } = req.body; 
    const merchant = await Merchant.findById(merchantID);
    const product = await Product.findById(productID);

    //frontend -> itemA, backend -> itemB
    const sameProduct = (itemA, itemB) => {
        return productID === itemB.productID && 
        itemA.color === itemB.color && 
        itemA.size === itemB.size
    }
    
    inStock.forEach((itemA) => {
        const itemDBToUpdate = merchant.inStock.find((itemB) => sameProduct(itemA,itemB) )
        if(itemDBToUpdate)
            itemDBToUpdate.amount = itemA.amount
        else{
            merchant.inStock.push({productID, ...itemA})
            if(product.sizes.indexOf(itemA.size) === -1) product.sizes.push(itemA.size)
            if(product.colors.indexOf(itemA.color) === -1) product.colors.push(itemA.color)
        }
    })

    merchant.save();
    product.save();
}
