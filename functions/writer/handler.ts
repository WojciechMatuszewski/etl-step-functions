import {
  BatchWriteItemCommandOutput,
  DynamoDB
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const { DATA_TABLE_NAME } = process.env;

const ddbClient = new DynamoDB({});

export const handler = async (event: any[]) => {
  const requests = event.map(itemToWrite => {
    const marshalledItem = marshall({
      pk: itemToWrite.date,
      cases: itemToWrite.cases,
      recovered: itemToWrite.recovered,
      deaths: itemToWrite.deaths
    });

    return { PutRequest: { Item: marshalledItem } };
  });

  const result = await ddbClient.batchWriteItem({
    RequestItems: {
      [DATA_TABLE_NAME]: requests
    }
  });

  if (hasUnprocessedItems(result)) {
    console.log(result.UnprocessedItems);
    throw new Error("some items were not processed");
  }
};

function hasUnprocessedItems(result: BatchWriteItemCommandOutput) {
  if (!result.UnprocessedItems) return false;

  return Boolean(result.UnprocessedItems[DATA_TABLE_NAME]);
}
