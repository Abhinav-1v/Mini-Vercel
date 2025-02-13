const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
const mongoose = require('mongoose');

mongoose.connect('');
const PROJECT = mongoose.connection.collection('projects');

const s3client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const publisherPromises = [];

const PROJECT_ID = process.env.PROJECT_ID;
const PROJECT_SLUG = process.env.PROJECT_SLUG;
const GIT_REPOSITORY_URL = process.env.GIT_REPOSITORY_URL;

async function validatePackageJson(projectPath) {
    try {
        console.log('Starting package.json validation...');
        await publisher(PROJECT_ID, JSON.stringify('Starting package.json validation...'));

        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            const error = 'package.json not found in project';
            await publisher(PROJECT_ID, JSON.stringify(`❌ ${error}`));
            throw new Error(error);
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        await publisher(PROJECT_ID, JSON.stringify('✅ package.json found and parsed'));
        
        // Check if build script exists
        const buildScript = packageJson.scripts?.build;
        if (!buildScript) {
            const error = 'No build script found in package.json';
            await publisher(PROJECT_ID, JSON.stringify(`❌ ${error}`));
            throw new Error(error);
        }
        await publisher(PROJECT_ID, JSON.stringify(`✅ Build script found: "${buildScript}"`));

        // Only allow vite or react-scripts build
        const allowedCommands = ['vite build', 'react-scripts build'];
        if (!allowedCommands.some(cmd => buildScript.includes(cmd))) {
            const error = `Unsupported build command: ${buildScript}. Only Vite and Create React App builds are allowed.`;
            await publisher(PROJECT_ID, JSON.stringify(`❌ ${error}`));
            throw new Error(error);
        }
        await publisher(PROJECT_ID, JSON.stringify('✅ Build command validated'));

        // Check if it's a React project
        const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
        if (!allDeps.react) {
            const error = 'Not a React project: react dependency not found';
            await publisher(PROJECT_ID, JSON.stringify(`❌ ${error}`));
            throw new Error(error);
        }
        await publisher(PROJECT_ID, JSON.stringify('✅ React dependency found'));

        // Log all found dependencies
        await publisher(PROJECT_ID, JSON.stringify(`📦 Dependencies found: ${Object.keys(allDeps).join(', ')}`));

        const projectType = buildScript.includes('vite build') ? 'vite' : 'cra';
        await publisher(PROJECT_ID, JSON.stringify(`✅ Project type identified: ${projectType}`));

        return projectType;
    } catch (error) {
        console.error('Package.json validation failed:', error.message);
        await publisher(PROJECT_ID, JSON.stringify(`❌ Package.json validation failed: ${error.message}`));
        throw error;
    }
}

async function publisher(PROJECT_ID, logs) {
    const updatePromise = await PROJECT.updateOne(
        { projectId: PROJECT_ID },
        { $push: { logs: logs } }
    );
    publisherPromises.push(updatePromise);
}

async function statusUpdate(PROJECT_ID, status) {
    await PROJECT.updateOne({ projectId: PROJECT_ID }, { $set: { status } });
    console.log(`✅ Build Status Updated: ${status}`);
}

