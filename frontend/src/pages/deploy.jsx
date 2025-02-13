import React, { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeploymentModal = ({ isOpen, onClose, userLogin, repoName,repoUrl }) => {
    const [projectName, setProjectName] = useState(repoName||'');  
    useEffect(() => {
        if (repoName) {
            setProjectName(repoName);
        }
    }, [repoName]);
    
    const navigate=useNavigate();

  async function handleDeploy(){
    //api call with github repo and get res as unq projectID then navigate to `/project/${unq projectID}`  ..backend post with userLogin repoName repoUrl and projectName


    const response=await axios.post('https://api.naresh.today/azure/project',{
        githubUrl:repoUrl,
        projectName,
        userLogin
    });
    const projectID=response.data;
    navigate(`/project/${projectID}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-900 rounded-lg w-full max-w-lg overflow-hidden border border-gray-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">New Project</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Importing from GitHub</p>
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  <span>{userLogin}</span>
                  <span>/</span>
                  <span className="font-medium">{repoName}</span>
                </div>
              </div>

              {/* Project Name Input */}
              <div className="space-y-2">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-400">
                  Project Name
                </label>
                <motion.input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full bg-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 outline-none border border-gray-700 focus:border-gray-500 transition-colors"
                  whileFocus={{ backgroundColor: 'rgba(31, 41, 55, 0.7)' }}
                />
              </div>

              {/* Deployment Status */}
              <div className="bg-black/30 rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-4">
                  Once you're ready, start deploying to see the progress here...
                </div>
                <div className="relative">
                  <svg
                    viewBox="0 0 400 200"
                    className="w-full h-32 text-gray-800"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M0,100 C100,80 300,120 400,100" strokeWidth="2" />
                    <path d="M0,150 C100,130 300,170 400,150" strokeWidth="2" />
                    <path d="M0,50 C100,30 300,70 400,50" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                onClick={onClose}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                onClick={() => {
                  console.log('Starting deployment...', { projectName });
                  // Add your deployment logic here
                  handleDeploy();
                }}
              >
                Deploy
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeploymentModal;