import * as Strp from "stripe"
import { config } from 'dotenv';

import { testClient } from "coingate-v2";

config();

export const payByFiat = async (req, res) => {
    const stripe = Strp.Stripe(process.env.STRIPE_SECRET);
    try{

        const { products } = req.body;
        const lineItems = products.map((product) => ({
            price_data:{
                currency:'huf',
                product_data : {
                    name:product.name,
                    images:[product.image],
                },
                unit_amount:product.price * 100,
            },
            quantity: product.amount
        }));
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items: lineItems,
            mode:'payment',
            success_url:`http://localhost:5173/checkout/success`,
            cancel_url:'http://localhost:5173/checkout/fail'
        })
        return res.status(201).send({id: session.id});
    }
    catch(e) {
        return res.status(500).send({message: 'Payment Failed'})
    }
}

export const payByCrypto = async (req, res) => {
    const coingate = testClient(process.env.COINGATE_API_KEY);

    const { price_amount, price_currency, receive_currency, title, description, userId } = req.body;

    const orderData = {
        order_id: `ORDER-${userId}-${Date.now()}`,
        price_amount,
        price_currency,
        receive_currency,
        title,
        description,
        callback_url: 'https://localhost:3000/cgwebhook',
        cancel_url: 'http://localhost:5173/checkout/fail',
        success_url: 'http://localhost:5173/checkout/success',
    };
    try{   
        const response = await coingate.createOrder(orderData);
        return res.status(200).json({
            payment_url: response.payment_url,
        })
    }
    catch (e) {
        return res.status(400).send({
            message: 'Payment Failed',
        })
    }
}
