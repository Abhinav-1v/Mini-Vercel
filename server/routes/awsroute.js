const { Router }=require('express');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand }=require('@aws-sdk/client-ecs');
require('dotenv').config();


const router=Router();

const ecsClient=new ECSClient({
    region:'ap-south-1',
    credentials:{
        accessKeyId:process.env.AWS_CLIENT_ID,
        secretAccessKey:process.env.AWS_CLIENT_SECRET
    }

});

router.get('/test',(req,res)=>{
    return res.send('test route');
})
router.post('/project',async (req,res)=>{
    const projectSlug=generateSlug();
    const {githubUrl}=req.body;
    
    const command =new RunTaskCommand({
        cluster:'builderCluster',
        taskDefinition:'buildertask',
        launchType:'FARGATE',
        count:1,
        networkConfiguration: {
            awsvpcConfiguration: {
              subnets: ["subnet-0bd69c70e34ba42a4","subnet-0707e9c1b103573ff","subnet-0eee7db6e1c3f53a6"], // Replace with your VPC subnets
              securityGroups: ["sg-08a3b4ab7f788d528"], // Replace with your security group
              assignPublicIp: "ENABLED", // Default: Assign a public IP
            },
        },
        overrides:{
            containerOverrides:[
                {
                    name:'builderImage',
                    environment:[
                        {name:'GIT_REPOSITORY_URL',value:githubUrl},
                        {name:'PROJECT_ID',value:projectSlug},
                    ]
                }
            ]
        }
    });

    await ecsClient.send(command);
    return res.json({'Status':`http://${projectSlug}.localhost:5555`});
});


module.exports=router;

