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

// Create a client for the RDS service
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

// Tạo task replication
function createReplicationTask() {
  const replicationTaskParams = {
    MigrationType: 'full-load',
    TableMappings: 'YOUR_TABLE_MAPPINGS',
    SourceEndpointArn: 'YOUR_SOURCE_ENDPOINT_ARN',
    TargetEndpointArn: 'YOUR_TARGET_ENDPOINT_ARN',
    ReplicationInstanceArn: 'YOUR_REPLICATION_INSTANCE_ARN',
    MigrationTable: {
      TableCount: 0,
    },
  };

  dms.createReplicationTask(replicationTaskParams, (err, data) => {
    if (err) {
      console.log('err', err);
    } else {
      const replicationTaskArn = data.ReplicationTask.ReplicationTaskArn;
      console.log('replicationTaskArn:', replicationTaskArn);
      checkReplicationStatus(replicationTaskArn);
    }
  });
}

function checkReplicationStatus(replicationTaskArn) {
  const params = {
    Filters: [
      {
        Name: 'replication-task-arn',
        Values: [replicationTaskArn],
      },
    ],
  };

  dms.describeReplicationTasks(params, (err, data) => {
    if (err) {
      console.error('err', err);
    } else {
      const replicationTask = data.ReplicationTasks[0];

      if (replicationTask) {
        const status = replicationTask.Status;
        console.log(`status: ${status}`);

        if (status === 'Load Complete' || status === 'Stopped') {
          console.log('Task Done');
          deleteReplicationTask(replicationTaskArn);
          createReplicationTask();
        } else {
          setTimeout(() => checkReplicationStatus(replicationTaskArn), 60000);
        }
      } else {
        console.error('Not found task');
      }
    }
  });
}

function deleteReplicationTask(replicationTaskArn) {
  const deleteTaskParams = {
    ReplicationTaskArn: replicationTaskArn,
  };

  dms.deleteReplicationTask(deleteTaskParams, (err, data) => {
    if (err) {
      console.error('err', err);
    } else {
      console.log('Done delete task');
    }
  });
}

// Bắt đầu quá trình với việc tạo task replication ban đầu.
createReplicationTask();

  console.log("DONE!!");
} catch (err) {
  console.log("err", err);
}
