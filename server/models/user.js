const mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
    login: { type: String, unique: true },
    name: { type: String},
    projects: [{
      projectID: { type: String, unique: true },
      name: { type: String },
      repoUrl: { type: String },
      projectUrl: { type: String }
    }],
    repos:[{
        name:{type:String},
        url:{type:String}
    }]
  });
  

const USER= mongoose.model('users',userSchema);

module.exports=USER;