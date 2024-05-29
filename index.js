import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from 'dotenv';


import { userRouter } from './Routers/user-route.js';

/* For Mock Data */
import { productRouter } from './Routers/product-route.js';
import { merchantRouter } from './Routers/merchant-route.js';
import { paymentRouter } from './Routers/payment-route.js';


import { s3Uploadv3 } from './S3-uploader.js';
import multer from 'multer';

config()
const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json());

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 20 },
});

app.use('/api/user', userRouter);
app.use('/api/products', productRouter);
app.use('/api/merchant', merchantRouter);
app.use('/api/checkout', paymentRouter);


app.post("/uploadimages", upload.array("previewImages"), async (req, res) => {
    const prefix = Date.now().toString();
    try {
      const results = await s3Uploadv3(prefix, req.files);
      const baseAWS_URL = 'https://nito-os-nimtaym.s3.eu-north-1.amazonaws.com/uploads';
      return res.json({ 
        status: "success", 
        urls: req.files.map((file) => {
          return `${baseAWS_URL}/${prefix}-${file.originalname}`
        })
      });
    } catch (err) {
      return res.status(500).send({
        message: "Couldn't upload images"
      })
    }
  });

mongoose.connect(process.env.mongoDB_URL)
.then(
    async () => {
      // await Product.deleteMany({price : 1910})    
      app.listen(3000, () => {
          console.log('app start');
        })
    }
)

export default app;