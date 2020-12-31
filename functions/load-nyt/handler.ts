import phin from "phin";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import cv from "csvtojson";
import { asyncResult } from "@expo/results";
import { Transform } from "stream";

const { DATA_BUCKET_NAME } = process.env;

export const handler = async () => {
  const uploadResult = await asyncResult(uploadData());

  if (!uploadResult.ok) {
    throw new Error("upload failed");
  }

  return uploadResult.value;
};

function createCSVParser() {
  return cv();
}

function createJSONTransformer() {
  let isFirst = true;

  return new Transform({
    transform(chunk, encoding, next) {
      if (isFirst) {
        isFirst = false;
        const newChunk = Buffer.from(`[${chunk.toString()}`, "utf-8");
        return next(null, newChunk);
      }
      const newChunk = Buffer.from(`,${chunk.toString()}`, "utf-8");
      return next(null, newChunk);
    },
    flush(callback) {
      const lastChunk = Buffer.from(`]`);
      callback(null, lastChunk);
    }
  });
}

const url =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv";

async function uploadData() {
  const key = `nyt-${new Date().toISOString()}.json`;

  const response = await phin({ url, stream: true });

  const stream = response.pipe(createCSVParser()).pipe(createJSONTransformer());

  const s3Client = new S3({
    maxAttempts: 0
  });

  const uploader = new Upload({
    client: s3Client,
    params: { Bucket: DATA_BUCKET_NAME, Key: key, Body: stream },
    leavePartsOnError: true
  });

  await uploader.done();

  return key;
}
