const httpProxy = require('http-proxy');
const express=require('express');


const app=express();

const proxy=httpProxy.createProxy();
// const BASE_PATH='https://bucketn01.s3.ap-south-1.amazonaws.com/__outputs';
const BASE_PATH='http://bucketn01.s3-website.ap-south-1.amazonaws.com/__outputs';



app.use((req,res)=>{
    const hostname=req.hostname;
    const subdomain=hostname.split('.')[0];

    if (req.path === '/') {
        req.url = '/index.html';
    }
    const resolveTo=`${BASE_PATH}/${subdomain}`
    return proxy.web(req,res,{target:resolveTo,changeOrigin:true});
});

app.listen(4444,'0.0.0.0',()=>console.log('proxy server :4444'));

