import request from 'supertest'
import app from '../../index.js'
import { Product } from '../../Models/productModel.js';
import { User } from '../../Models/userModel.js';
import { Merchant } from '../../Models/merchantModel.js';
import { waitForOneSecond } from '../../utils.js';

const mockMerchant = {
    firstname : "Mock",
    lastname : "Merchant",
    phone : "+36201234567", 
    email : "mockMerchant@gmail.com",
    password : "mockMerchant123",
    isMerchant : 'on',
    canCollectData : 'on'
}

const mockCustomer = {
    firstname : "Mock",
    lastname : "Customer",
    phone : "+36201234567", 
    email : "mockCustomer@gmail.com",
    password : "mockCustomer123",
    isMerchant : 'off',
    canCollectData : 'on'
}

const mockProduct = {
    name : "Mock",
    description : "Mock Description",
    price : 1910,
    colors : ['r', 'g', 'b'],
    sizes : ['s', 'm', 'l'],
    category : "upperbodywear",
    season : "winter",
    rating : 1,
    gender : "female",
    merchantID : '',
    previewImages : ['image1', 'image2']
}

describe('User Test Cases', () => {
    
    describe('Register', () => {

        test('Registering merchant with un-registered email', async () => {
            const response = await request(app)
            .post('/api/user/register')
            .send(mockMerchant);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("Successful register");
        })

        test('Registering merchant with registered email', async () => {
            await waitForOneSecond();

            const registeredMerchants = await Merchant.find({email : mockMerchant.email}).limit(1);
            const registeredMerchant = registeredMerchants[0];

            const response = await request(app)
            .post('/api/user/register')
            .send({
                firstname: registeredMerchant.firstname,
                lstname: registeredMerchant.lastname,
                email: registeredMerchant.email,
                phone: registeredMerchant.phone,
                password : "mockMerchant123",
                isMerchant : 'on',
                canCollectData : 'on'
            });

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe("Email is already used");
        })

        test('Registering customer with un-registered email', async () => {
            
            const response = await request(app)
            .post('/api/user/register')
            .send(mockCustomer);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("Successful register");
        })

        test('Registering customer with registered email', async () => {
            await waitForOneSecond();

            const registeredCustomers = await User.find({email : mockCustomer.email}).limit(1);
            const registeredCustomer = registeredCustomers[0];

            const response = await request(app)
            .post('/api/user/register')
            .send({
                firstname: registeredCustomer.firstname,
                lstname: registeredCustomer.lastname,
                email: registeredCustomer.email,
                phone: registeredCustomer.phone,
                password : "mockCustomer123",
                isMerchant : 'off',
                canCollectData : 'on'
            });

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe("Email is already used");
        })
    })
    
    describe('Login', () => {

        test('Login with valid credentials', async () => {
            await waitForOneSecond();

            const response = await request(app)
            .post('/api/user/login')
            .send({
                email: mockMerchant.email,
                password: mockMerchant.password,
                isMerchant: true,
            });

            expect(response.statusCode).toBe(201);
            expect(response.body.user.firstname).toBe(mockMerchant.firstname);
            expect(response.body.user.email).toBe(mockMerchant.email);
            expect(response.body.user.id).toBeDefined();
        })

        test('Login with invalid credentials', async () => {
            await waitForOneSecond();

            const response = await request(app)
            .post('/api/user/login')
            .send({
                email: mockMerchant.email,
                password: 'randomPassword',
                isMerchant: mockMerchant.isMerchant,
            });

            expect(response.statusCode).toBe(404);
            // expect(response.body.message).toBe('Wrong');
        })

    })
    
    
    describe('Add Product to Cart', () => { 
        test('Adding to cart with valid data', async () => {
            await waitForOneSecond();

            const mockCustomerDB = await User.findOne({email : mockCustomer.email});
            const mockMerchantDB = await Merchant.findOne({email : mockMerchant.email})
            mockProduct.merchantID = mockMerchantDB._id;
            const mockProductDB = await Product.create(mockProduct);

            const productIDToTestWith = mockProductDB._id;

            const response = await request(app)
            .post('/api/user/addremoveproduct')
            .send({
                userID : mockCustomerDB._id,
                operation : 'add',
                container : 'cart',
                productProperties : {
                    productID : productIDToTestWith,
                    color : 'red',
                    size : 'small',
                },
                ammount : 1,
            });

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Successful add');
        })

        test('Adding to cart with valid data actually saves', async () => {
            await waitForOneSecond();

            const mockCustomerDB = await User.findOne({email : mockCustomer.email});
            const mockProductDB = await Product.findOne({name : mockProduct.name, description : mockProduct.description})

            const response = await request(app)
            .get(`/api/user/${mockCustomerDB._id}/container?containerType=cart`);

            expect(response.body.container.some((product) => product.name === mockProductDB.name)).toBe(true);
            expect(response.statusCode).toBe(201);
        })


        test('Adding to cart with invalid data', async () => {

            await waitForOneSecond();

            const mockCustomerDB = await User.findOne({email : mockCustomer.email});
            const productIDToTestWith = '123455432112345543211234';

            const response = await request(app)
            .post('/api/user/addremoveproduct')
            .send({
                userID : mockCustomerDB._id,
                operation : 'randomOperation',
                container : 'randomContainer',
                productProperties : {
                    productID : productIDToTestWith,
                    color : 'red',
                    size : 'small',
                    ammount : 1,
                },
            });

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
        })
    })

    
    describe('Submitting a product review', () => { 
        test('Should not save the review for unpurchased product', async () => { 

            await waitForOneSecond();
            
            const users = await User.find({email : mockCustomer.email}).limit(1);
            const userToTest = users[0];

            const products = await Product.find({});
            const productToTest = products.find(
                (prod) =>  userToTest.history.reduce(
                    (acc, curr) => acc && prod._id !== curr.productID
                , true) 
            );

            const response = await request(app)
            .post('/api/user/submitreview')
            .send({
                userID : userToTest._id,
                productID : productToTest._id, 
                name : userToTest.firstname, 
                text : "A Random Review", 
                rating : 3
            })

            expect(response.body.message).toBe('Buy first')
            expect(response.statusCode).toBe(403)
        })

        test('Should save the review for purchased product', async () => { 

            await waitForOneSecond();
            
            const users = await User.find({email : mockCustomer.email}).limit(1);
            const userToTest = users[0];

            const products = await Product.find({});
            const productToTest = products.find(
                (prod) =>  userToTest.history.reduce(
                    (acc, curr) => acc && prod._id !== curr.productID
                , true) 
            );

            await request(app)
            .post('/api/user/addremoveproduct')
            .send({
                userID : userToTest._id,
                operation : 'add',
                container : 'history',
                productProperties : {
                    productID : productToTest._id,
                    color : productToTest.colors[0],
                    size : productToTest.sizes[0],
                },
                ammount : 1,
            })

            const response = await request(app)
            .post('/api/user/submitreview')
            .send({
                userID : userToTest._id,
                productID : productToTest._id, 
                name : userToTest.firstname, 
                text : "A Random Review", 
                rating : 3
            })

            expect(response.body.message).toBe('Success Review')
            expect(response.statusCode).toBe(201)
        })
    })

    describe('Subscribing to NewsLetter', () => { 
        test('Subscribing with registered user', async () => { 
            await waitForOneSecond();

            const users = await User.find({}).limit(1);
            const userToTest = users[0];

            const response = await request(app)
            .post('/api/user/subscribe')
            .send({
                userID : userToTest._id
            })

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Successfully Subscribed');
        })

        test('Subscribing with un-registered user', async () => { 
            const randomUserID = '123455432112345543211234';
            
            const response = await request(app)
            .post('/api/user/subscribe')
            .send({
                userID : randomUserID
            })

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Server Error');
        })
    })
})