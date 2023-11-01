const AWS = require('aws-sdk');
const {parallelScan} = require('@shelf/dynamodb-parallel-scan');

const PRIMARY_PARTITION_KEY = '[partition-key]';

async function fetchAll(tableName) {
  const CONCURRENCY = 250;
  const alias = `#${PRIMARY_PARTITION_KEY}`;
  const name = PRIMARY_PARTITION_KEY;
  const scanParams = {
    TableName: tableName,
    ProjectionExpression: alias,
    ExpressionAttributeNames: {[alias]: name},
  };

  const items = await parallelScan(scanParams, {concurrency: CONCURRENCY});
  return items;
}

function prepareRequestParams(items) {
  const requestParams = items.map((i) => ({
    DeleteRequest: {
      Key: {
        [PRIMARY_PARTITION_KEY]: i[PRIMARY_PARTITION_KEY],
      },
    },
  }));

  return requestParams;
}

async function sliceInChunks(arr) {
  let i;
  let j;
  const CHUNK_SIZE = 25; // DynamoDB BatchWriteItem limit
  const chunks = [];

  for (i = 0, j = arr.length; i < j; i += CHUNK_SIZE) {
    chunks.push(arr.slice(i, i + CHUNK_SIZE));
  }

  return chunks;
}

async function deleteItems(chunks, tableName) {
  const documentclient = new AWS.DynamoDB.DocumentClient();

  const promises = chunks.map(async function(chunk) {
    const params = {RequestItems: {[tableName]: chunk}};
    const res = await documentclient.batchWrite(params).promise();
    return res;
  });

  return await Promise.all(promises);
}

async function processDeleteItem(tableName) {
  const items = await fetchAll(tableName);
  const params = prepareRequestParams(items);
  const chunks = await sliceInChunks(params);
  const res = await deleteItems(chunks, tableName);
  console.log("DONE Delete", JSON.stringify(res));
}

export default processDeleteItem;
