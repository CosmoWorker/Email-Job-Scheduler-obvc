## Overview
This document only showcases the process of serverless deployment in AWS ECS Fargate for learning purposes.

## Setup Steps
* Push the `worker`, `backend` and `frontend` images to private ECR repository. `redis` and `postgres` can be pulled directly from public ECR, so no need to push it from locally.
* Built a ECS Task definition containing all 5 services/containers. Please refer to: [`task-definition.json`](task-definition.json)
* Environment variables are handled via `environmentFiles` which points to the `.env` object within a S3 bucket. It requires a IAM Policy on Task execution Role (This role has to be created separately with `AmazonECSTaskExecutionRolePolicy`) granting access to `ecsBucketObjectRead`.
<--PIC-->
### Postgres Container Persistance 
* Handled via EFS volume mounted into the `db` container, this is used because fargate's default uses ephemeral storage.
* Making sure EFS mount targets are in same VPC as fargate task, and security group rule allowing inbound NFS (port 2049).
<--PIC-->

### Database Migration Task
* Ran drizzle-kit push via a one-off ECS Task using the same task definition, with the backend container's command overridden to `pnpm,run,db:push`. 
* This task starts all 5 containers, and runs this migration script on `backend` and then stops. 

### Load Balancing & Other
* An Application Load Balancer is setup with: 
    * Path based routing: `<your_sitename>/api/*` for `backend` target group on port `3000`.
    * Default rule is `frontend` target group on port `5173`.
* When creating ECS service from task definition, have both `frontend` and `backend` attched to their target groups under the Load Balancing section.
<--PIC ALB & target group-->
> **Security Groups**: The ALB has its own ALB open to 0.0.0.0/0 on 80/443. And the fargate task's SG allows inbound on 3000/5173 from the ALB's SG.
<--PIC-->

### DNS
*  A hosted zone in route53 is created for the domain. If domain is registered with 3rd party registrar like namecheap, please update its DNS nameservers with custom Route53-assigned nameservers.
<--PIC A Record-->

## Other Notes
* Also make sure that in environment files, instead of having compose service names, replace it with localhost as in Fargate's `awsvpc` only mode, all are in same namespace.
* AWS secrets manager can be used in place of S3 managed environment files.
* Use static build & serve over this vite dev server, Hence it might block custom domain. Workaround would be to add domain to `server.allowHosts` in `vite.config.ts`.
* Add HTTPS via ACME cert on ALB's 443 listener, 80 listener redirecting to 443.
>Also this guide is just refelection of my choices, feel free to follow other better practices if any from the official aws docs.
