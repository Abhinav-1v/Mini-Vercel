const { exec, spawn } = require('child_process');
const path = require('path');
const fs=require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
const mongoose=require('mongoose');

mongoose.connect('');
const PROJECT=mongoose.connection.collection('projects')

const s3client=new S3Client({
    region:'ap-south-1',
    credentials:{
        accessKeyId:'',
        secretAccessKey:''
    }
});

const publisherPromises=[];

const PROJECT_ID=process.env.PROJECT_ID;
const PROJECT_SLUG=process.env.PROJECT_SLUG;
const GIT_REPOSITORY_URL=process.env.GIT_REPOSITORY_URL;

async function publisher(PROJECT_ID,logs){
    const updatePromise=await PROJECT.updateOne(
        { projectId:PROJECT_ID },
        { 
            $push: { logs: logs },            
        },
    );
    publisherPromises.push(updatePromise);
}

async function statusUpdate(PROJECT_ID,status) {
    await PROJECT.updateOne({ projectId:PROJECT_ID }, { $set: { status } });
    console.log(`✅ Build Status Updated: ${status}`);
}

function init(){
    console.log('Script Executing!!');
    const outDir=path.resolve(__dirname,'output');

    const gitClone = spawn('git', ['clone', GIT_REPOSITORY_URL, outDir]);

    gitClone.stderr.on('data',async (error) => {
        const errorMsg = error.toString();
    
        // Ignore the "Cloning into ..." messages
        if (!errorMsg.includes('Cloning into')) {
            console.error(`ERROR: ${errorMsg}`);
            publisher(PROJECT_ID,`ERROR: ${errorMsg}`);
            await statusUpdate(PROJECT_ID,'failed')
            await Promise.all(publisherPromises);
            process.exit(0);
        
        }
    });

    gitClone.on('close',async()=>{
        console.log('✅ Git clone completed! Running install...');
        await publisher(PROJECT_ID,'✅ Git clone completed! Running install...');
        
        const npmInstall = spawn('npm', ['install'], { cwd: outDir});

        npmInstall.stdout.on('data',async(data)=>{
            const logData=data.toString();
            console.log(logData);
            await publisher(PROJECT_ID,JSON.stringify(logData));
        });
    
        npmInstall.stderr.on('data',async(error)=>{
            const logError=error.toString();
            console.log(`Error: ${logError}`);
            publisher(PROJECT_ID,JSON.stringify(`Error: ${logError}`));
            await statusUpdate(PROJECT_ID,'failed')
            setTimeout(async() => {
                await Promise.all(publisherPromises);
                process.exit(0);
            }, 5000);            
        });
    
    
        npmInstall.on('close',async (code) => {
            console.log("✅ npm install completed! Running build...");
            await publisher(PROJECT_ID,'✅ npm install completed! Running build...');
            
            const npmBuild = spawn('npm', ['run', 'build'], { cwd: outDir });
    
            npmBuild.stdout.on('data',async (data)=>{
                const logData=data.toString();
                console.log(logData);
                publisher(PROJECT_ID,JSON.stringify(logData));
            });
            
            npmBuild.stderr.on('data',async(error)=>{
                const logError=error.toString();
                console.log(`Error: ${logError}`);
                publisher(PROJECT_ID,JSON.stringify(`Error: ${logError}`));
                await statusUpdate(PROJECT_ID,'failed')
                setTimeout(async () => {
                    await Promise.all(publisherPromises);
                    process.exit(0);
                }, 5000);            
                });
        
            npmBuild.on('close',async (buildCode) => {
                if (buildCode !== 0) {
                    console.log("❌ Build process failed!");
                    await publisher(PROJECT_ID, "❌ Build process failed!");
                    await statusUpdate(PROJECT_ID, 'failed');
                    setTimeout(async () => {
                        await Promise.all(publisherPromises);
                        process.exit(0);
                    }, 5000);
                    return;
                }
                console.log("✅ Build process completed!");
                await publisher(PROJECT_ID,"✅ Build process completed!");

                const distPath=path.join(__dirname,'output','dist');
                const distFoldder=fs.readdirSync(distPath,{recursive:true});
            
                console.log('Upload starting...');
                await publisher(PROJECT_ID,'Upload starting...');

                const uploadPromises=distFoldder.filter(file=>!fs.statSync(path.join(distPath,file)).isDirectory()).map(file=>{
                    const filePath=path.join(distPath,file);
                    console.log(`uploading...${file}`);
                    publisher(PROJECT_ID,`uploading...${file}`);

                    const command=new PutObjectCommand({
                        Bucket:'bucketn01',
                        Key:`__outputs/${PROJECT_SLUG}/${file}`,
                        Body:fs.createReadStream(filePath),
                        ContentType:mime.lookup(filePath),
                    });
                    return s3client.send(command);
                });
                await Promise.all(uploadPromises);
        
                console.log('Upload Successful...');
                await publisher(PROJECT_ID,'✅ Upload Successful...');
                await statusUpdate(PROJECT_ID,'completed')
                setTimeout(async() => {
                    await Promise.all(publisherPromises);
                    process.exit(0);
                }, 5000);            
            });
        });
    });
}

init();