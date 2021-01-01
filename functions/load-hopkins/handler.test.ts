import { handler } from "./handler";
import nock from "nock";
import {} from "@aws-sdk/util-waiter";
import streamToPromise from "stream-to-promise";

import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({});

test("it saves the data into s3", async () => {
  const testData = `Date,Country/Region,Province/State,Confirmed,Recovered,Deaths
    2020-12-02,US,,13992765,5322128,273528`;

  nock("https://raw.githubusercontent.com/datasets/covid-19")
    .get("/master/data/time-series-19-covid-combined.csv")
    .reply(200, testData, { "Content-Type": "text/html" });

  const key = await handler();

  const getObjectResult = await s3Client.getObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: key
  });

  const bodyBuffer = await streamToPromise(getObjectResult.Body);
  const parsedBuffer = JSON.parse(bodyBuffer.toString());

  expect(parsedBuffer).toEqual([
    {
      Date: "2020-12-02",
      "Country/Region": "US",
      "Province/State": "",
      Confirmed: "13992765",
      Recovered: "5322128",
      Deaths: "273528"
    }
  ]);
}, 10000);
