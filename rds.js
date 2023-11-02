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

  // Run Task Database migration
  const replicationTaskArn = 'YOUR_REPLICATION_TASK_ARN';
  const replicationTaskName = 'YOUR_REPLICATION_TASK_ARN';

  function checkReplicationStatus() {
    const params = {
      Filters: [
        {
          Name: replicationTaskName,
          Values: [replicationTaskArn],
        },
      ],
    };
  
    dms.describeReplicationTasks(params, (err, data) => {
      if (err) {
        console.error( err);
      } else {
        const replicationTask = data.ReplicationTasks[0];
  
        if (replicationTask) {
          const status = replicationTask.Status;
          console.log(`${status}`);
          if (status === 'Load Complete' || status === 'Stopped') {
            deleteReplicationTask();
          } else {
            setTimeout(checkReplicationStatus, 60000);
          }
        } else {
          console.error('ERR');
        }
      }
    });
  }
  
  function deleteReplicationTask() {
    const deleteTaskParams = {
      ReplicationTaskArn: replicationTaskArn,
    };
  
    dms.deleteReplicationTask(deleteTaskParams, (err, data) => {
      if (err) {
        console.error('Lỗi khi xóa task replication:', err);
      } else {
        console.log('Task replication đã được xóa.');
      }
    });
  }
  
  checkReplicationStatus();

  console.log("DONE!!");
} catch (err) {
  console.log("err", err);
}
