const express = require('express');
const awsrouter = require('./routes/awsroute');
const azurerouter = require('./routes/azureroute');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const mongoose=require('mongoose');
require("dotenv").config();


  
const app = express();
const PORT=5555;
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('Mongodb connected..'));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URI, // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//routes
app.use('/aws',awsrouter);
app.use('/azure',azurerouter);
async function loadRouter() {
    const { default: gitrouter } = await import("./github/githubauth.js"); // Dynamic import
    app.use("/auth", gitrouter);
} 
loadRouter().catch(console.error);


app.get('/',(req,res)=>{
    return res.json({'message':'THIS IS HOMEPAGE'});
});

app.get('/index',(req,res)=>{
    return res.json({'message':'THIS IS index'});
});


app.listen(PORT,()=>console.log(`Server Running on PORT: ${PORT}`));

