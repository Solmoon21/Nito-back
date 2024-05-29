export const categories = [
    'headwear',
    'upperbodywear',
    'lowerbodywear',
    'footwear'
]

export const emailTemplate = `
<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            table {
                border-spacing: 0;
                width: 100%;
            }
            td {
                padding: 0;
            }
            img {
                border: 0;
                -ms-interpolation-mode: bicubic;
                display: block;
                width: 100%;
                height: auto;
            }
            .email-container {
                max-width: 600px;
                margin: auto;
            }
            .product-card {
                width: 100%;
                max-width: 290px;
                margin: 10px;
                padding: 10px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                text-align: center;
                box-sizing: border-box;
                vertical-align: top;
            }
            .product-image {
                max-width: 100%;
                height: auto;
            }
            .product-name {
                font-size: 16px;
                margin: 10px 0;
            }
            .product-price {
                color: #f00;
                font-size: 14px;
                margin: 5px 0;
            }
            @media only screen and (max-width: 600px) {
                .product-card {
                    max-width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <center>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
                <tr>
                    <td style="padding: 20px 0; text-align: center;">
                        <h1>Your Featured Products</h1>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table role="presentation" cellspacing="5" cellpadding="0" border="0" width="100%">
                            xxx
                        </table>
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>
`