const AWS = require("aws-sdk");
const processDeleteItem = require("./helper/deleteItemsDynamoDB");
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

// Create a client for the DynamoDB service
const dynamoDB = new AWS.DynamoDB({ 
  region: REGION,
  maxRetries: 5,
  retryDelayOptions: {
    base: 300
  }
});

const TABLE_NAME_1 = "table1";
const TABLE_NAME_2 = "table2";
const TABLE_NAME_3 = "table3";
const TABLE_NAME_4 = "table4";
// ....


const todayDate = new Date().toISOString().slice(0, 10);
const formattedDate = todayDate.replace(/-/g, "");

const processData = async (sourceTableName, targetTableName) => {
  // get information source table
  const sourceTable = await dynamoDB
    .describeTable({
      TableName: sourceTableName,
    })
    .promise();
    if (!sourceTable) {
    
    }
  // get information target table
  const targetTable = await dynamoDB
    .describeTable({
      TableName: targetTableName,
    })
    .promise();
  if (!targetTable) {

  }
  // read data from source Table
  const items = await dynamoDB
    .scan({
      TableName: sourceTable.Table.TableName,
    })
    .promise();

  // need delete item at target table first
  await processDeleteItem(targetTableName);

  // write data from source table to target table
  for (const item of items.Items) {
    await dynamoDB
      .putItem({
        TableName: targetTable.Table.TableName,
        Item: item,
      })
      .promise();
  }
};
try {
  console.log("Start at " + formattedDate);

  // DynamoDB
  // Need change to correct table name
  const listTable = [
    [TABLE_NAME_1, TABLE_NAME_2],
    [TABLE_NAME_3, TABLE_NAME_4]
    // ....
  ]

  for (const tables in listTable) {
    processData(tables[0], tables[1]);
  }

  console.log("DONE!!");
} catch (err) {
  console.log("err", err);
}
