![Mini-Vercel](https://img.shields.io/badge/Mini--Vercel-Automated%20Deployment-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

# **🚀 Mini-Vercel – Automated Deployment SaaS**
A **serverless, zero-config website deployment platform** that automates React/Vite project builds and hosting, inspired by **Vercel/Netlify**.  

---

## **🌟 Features**
✅ **One-click deployments** for React/Vite projects.  
✅ **GitHub OAuth2 authentication** for seamless repo access.  
✅ **Dynamic, parallel builds** using **Azure ACR & ACI**.  
✅ **Custom subdomains (`*.naresh.today`)** mapped to S3-hosted projects.  
✅ **Reverse proxy system** with **Nginx & HTTP-proxy** for efficient routing.  
✅ **Fully automated & cost-effective**, running entirely on **cloud free-tier**.  

---

## **🛠️ Tech Stack**
![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square)
![Docker](https://img.shields.io/badge/DevOps-Docker-blue?style=flat-square)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange?style=flat-square)
![Azure](https://img.shields.io/badge/Cloud-Azure-blue?style=flat-square)

- **Frontend:** React.js (Zustand, Tailwind CSS)  
- **Backend:** Node.js, Express.js, OAuth2, JWT  
- **Deployment:** Docker, **Azure ACR/ACI**, AWS S3, Nginx  
- **Authentication:** GitHub OAuth2  
- **Networking:** Reverse Proxy (Nginx), HTTP Proxy  

---

## **⚙️ How It Works**  

```
+-----------------------+
|  User Logs in (OAuth) |
+-----------------------+
          ↓
+-------------------------------+
|  Fetch Repo & Trigger Build   |
+-------------------------------+
          ↓
+--------------------------------+
|  Azure ACI Spins Up Container  |
+--------------------------------+
          ↓
+-------------------------+
|  Build & Upload to S3  |
+-------------------------+
          ↓
+--------------------------------+
|  Nginx & HTTP-Proxy Route URL  |
+--------------------------------+
```

---

## **🚀 Deployment Flow**
![Deployment Flow](https://media.giphy.com/media/ZVik7pBtu9dNS/giphy.gif)

1️⃣ **User logs in via GitHub OAuth2** and selects a repository.  
2️⃣ **Azure ACI dynamically spins up a container**, builds the project, and uploads it to **AWS S3**.  
3️⃣ A **custom subdomain (`*.naresh.today`)** is assigned to the deployed project.  
4️⃣ **Nginx & HTTP-proxy on AWS EC2** route requests to the correct S3-hosted project.  

---

## **📦 Installation & Setup**
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/Abhinav-1v/Mini-Vercel.git
cd Mini-Vercel
```
### **2️⃣ Install Dependencies**
```bash
cd server && npm install
cd ../frontend && npm install
```
### **3️⃣ Setup Environment Variables**
Create a `.env` file in the **server** directory with the following values:
```env
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id
AZURE_RESOURCE_GROUP=your_resource_group
AZURE_LOCATION=your_azure_region
REGISTRY_SERVER=your_registry_server
REGISTRY_USERNAME=your_registry_username
REGISTRY_PASSWORD=your_registry_password
IMAGE_NAME=your_docker_image_name
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id

JWT_SECRET=your_jwt_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

MONGO_URI=your_mongodb_connection_string

FRONTEND_URI=https://naresh.today

AWS_CLIENT_ID=your_aws_client_id
AWS_CLIENT_SECRET=your_aws_client_secret
```

### **How to Obtain These Values:**
- **Azure Credentials:** Go to [Azure Portal](https://portal.azure.com), navigate to **Azure Active Directory > App Registrations** to get your `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `AZURE_TENANT_ID`.
- **GitHub OAuth:** Register your app in [GitHub Developer Settings](https://github.com/settings/developers) to obtain `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- **MongoDB Connection:** Use your **MongoDB Atlas or local MongoDB instance** for `MONGO_URI`.
- **AWS Credentials:** Retrieve from [AWS IAM](https://aws.amazon.com/iam/) under **Access Keys**.

### **4️⃣ Run the Project**
```bash
# Start backend server
cd server && npm start

# Start frontend
cd ../frontend && npm run dev
```

---

## **🛠️ Contributing**
🚀 Feel free to **fork the repository** and submit a pull request with improvements!  

---

## **📄 License**
This project is **open-source** and available under the **MIT License**.  

---

🔥 **Enjoy seamless deployments with Mini-Vercel!** 🚀
