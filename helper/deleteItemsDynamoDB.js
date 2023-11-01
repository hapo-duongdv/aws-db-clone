const AWS = require("aws-sdk");
const ACCESS_KEY_ID = '[access-key-id]';
const SECRET_ACCESS_KEY = '[secret-access-key]';
const REGION = '[region]';
AWS.config.update({
  region: REGION, // Change region
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const dynamoDB = new AWS.DynamoDB({
  region: REGION,
  maxRetries: 5,
  retryDelayOptions: {
    base: 300,
  },
});

///// Process

function breakArrayIntoGroups(data, maxPerGroup) {
  const groups = [];

  for (let index = 0; index < data.length; index += maxPerGroup) {
    groups.push(data.slice(index, index + maxPerGroup));
  }

  return groups;
}
const wipeTable = async (tableName) => {
  const info = await dynamoDB
    .describeTable({
      TableName: tableName,
    })
    .promise();

  const keyHash = info.Table.KeySchema.find(
    (k) => k.KeyType === "HASH"
  ).AttributeName;

  console.log("key hash=", keyHash);

  const scan = await dynamoDB
    .scan({
      TableName: tableName,
    })
    .promise();
  console.log(`will delete ${scan.Items.length} items from ${tableName}`);

  const datagr = breakArrayIntoGroups(scan.Items, 25);

  for (let i = 0; i < datagr.length; i += 1) {
    const po = [];

    for (let i2 = 0; i2 < datagr[i].length; i2 += 1) {
      const item = datagr[i][i2];

      po.push(item);
    }

    await dynamoDB
      .batchWriteItem({
        RequestItems: {
          [`${tableName}`]: po.map((s) => ({
            DeleteRequest: {
              Key: {
                [`${keyHash}`]: s[`${keyHash}`],
              },
            },
          })),
        },
      })
      .promise();
  }

  console.log("cleared table");
};

async function processDeleteItem(tableName) {
  await wipeTable(tableName);
  console.log("DONE Delete!!!");
}

module.exports = processDeleteItem;
