import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
export { GetObjectCommand, PutObjectCommand };

export function storage() {
  const endpoint=process.env.AWS_ENDPOINT_URL_S3;
  const key=process.env.AWS_ACCESS_KEY_ID;
  const secret=process.env.AWS_SECRET_ACCESS_KEY;
  const bucket=process.env.NEON_S3_BUCKET;
  if (!endpoint || !key || !secret || !bucket) throw new Error("Neon Object Storage not configured. Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and NEON_S3_BUCKET.");
  const client=new S3Client({
    endpoint,region:process.env.AWS_REGION || "us-east-2",forcePathStyle:true,
    credentials:{accessKeyId:key,secretAccessKey:secret},
  });
  return {client,bucket};
}
