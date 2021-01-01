import phin from "phin";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import cv from "csvtojson";
import { Transform } from "stream";
import { asyncResult } from "@expo/results";

export const handler = async () => {
  const uploadResult = await asyncResult(uploadData());

  if (!uploadResult.ok) {
    console.log(uploadResult.reason);
    throw new Error("upload failed");
  }

  return uploadResult.value;
};

function createFilter() {
  const filterTransformer = new Transform({
    transform(chunk, encoding, next) {
      const { "Country/Region": country } = JSON.parse(chunk.toString());
      if (country === "US") return next(null, chunk);
      return next();
    }
  });

  return filterTransformer;
}

function createCSVParser() {
  return cv();
}

function createJSONTransformer() {
  let isFirstTransformation = true;

  return new Transform({
    transform(chunk, encoding, next) {
      if (isFirstTransformation) {
        isFirstTransformation = false;

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
  "https://raw.githubusercontent.com/datasets/covid-19/master/data/time-series-19-covid-combined.csv";

async function uploadData() {
  const key = `hopkins-${new Date().toISOString()}.json`;

  const response = await phin({ url, stream: true });

  const stream = response
    .pipe(createCSVParser())
    .pipe(createFilter())
    .pipe(createJSONTransformer());

  const s3Client = new S3({
    maxAttempts: 0
  });

  const { DATA_BUCKET_NAME } = process.env;
  const uploader = new Upload({
    client: s3Client,
    params: { Bucket: DATA_BUCKET_NAME, Key: key, Body: stream },
    leavePartsOnError: true
  });

  await uploader.done();

  return key;
}
