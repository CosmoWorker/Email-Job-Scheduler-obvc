## Overview
This document only showcases the process of serverless deployment in AWS ECS Fargate for learning purposes.

## Setup Steps
* Push the `worker`, `backend` and `frontend` images to private ECR repository. `redis` and `postgres` can be pulled directly from public ECR, so no need to push it from locally.
* Environment variables are handled via `environmentFiles` which points to the `.env` object within a S3 bucket. It requires a IAM Policy on Task execution Role (This role has to be created separately with `AmazonECSTaskExecutionRolePolicy`) granting access to `ecsBucketObjectRead`.<br/>
<p align="center">
   <img width="480" alt="image" src="https://github.com/user-attachments/assets/f3ea4d81-bc62-47d3-a7ca-5f86c26b1d29" />
   <img width="480" alt="image" src="https://github.com/user-attachments/assets/52186fb7-db1a-4d3f-93b2-8f29a770ffc0" />
   <br/>
   <sub><em>Task Execution Role IAM permissions & Role</em></sub>
</p>
* Built a ECS Task definition containing all 5 services/containers. Please refer to: [`task-definition.json`](task-definition.json)
* Create a ECS cluster & with this task-definition file create a service.<br/>
<!--<p align="center">
     <img width="800" alt="image" src="https://github.com/user-attachments/assets/5c6d770a-d1e4-4135-b600-6afa3fd1f1b3" />
      <sub><em></em></sub>
   </p> -->
   <p align="center">
      <img width="800" alt="image" src="https://github.com/user-attachments/assets/10483618-7651-439a-9e6a-829a9ee49161" /><br/>
      <sub><em>Service Task's containers</em></sub>
   </p>


### Postgres Container Persistance 
* Handled via EFS volume mounted into the `db` container, this is used because fargate's default uses ephemeral storage.
* Making sure EFS mount targets are in same VPC as fargate task, and security group rule allowing inbound NFS (port 2049). <br/>
   <p align="center">
      <img width="700" alt="image" src="https://github.com/user-attachments/assets/6316d442-68b5-4a18-b24d-3f09f3150de6" /><br/>
      <sub><em>EFS Network Info</em></sub>
   </p>
   <p align="center">
      <img width="700" alt="image" src="https://github.com/user-attachments/assets/e3c4e4b9-cc8a-409f-ac46-ae4a3302417a" /><br/>
      <sub><em>EFS security group Inbound rules</em></sub>
   </p>


### Database Migration Task
* Ran drizzle-kit push via a one-off ECS Task using the same task definition, with the backend container's command overridden to `pnpm,run,db:push`. 
* This task starts all 5 containers, and runs this migration script on `backend` and then stops. 

### Load Balancing & Other
* An Application Load Balancer is setup with: 
    * Path based routing: `<your_sitename>/api/*` for `backend` target group on port `3000`.
    * Default rule is `frontend` target group on port `5173`.
* When creating ECS service from task definition, have both `frontend` and `backend` attched to their target groups under the Load Balancing section. <br/>
   <p align="center">
      <img width="800" alt="image" src="https://github.com/user-attachments/assets/44c4b2f5-a022-4a3c-9a62-864e862b3441" /><br/>
      <sub><em>ALB Listener rules</em></sub>
   </p>
   <p align="center">
      <img width="800" alt="image" src="https://github.com/user-attachments/assets/9746ccce-d9cb-47a7-945a-0935ce6874bf" /><br/>
      <sub><em>Service Target groups for Load Balancer</em></sub>
   </p>

> **Security Groups**: The ALB has its own ALB open to 0.0.0.0/0 on 80/443. And the fargate task's SG allows inbound on 3000/5173 from the ALB's SG.<br/>
   <p align="center">
      <img width="800" alt="image" src="https://github.com/user-attachments/assets/17c6d1c4-3488-4dae-8efd-6f10111d8e7c" /><br/>
      <sub><em>Fargate service security group</em></em></sub>
   </p>
   <p align="center">
      <img width="800" alt="image" src="https://github.com/user-attachments/assets/be839130-3319-4e26-b8e9-e63f5e681ec8" /><br/>
      <sub><em>ALB specific security group</em></sub>
   </p>



### DNS
*  A hosted zone in route53 is created for the domain. If domain is registered with 3rd party registrar like namecheap, please update its DNS nameservers with custom Route53-assigned nameservers. <br/>
   <p align="center">
      <img width="600" alt="image" src="https://github.com/user-attachments/assets/7b181314-b705-4a00-b5bf-2b4f5690c062" /><br/>
      <sub><em>Route53 hosted zones Info</em></sub>
   </p>


## Other Notes
* Also make sure that in environment files, instead of having compose service names, replace it with localhost as in Fargate's `awsvpc` only mode, all are in same namespace.
* AWS secrets manager can be used in place of S3 managed environment files.
* Use static build & serve over this vite dev server, Hence it might block custom domain. Workaround would be to add domain to `server.allowHosts` in `vite.config.ts`.
* Add HTTPS via ACME cert on ALB's 443 listener, 80 listener redirecting to 443.
>Also this guide is just refelection of my choices, feel free to follow other better practices if any from the official aws docs.
