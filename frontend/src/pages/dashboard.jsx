import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import reactimg from '../assests/react.png';
import viteimg from '../assests/vite.png';
import DeploymentModal from './deploy';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [repos, setRepos] = useState([]);
  const {setLogin}=useStore();
  const navigate=useNavigate();
  function viewProjectPage(projectId){
    navigate(`/project/${projectId}`);
  }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [deployments,setDeployments]=useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('https://api.naresh.today/auth/verify', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setLogin(data.login);        
        setUser({ name: data.name, login: data.login }); 
        setRepos(data.repos);
        setDeployments(data.projects)
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <motion.div 
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <motion.div 
        className="max-w-6xl mx-auto p-6"
        variants={containerVariants}
        initial="transparent"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Git Repository Section */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
            variants={itemVariants}
          >
            <h2 className="text-xl font-bold tracking-tight mb-6">Import Git Repository</h2>
            <div className="flex gap-4 mb-6">
              <motion.div 
                className="flex-1 bg-gray-800/50 rounded-lg px-4 py-2 text-white"
                whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.7)' }}
              >
                {user.login}
              </motion.div>
              <motion.input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 outline-none"
                whileFocus={{ backgroundColor: 'rgba(31, 41, 55, 0.7)' }}
              />
            </div>
            
            <AnimatePresence>
              <motion.div className="space-y-3">
                {filteredRepos.map((repo) => (
                  <motion.div 
                    key={repo.name} 
                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 group hover:bg-gray-700/50 transition-colors"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white">{repo.name}</span>
                    </div>
                    <motion.button 
                      className="bg-white text-black px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedRepo(repo);
                        setIsDeployModalOpen(true);
                      }}
                    >
                      Deploy
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            <motion.a 
              className="text-gray-400 hover:text-white mt-6 inline-block"
              whileHover={{ x: 10 }}
            >
              Couldn't Find Repository? Try Making Visibility Public... 
            </motion.a>
          </motion.div>

          {/* Deployed Projects Section */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
            variants={itemVariants}
          >
            <h2 className="text-xl font-bold tracking-tight mb-6">Deployed Projects</h2>
            <motion.div className="space-y-4">
              {deployments.map((deployment) => (
                <motion.div 
                  key={deployment.name} 
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-white font-medium mb-2">
                    <motion.a 
                      onClick={()=>viewProjectPage(deployment.projectID)}
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {deployment.name}
                    </motion.a>
                  </h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <motion.a 
                      href={deployment.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      Repository
                    </motion.a>
                    <motion.a 
                      href={`https://${deployment.projectUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {deployment.projectUrl}
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-900/50 border border-red-900 rounded-lg p-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-12 flex items-center justify-center gap-6"
          variants={itemVariants}
        >
          <span className="text-gray-400 text-sm">Optimized For</span>
          <div className="flex items-center gap-4">
            <img src={reactimg} alt="React" className="h-6" />
            <img src={viteimg} alt="Vite" className="h-6" />
          </div>
        </motion.div>
      </motion.div>

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        userLogin={user.login}
        repoName={selectedRepo?.name}
        repoUrl={selectedRepo?.url}
      />
    </div>
  );
};

export default Dashboard;