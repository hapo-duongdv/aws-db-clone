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

function createReplicationTask() {
  const replicationTaskParams = {
    MigrationType: 'full-load',
    TableMappings: 'YOUR_TABLE_MAPPINGS',
    SourceEndpointArn: 'YOUR_SOURCE_ENDPOINT_ARN',
    TargetEndpointArn: 'YOUR_TARGET_ENDPOINT_ARN',
    ReplicationInstanceArn: 'YOUR_REPLICATION_INSTANCE_ARN',
  };

  dms.createReplicationTask(replicationTaskParams, (err, data) => {
    if (err) {
      console.log('err:', err);
    } else {
      const replicationTaskArn = data.ReplicationTask.ReplicationTaskArn;
      console.log('replicationTaskArn:', replicationTaskArn);
      startReplicationTask(replicationTaskArn);
    }
  });
}

function startReplicationTask(replicationTaskArn) {
  const startTaskParams = {
    ReplicationTaskArn: replicationTaskArn,
  };

  dms.startReplicationTask(startTaskParams, (err, data) => {
    if (err) {
      console.log('err:', err);
    } else {
      waitForReplicationTaskToComplete(replicationTaskArn);
    }
  });
}

function waitForReplicationTaskToComplete(replicationTaskArn) {
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
          deleteReplicationTask(replicationTaskArn);
        } else {
          setTimeout(() => waitForReplicationTaskToComplete(replicationTaskArn), 60000);
        }
      } else {
        console.error('Error');
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
      console.error('err:', err);
    } else {
      console.log('Done delete!');
    }
  });
}

createReplicationTask();

  console.log("DONE!!");
} catch (err) {
  console.log("err", err);
}
