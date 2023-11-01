# aws-db-clone
aws-db-clone: Clone DB to other DB for RDS and DynamoDB
- DyanmoDB (Need run queue for this task)
  - Select source and target table 
  - Delete all items at target table
  - Scan all item in source table then put it on target table
- RDS
  - Using Database Migration Service (DMS) AWS to migrate from source table to target table
  - On Console DMS AWS
    - Create 1 Replication instances
    - Create source endpoint (Prd RDS)
    - Create target endpoint (Dev RDS)
    - Create task Database migration
  - Run Task Database migration
