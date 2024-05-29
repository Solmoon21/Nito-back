import request from 'supertest'

import app from '../../index.js'
import { User } from '../../Models/userModel.js'
import { Product } from '../../Models/productModel.js'
import { CountryPreferences } from '../../Models/countryModel.js'
import { getRegionCode } from '../../utils.js'

describe('Product Test Cases', () => {
    
    const garbageID = '123455432112345543211234'


    describe('Listing Products', () => { 
        test('Listing Products should return an array of products, empty or not', async () => {
            const keyword = 'something';
            const response = await request(app).get(`/api/products?keyword=${keyword}`);
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
        })

        describe('Should not cause a problem when queries are included', () => { 
            const keyword = 'Mock';

            test('Keyword query', async () => {
                const response = await request(app).get(`/api/products?keyword=${keyword}`);
                expect(response.statusCode).toBe(201);
                expect(response.body.every(product => product.name.toLowerCase().includes(keyword.toLowerCase()))).toBe(true);
            })

            test('Specific gender query', async () => {
                const response = await request(app).get(`/api/products?keyword=${keyword}&gender=male`);
                expect(response.statusCode).toBe(201);
                expect(response.body).toBeDefined();
                expect(response.body.every(product => product.gender === 'male')).toBe(true)
            })

            test('Not specified and all included returns all gender', async () => {
                
                const response = await request(app).get(`/api/products?keyword=${keyword}`);
                expect(response.statusCode).toBe(201);
                expect(response.body).toBeDefined();
                expect(response.body.every(product => ['male', 'female'].includes(product.gender))).toBe(true)

                const response2 = await request(app).get(`/api/products?keyword=${keyword}&gender=male,female`);
                expect(response2.statusCode).toBe(201);
                expect(response2.body).toBeDefined();
                expect(response2.body.every(product => (['male', 'female'].includes(product.gender)))).toBe(true)
            })

            test('Specific category query', async () => {
                const response = await request(app).get(`/api/products?keyword=${keyword}&category=headwear`);
                expect(response.statusCode).toBe(201);
                expect(response.body).toBeDefined();
                expect(response.body.every(product => product.category === 'headwear')).toBe(true)
            })

            test('Multiple category query', async () => {
                const response = await request(app).get(`/api/products?keyword=${keyword}&category=headwear,footwear`);
                expect(response.statusCode).toBe(201);
                expect(response.body).toBeDefined();
                expect(response.body.every(product => ['headwear','footwear'].includes(product.category))).toBe(true)
            })

            test('Price range query', async () => {
                const response = await request(app).get(`/api/products?keyword=${keyword}&priceRange=0,5000`);
                expect(response.statusCode).toBe(201);
                expect(response.body).toBeDefined();
                expect(response.body.every(product => product.price>=0 && product.price<=5000)).toBe(true)
            })
        })
    })

    describe('Product Recommendations', () => {
        test('Recommended products are sent back', async () => { 
            const userWithDataConset = await User.findOne({
                firstname : 'Mock',
                canCollectData : true
            });
            const response = await request(app).post('/api/products/recommendations')
            .send({
                userID : userWithDataConset._id
            });

            expect(response.statusCode).toBe(201);
            expect(response.body.recommendations).toBeDefined();
        })
    })

    describe('Getting a specific product', () => {
        test('With a valid id', async () => {
            const validProducts = await Product.find({name : 'Mock'}).limit(1);
            const validUsers = await User.find({firstname : 'Mock'}).limit(1);

            const response = await request(app)
            .post(`/api/products/${validProducts[0]._id}`)
            .send({
                userID : validUsers[0]._id
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
        })
        
        test('With a garbage id', async () => {
            const validUsers = await User.find({firstname : 'Mock'}).limit(1);

            const response = await request(app)
            .post(`/api/products/${garbageID}`)
            .send({
                userID : validUsers[0]._id
            });

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
        })

        test('Viewing product updates user preferences values and country trend', async () => {
            const validProducts = await Product.find({name : 'Mock'}).limit(1);
            const userBeforeViewing = await User.findOne({
                firstname : 'Mock',
                canCollectData : true
            });

            const userRegion = getRegionCode(userBeforeViewing);
            const userCountryBeforeViewing = await CountryPreferences.findOne({name : userRegion});

            const response = await request(app)
            .post(`/api/products/${validProducts[0]._id}`)
            .send({
                userID : userBeforeViewing._id
            });

            const userAfterViewing = await User.findById(userBeforeViewing._id);

            const userCountryAfterViewing = await CountryPreferences.findOne({name : userRegion});
            
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();

            const productCategory = validProducts[0].category;

            expect(userAfterViewing.preferences.get(productCategory))
            .toBe(userBeforeViewing.preferences.get(productCategory) + 0.01);

            expect(userCountryAfterViewing.preferences.get(productCategory))
            .toBe(userCountryBeforeViewing.preferences.get(productCategory) + 0.01);
        })
        
    })
    

    describe('Getting reviews of a product', () => {

        test('should return null for garbage id', async () => { 
            const validUsers = await User.find({firstname : 'Mock'}).limit(1);
            const randomUserIDToTest = validUsers[0]._id;

            const response = await request(app)
            .post(`/api/products/${garbageID}`)
            .send({
                userID : randomUserIDToTest
            });
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
            
        })

        test('should return defined value for valid id', async () => { 
            const validProducts = await Product.find({name : 'Mock'}).limit(1);
            const randomProductIDToTest = validProducts[0]._id;

            const validUsers = await User.find({firstname : 'Mock'}).limit(1);
            const randomUserIDToTest = validUsers[0]._id;

            const response = await request(app)
            .post(`/api/products/${randomProductIDToTest}`)
            .send({
                userID : randomUserIDToTest
            });
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();

        })

    })
    
})