function init() {
    console.log('Script Executing!!');
    const outDir = path.resolve(__dirname, 'output');

    const gitClone = spawn('git', ['clone', GIT_REPOSITORY_URL, outDir]);

    gitClone.stderr.on('data', async (error) => {
        const errorMsg = error.toString();

        if (!errorMsg.includes('Cloning into')) {
            console.error(`ERROR: ${errorMsg}`);
            await publisher(PROJECT_ID, JSON.stringify(`ERROR: ${errorMsg}`));
            await statusUpdate(PROJECT_ID, 'failed');
            await Promise.all(publisherPromises);
            process.exit(0);
        }
    });

    gitClone.on('close', async () => {
        console.log('✅ Git clone completed! Starting project validation...');
        await publisher(PROJECT_ID, JSON.stringify('✅ Git clone completed! Starting project validation...'));

        let projectType;
        try {
            projectType = await validatePackageJson(outDir);
            await publisher(PROJECT_ID, JSON.stringify('✅ Project validation completed successfully'));
        } catch (error) {
            console.error(`ERROR: ${error.message}`);
            await statusUpdate(PROJECT_ID, 'failed');
            await Promise.all(publisherPromises);
            process.exit(0);
        }

        console.log('✅ Project validated! Running install...');
        await publisher(PROJECT_ID, JSON.stringify('✅ Project validated! Running install...'));

        const npmInstall = spawn('npm', ['install'], { cwd: outDir });

        npmInstall.stdout.on('data', async (data) => {
            const logData = data.toString();
            console.log(logData);
            await publisher(PROJECT_ID, JSON.stringify(logData));
        });

        npmInstall.stderr.on('data', async (error) => {
            const logError = error.toString();
            console.log(`Error: ${logError}`);
            await publisher(PROJECT_ID, JSON.stringify(`Error: ${logError}`));
            await statusUpdate(PROJECT_ID, 'failed');
            setTimeout(async () => {
                await Promise.all(publisherPromises);
                process.exit(0);
            }, 5000);
        });

        npmInstall.on('close', async (code) => {
            console.log("✅ npm install completed! Running build...");
            await publisher(PROJECT_ID, JSON.stringify('✅ npm install completed! Running build...'));

            const npmBuild = spawn('npm', ['run', 'build'], { cwd: outDir });

            npmBuild.stdout.on('data', async (data) => {
                const logData = data.toString();
                console.log(logData);
                await publisher(PROJECT_ID, JSON.stringify(logData));
            });

            npmBuild.stderr.on('data', async (error) => {
                const logError = error.toString();
                console.log(`Error: ${logError}`);
                await publisher(PROJECT_ID, JSON.stringify(`Error: ${logError}`));
                await statusUpdate(PROJECT_ID, 'failed');
                setTimeout(async () => {
                    await Promise.all(publisherPromises);
                    process.exit(0);
                }, 5000);
            });

            npmBuild.on('close', async (buildCode) => {
                if (buildCode !== 0) {
                    console.log("❌ Build process failed!");
                    await publisher(PROJECT_ID, JSON.stringify("❌ Build process failed!"));
                    await statusUpdate(PROJECT_ID, 'failed');
                    setTimeout(async () => {
                        await Promise.all(publisherPromises);
                        process.exit(0);
                    }, 5000);
                    return;
                }

                console.log("✅ Build process completed!");
                await publisher(PROJECT_ID, JSON.stringify("✅ Build process completed!"));

                // Use correct build output directory based on project type
                const buildDir = projectType === 'vite' ? 'dist' : 'build';
                const distPath = path.join(outDir, buildDir);
                
                try {
                    const distFolder = fs.readdirSync(distPath, { recursive: true });

                    console.log('Upload starting...');
                    await publisher(PROJECT_ID, JSON.stringify('Upload starting...'));

                    const uploadPromises = distFolder
                        .filter(file => !fs.statSync(path.join(distPath, file)).isDirectory())
                        .map(file => {
                            const filePath = path.join(distPath, file);
                            console.log(`uploading...${file}`);
                            publisher(PROJECT_ID, JSON.stringify(`uploading...${file}`));

                            const command = new PutObjectCommand({
                                Bucket: 'bucketn01',
                                Key: `__outputs/${PROJECT_SLUG}/${file}`,
                                Body: fs.createReadStream(filePath),
                                ContentType: mime.lookup(filePath),
                            });
                            return s3client.send(command);
                        });

                    await Promise.all(uploadPromises);

                    console.log('Upload Successful...');
                    await publisher(PROJECT_ID, JSON.stringify('✅ Upload Successful...'));
                    await statusUpdate(PROJECT_ID, 'completed');
                } catch (error) {
                    console.error('Upload failed:', error.message);
                    await publisher(PROJECT_ID, JSON.stringify(`❌ Upload failed: ${error.message}`));
                    await statusUpdate(PROJECT_ID, 'failed');
                } finally {
                    setTimeout(async () => {
                        await Promise.all(publisherPromises);
                        process.exit(0);
                    }, 5000);
                }
            });
        });
    });
}

init();