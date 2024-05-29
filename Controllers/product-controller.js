import { CountryPreferences } from "../Models/countryModel.js";
import { Merchant } from "../Models/merchantModel.js";
import { Product } from "../Models/productModel.js";
import { Review } from "../Models/reviewModel.js";
import { User } from '../Models/userModel.js';
import { getRegionCode, getSeason } from "../utils.js";

export const listProducts = async (req, res) => {

    /*  DEFAULT should be double-checked in backend 
        body {
            query - query
            start index - start, default 0
            patch length - limit, default 10
            product or store - queryType, default product
        }
    
    */

    try{

        const keyword = req.query.keyword || "";
        let priceRange = req.query.priceRange || '';
        let sorter = req.query.sort || "price";
        let category = req.query.category || '';
        let gender = req.query.gender || '';
        if(priceRange === ''){
            priceRange = [0, Number.MAX_SAFE_INTEGER]
        }
        else{
            priceRange = priceRange.split(',').map((priceStr) => parseInt(priceStr))
        }

        if(category === ''){
            category = []
        }
        else{
            category = category.split(',').map(str => str.toLowerCase())
        }
        
        if(gender === ''){
            gender = []
        }
        else{
            gender = gender.split(",").map(str => str.toLowerCase());
        }
		req.query.sort ? (sorter = req.query.sort.split(",")) : (sorter = [sorter]);

		let sortBy = {};
		if (sorter[1]) {
			sortBy[sorter[0]] = sorter[1];
		} else {
			sortBy[sorter[0]] = "asc";
		}

        let result;
        result = await Product.find( 
            { 
                name: { $regex: keyword === "" ? /.*/ : keyword, $options: "i" }, 
                price: { $lte: priceRange[1], $gte: priceRange[0] } 
            }
        )
        .sort(sortBy)

        if(category.length){
            result = result.filter((prod) => category.includes(prod.category.toLowerCase()))
        }

        if(gender.length){
            result = result.filter((prod) => gender.includes(prod.gender.toLowerCase()))
        }
        
        return res.status(201).send(result);
    }
    catch(e) {
        return res.status(500).send({
            message : "Server Error"
        })
    }
}

export const getRecommededProducts = async (req, res) => {
    try{
        const productsWithHighestRatings = await Product.find({}).sort([['rating','desc']]).limit(5)
        const userID = req.body.userID || '';
        if(userID === ''){
            return res.status(200).send({
                recommendations: productsWithHighestRatings,
            })
        }
        const user = await User.findById(userID);
        if(user === null || user.canCollectData === false){
            return res.status(200).send({
                recommendations: productsWithHighestRatings,
            })
        }

        let highestValueCategory = null;
        let max = -1; 
        user.preferences.forEach(
            (value,key) => {
                if(highestValueCategory === null) highestValueCategory = key;
                if(value > max){ max=value; highestValueCategory=key; }
            }
        )

        const userRegion = getRegionCode(user);
        const userCountry = await CountryPreferences.findOne({name : userRegion});
        let trendingCategory = null;
        userCountry.preferences.forEach(
            (value,key) => {
                if(trendingCategory === null) trendingCategory = key;
                if(value > max){ max=value; trendingCategory=key; }
            }
        )

        const currentSeason = getSeason();
        const productsWithUserPreference = await Product.find({
            season : { $regex: currentSeason, $options: "i" }
        })
        .where('category').in([highestValueCategory, trendingCategory])
        .sort([['rating','desc']]).limit(5)

        return res.status(201).send({
            recommendations: productsWithUserPreference,
        })
    }
    catch(e){
        return res.status(500).send({
            message : "Server error"
        })
    }
}

export const getProduct = async (req, res) => {
    try{
        const productID = req.params.id;

        const product = await Product.findById(productID);
        if(!product) {
            return res.status(500).send({
                message : "Server Error"
            })
        }
        const merchant = await Merchant.findById(product.merchantID);

        const userID = req.body.userID;
        const user = await User.findById(userID);

        if(user !== null && user.canCollectData){   
            const originalValue1 = user.preferences.get(product.category);
            user.preferences.set(product.category, originalValue1 + 0.01)
            user.save();

            const userRegion = getRegionCode(user);
            const userCountry = await CountryPreferences.findOne({name : userRegion});
            const originalValue2 = userCountry.preferences.get(product.category);
            userCountry.preferences.set(product.category, originalValue2 + 0.01)
            userCountry.save();
        }

        const inStock = merchant.inStock.filter((prod) => prod.productID === productID);

        return res.status(201).send({
            product,
            inStock
        });
    }
    catch(e) {
        res.status(500).send({
            message : "Server Error"
        })
        throw e;
    }
}

export const getReviews = async (req, res) => {
    try{    
        const productID = req.params.id;
        const reviews = await Review.find({ productID : productID});
        return res.status(201).json(reviews);
    }
    catch(e) {
        return res.status(500).send({
            message : "Server Error"
        })
    }
}