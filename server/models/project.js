const mongoose=require('mongoose');

const ProjectSchema = new mongoose.Schema({
    projectId: { type: String, unique: true, required: true },
    login:{type:String,required:true},
    name: { type: String, required: true },
    repoUrl: { type: String, required: true },
    projectSlug:{type:String,required:true},
    projectUrl: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['building', 'completed', 'failed'], 
        default: 'building' 
    },
    logs: { type: [String], default: [] }
}, { timestamps: true });

const PROJECT=mongoose.model('projects',ProjectSchema);

module.exports=PROJECT;
