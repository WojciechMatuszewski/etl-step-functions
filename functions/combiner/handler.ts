import { S3 } from "@aws-sdk/client-s3";
import { Readable } from "stream";

import chunk from "lodash/chunk";

const s3Client = new S3({});

const { DATA_BUCKET_NAME } = process.env;

function getSortedKeys(keys: string[]) {
  if (keys[0].includes("hopkins")) return keys;

  return [keys[1], keys[0]];
}

async function streamToJSON(
  stream: Readable
): Promise<Record<string, string>[]> {
  let data = "";
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => {
      data += chunk.toString();
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(JSON.parse(data)));
  });
}

function nyDataToLookupTable(nyData: Record<string, string>[]) {
  return nyData.reduce((acc, arrayEntry) => {
    const obj = {
      cases: arrayEntry["cases"],
      deaths: arrayEntry["deaths"],
      date: arrayEntry["date"],
      recovered: 0
    };

    acc[arrayEntry["date"]] = obj;

    return acc;
  }, {} as Record<string, any>);
}

export const handler = async (keys: string[]) => {
  const sortedKeys = getSortedKeys(keys);

  const promises = sortedKeys.map(key =>
    s3Client.getObject({ Bucket: DATA_BUCKET_NAME, Key: key })
  );

  const [{ Body: hopkinsBody }, { Body: nyBody }] = await Promise.all(promises);

  if (!hopkinsBody || !nyBody) throw new Error("Body not found");

  const streamPromises = [hopkinsBody, nyBody].map(readableBody =>
    streamToJSON(readableBody)
  );

  const [hopkinsData, nyData] = await Promise.all(streamPromises);

  const nyLookupTable = nyDataToLookupTable(nyData);
  hopkinsData.forEach(hopkinsEntry => {
    const entryDate = hopkinsEntry["Date"];

    const nyEntryToBeEnriched = nyLookupTable[entryDate];
    if (!nyEntryToBeEnriched) return;

    nyEntryToBeEnriched.recovered = hopkinsEntry["Recovered"];
    nyLookupTable[entryDate] = nyEntryToBeEnriched;
  });

  const enrichedNyData = Object.values(nyLookupTable);

  const chunks = chunk(enrichedNyData, 25);
  return chunks;
};
