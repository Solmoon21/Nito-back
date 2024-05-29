import request from 'supertest'

import app from '../../index.js'
import { Merchant } from '../../Models/merchantModel.js'
import { Product } from '../../Models/productModel.js'

describe('Merchant Test Cases', () => {
    const garbageID = '123455432112345543211234'
    
    describe('Getting Storage', () => { 

        test('should return error for garbage ID', async () => { 
            const response = await request(app)
            .get(`/api/merchant/${garbageID}/storage`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Not Found");
        })

        test('should return defined value for valid ID', async () => { 
            const validMerchants = await Merchant.find({firstname : 'Mock'}).limit(1);
            const merchantToTest = validMerchants[0]; 
        
            const response = await request(app)
            .get(`/api/merchant/${merchantToTest._id}/storage`);

            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
        })
    })
    
    describe('Getting History', () => { 

        test('should return error for garbage ID', async () => { 
            const response = await request(app)
            .get(`/api/merchant/${garbageID}/history`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Not Found");
        })

        test('should return defined value for valid ID', async () => { 
            const validMerchants = await Merchant.find({firstname: 'Mock'}).limit(1);
            const merchantToTest = validMerchants[0]; 
        
            const response = await request(app)
            .get(`/api/merchant/${merchantToTest._id}/history`);

            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
        })
    })
    

    const mockProductFromFrontEnd = (id) => {
        return ( {
            name : 'Mock',
            description : 'Mock Desc',
            price: 1910,
            category: 'lowerbodywear',
            season: 'winter',
            gender: ['male'],
            previewImages: [
                'https://nito-os-nimtaym.s3.eu-north-1.amazonaws.com/uploads/product_13.png'
            ],
            inStock : [
                {color : 'red', size : 's', amount : 1}, 
                {color : 'red', size : 'm', amount : 1}, 
                {color : 'red', size : 'm', amount : 1}, 
                {color : 'blue', size : 'l', amount : 1}, 
                {color : 'purple', size : 'xl', amount : 1}, 
            ],
            merchantID: id,
        } ) 
    }

    describe('Adding a new product to storage', () => { 

        test('should return error for garbage ID', async () => { 
            const response = await request(app)
            .post(`/api/merchant/${garbageID}/addproduct`)
            .send(mockProductFromFrontEnd(garbageID))

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
        })

        test('should return error for badly structured product', async () => { 
            const validMerchants = await Merchant.find({firstname : 'Mock'}).limit(1);
            const merchantToTest = validMerchants[0]; 
        
            const response = await request(app)
            .post(`/api/merchant/${merchantToTest._id}/addproduct`)
            .send(null)

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
        })

        test('should upload for good product', async () => { 
            const validMerchants = await Merchant.find({firstname : 'Mock'}).limit(1);
            const merchantToTest = validMerchants[0]; 
        
            const response = await request(app)
            .post(`/api/merchant/${merchantToTest._id}/addproduct`)
            .send(mockProductFromFrontEnd(merchantToTest._id))

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Product Added Successfully');

            const mockProduct = mockProductFromFrontEnd(merchantToTest._id);
            const productUploaded = await Product.findOne({
                name : mockProduct.name,
                description : mockProduct.description
            });

            expect(productUploaded.colors).toStrictEqual(['red', 'blue', 'purple']);
            expect(productUploaded.sizes).toStrictEqual(['s','m','l','xl']);
            expect(productUploaded.price).toBe(1910);
            expect(productUploaded.category).toBe('lowerbodywear');
            expect(productUploaded.season).toBe('winter');
            expect(productUploaded.gender).toBe('male');
        })
    })
    
    
})