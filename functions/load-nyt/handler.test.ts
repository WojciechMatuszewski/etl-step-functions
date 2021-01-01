import { handler } from "./handler";
import { S3 } from "@aws-sdk/client-s3";
import streamToPromise from "stream-to-promise";
import nock from "nock";

const s3Client = new S3({});

test("it saves the data to a JSON file", async () => {
  nock("https://raw.githubusercontent.com")
    .get("/nytimes/covid-19-data/master/us.csv")
    .reply(
      200,
      `date,cases,deaths
    2020-01-21,1,0`,
      { "Content-Type": "text/html" }
    );

  const key = await handler();

  const lookupResult = await s3Client.getObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: key
  });

  const bodyBuffer = await streamToPromise(lookupResult.Body);
  const parsedBody = JSON.parse(bodyBuffer.toString());

  expect(parsedBody).toEqual([{ cases: "1", date: "2020-01-21", deaths: "0" }]);
});
