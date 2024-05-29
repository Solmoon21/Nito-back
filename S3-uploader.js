import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const s3Uploadv3 = async (prefix,files) => {
  const s3client = new S3Client({
    region:'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${prefix}-${file.originalname}`,
      Body: file.buffer
    };
  });

  return await Promise.all(
    params.map((param) => s3client.send(new PutObjectCommand(param)))
  );
};