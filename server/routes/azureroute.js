const { Router } = require("express");
const { generateSlug } = require("random-word-slugs");
const { DefaultAzureCredential, ClientSecretCredential } = require("@azure/identity");
const { ContainerInstanceManagementClient } = require("@azure/arm-containerinstance");
const PROJECT=require('../models/project.js');
const USER=require('../models/user.js');
const shortid=require('shortid');
require("dotenv").config();

const router=Router();


router.get('/test',(req,res)=>{
  return res.send('test route');
})



const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.AZURE_RESOURCE_GROUP;
const location = process.env.AZURE_LOCATION;
const acrServer = process.env.REGISTRY_SERVER;
const acrUsername = process.env.REGISTRY_USERNAME;
const acrPassword = process.env.REGISTRY_PASSWORD;
const imageName = process.env.IMAGE_NAME;

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);
const client = new ContainerInstanceManagementClient(credential, subscriptionId);

async function deleteContainerInstance(containerGroupName) {
  try {
    console.log(`🗑️ Deleting container group: ${containerGroupName}...`);
    await client.containerGroups.beginDeleteAndWait(resourceGroupName, containerGroupName);
    console.log("✅ Container group deleted successfully.");
  } catch (error) {
    console.error("❌ Error deleting container group:", error);
  }
}

async function monitorContainerStatus(containerGroupName, projectSlug) {
  console.log(`🔍 Monitoring container status for ${containerGroupName}...`);

  while (true) {
    try {
      const containerGroup = await client.containerGroups.get(resourceGroupName, containerGroupName);
      const status = containerGroup.provisioningState;

      console.log(`📌 Current Status: ${status}`);

      if (status === "Succeeded" || status === "Failed" || status === "Terminated") {
        console.log(`🎯 Container ${containerGroupName} has completed execution.`);

        // Delete the container instance
        setTimeout(async()=>{
          await deleteContainerInstance(containerGroupName);
        },35000)
        return;
      }
    } catch (error) {
      console.error("⚠️ Error fetching container status:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
  }
}

router.get("/", (req, res) => {
  return res.send("🚀 Server is up and running!");
});

router.post("/getLogs", async(req,res) => {
  const {projectId} = req.body;
  const data = await PROJECT.findOne({projectId});
  
  if (!data) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  return res.json(data);
});


router.post("/project", async (req, res) => {
  console.log("📩 Received new project request!");

  
  const projectId=shortid.generate();
  const projectSlug = generateSlug();
  const { githubUrl,projectName,userLogin } = req.body;

  const projectPromise= PROJECT.create({
    projectId:projectId,
    login:userLogin,
    name:projectName,
    repoUrl:githubUrl,
    projectSlug:projectSlug,
    projectUrl:`${projectSlug}.naresh.today`
  });

  const userUpdatePromise = USER.findOneAndUpdate(
    { login: userLogin },
    { 
      $push: { 
        projects: {
          projectID: projectId, 
          name: projectName, 
          repoUrl: githubUrl, 
          projectUrl: `${projectSlug}.naresh.today`
        }
      } 
    }
  );
  

  //ACI CODE
  const containerGroupName = `builder-container-${projectSlug}`;

  const containerGroup = {
    location,
    osType: "Linux",
    containers: [
      {
        name: "builder-container",
        image: imageName,
        resources: {
          requests: {
            cpu: 0.5,
            memoryInGB: 1.0,
          },
        },
        environmentVariables: [
          { name: "GIT_REPOSITORY_URL", value: githubUrl },
          { name: "PROJECT_ID", value: projectId },
          { name: "PROJECT_SLUG", value: projectSlug },
        ],
      },
    ],
    imageRegistryCredentials: [
      {
        server: acrServer,
        username: acrUsername,
        password: acrPassword,
      },
    ],
    restartPolicy: "Never",
  };

  try {
    console.log(`🚀 Creating container instance: ${containerGroupName}...`);
    await client.containerGroups.beginCreateOrUpdate(resourceGroupName, containerGroupName, containerGroup);

    // Start monitoring in the background
    monitorContainerStatus(containerGroupName, projectSlug);

    // ✅ Return URL immediately (Client doesn't wait)
    await Promise.all([projectPromise,userUpdatePromise]);
    return res.send(projectId);
  } catch (error) {
    await PROJECT.updateOne({projectId:projectId},{status:'failed'});
    console.error("❌ Error creating container instance:", error);
    return res.status(500).json({ error: "Failed to deploy container instance." });
  }
});

module.exports=router;
