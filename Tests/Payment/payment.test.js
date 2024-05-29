import request from 'supertest'

import app from '../../index.js'

describe('Payment Portal Creations', () => { 
    test('should return a payment session id when paying with fiat currency', async () => { 
        const response = await request(app).post('/api/checkout/fiat')
        .send({ 
            products: [
                {name:'p1', image:'p1-img', price:100, amount:2}
            ] 
        })

        expect(response.statusCode).toBe(201)
        expect(response.body.id).toBeDefined()
        
    })

    test('should return a payment URL when paying with crypto currency', async () => { 
        const response = await request(app).post('/api/checkout/crypto')
        .send({
            price_amount : 10, 
            price_currency : "USD", 
            receive_currency : "BTC", 
            title : "test Title", 
            description : "test Desc", 
            userId : "test ID"
        })

        expect(response.statusCode).toBe(200)
        expect(response.body.payment_url).toBeDefined()
        
    })
})