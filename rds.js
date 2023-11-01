const AWS = require("aws-sdk");
const process = require("./helper/deleteItemsDynamoDB");
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

// Create a client for the RDS service
const rds = new AWS.RDS({ region: REGION });
const dms = new AWS.DMS({ region: REGION });

const todayDate = new Date().toISOString().slice(0, 10);
const formattedDate = todayDate.replace(/-/g, "");

try {
  console.log("Start at " + formattedDate);

  // RDS
  /*
    Step on Console AWS (Only need to create once): 
      - Create 1 Replication instances
      - Create source endpoint (Prd RDS)
      - Create target endpoint (Dev RDS)
      - Create task Database migration
  */

  // Run Task Database migration
  dms.startReplicationTask({
    ReplicationTaskArn: "", // Replication Task Arn (Required)
    StartReplicationTaskType: "", // Replication Task Arn (Required)
    CdcStartTime: "" 
  })

  console.log("DONE!!");
} catch (err) {
  console.log("err", err);
}
