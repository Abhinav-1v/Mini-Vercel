import {Router } from 'express';
import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import USER from '../models/user.js';
config();


const app=Router();
const jwtsecret=process.env.JWT_SECRET;

const GITHUB_CLIENT_ID=process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET=process.env.GITHUB_CLIENT_SECRET;
const oauthApp = new OAuthApp({
        clientType: "oauth-app",
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
});

app.get('/',(req,res)=>{
    return res.send('works');
});

app.get('/login',(req,res)=>{
    const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope= public_repo read:user`;
    return res.redirect(githubAuthURL);
});

app.get('/gitauth/authcallback',async(req,res)=>{
    const {code}=req.query;
    if(!code){
        return res.status(404).json({'error':'Authorization Code Missing!!'});
    }
    try{ 
        const resp=await oauthApp.createToken({code});
        const token=resp.authentication.token;
        const octokit=new Octokit({auth:token});

        const { data: user } = await octokit.request("GET /user");
        const { data: repos } = await octokit.request("GET /user/repos");

        await USER.create({
            login: user.login,
            name: user.name,
            repos: repos.map(repo => ({ name: repo.name, url: repo.html_url }))
        }).catch(async () => {
            await USER.updateOne(
                { login: user.login },
                { $set: { name: user.name, repos: repos.map(repo => ({ name: repo.name, url: repo.html_url })) } }
            );
        });
        const jwttoken = jwt.sign({ login: user.login }, jwtsecret, { expiresIn: "7d" });        
        res.cookie("jwttoken", jwttoken, {
            httpOnly: true,  // ✅ Prevents JavaScript access (security best practice)
            secure: true,    // ✅ Required for HTTPS (ensure your site uses HTTPS)
            sameSite: "Lax", // ✅ Allows cookies to be sent on same-site requests & top-level navigations
            domain: "naresh.today", // ✅ Limits access to naresh.today and api.naresh.today ONLY
            path: "/"        // ✅ Ensures the cookie is sent on all routes
        });
        
        return res.redirect('https://naresh.today/dashboard');
    }
    catch(e){
        console.log(e);
        return res.status(500).json({'error':'Authorization Failed!!'});
    }
});

app.get('/verify', async (req, res) => {
    const jwttoken = req.cookies.jwttoken;
    if (!jwttoken) {
        return res.send('no jwttoken');
    }
    try {
        const { login } = jwt.verify(jwttoken, jwtsecret);
        const user = await USER.findOne({ login });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("jwttoken", { 
        httpOnly: true,
        secure: true, 
        sameSite: "Lax",
        domain: "naresh.today", 
        path: "/" 
    });
    return res.send("Logged out successfully!!!");
});
export default app;
