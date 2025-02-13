import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Project not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
};

const ProjectDetails = () => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { projectId } = useParams();
  const [notFound, setNotFound] = useState(false);

  const POLLING_INTERVAL = 2000;

  const fetchProjectData = useCallback(async () => {
    try {
      const { data } = await axios.post('https://api.naresh.today/azure/getlogs', { 
        projectId 
      });
      
      if (!data) {
        setNotFound(true);
        return 'not_found';
      }
      
      setProjectData(data);
      return data.status;
    } catch (err) {
      if (err.response?.status === 404 || !err.response?.data) {
        setNotFound(true);
        return 'not_found';
      }
      setError(err.message);
      return 'failed';
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let pollInterval;

    const startPolling = async () => {
      const status = await fetchProjectData();
      
      if (status === 'building') {
        pollInterval = setInterval(async () => {
          const newStatus = await fetchProjectData();
          if (newStatus === 'completed' || newStatus === 'failed' || newStatus === 'not_found') {
            clearInterval(pollInterval);
          }
        }, POLLING_INTERVAL);
      }
    };

    startPolling();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [fetchProjectData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'building':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getLogColor = (log) => {
    if (log.includes("success") || log.includes("completed")) return 'text-green-400';
    if (log.includes("error") || log.includes("failed")) return 'text-red-400';
    if (log.includes("warning")) return 'text-yellow-400';
    if (log.startsWith(">")) return 'text-blue-400';
    return 'text-gray-300';
  };

  if (notFound) {
    return <NotFound />;
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      Error: {error}
    </div>
  );

  if (!projectData) return null;

  const repoInfo = projectData.repoUrl.split('/').slice(-2).join('/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Rest of the component remains the same */}
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{projectData.name}</h1>
            <div className="flex items-center gap-2 text-gray-400 mt-2">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span>{repoInfo}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border ${getStatusColor(projectData.status)}`}>
            {projectData.status === 'building' && (
              <span className="inline-block mr-2 animate-spin">⚡</span>
            )}
            {projectData.status}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Project Slug</h3>
            <p className="text-white font-mono">{projectData.projectSlug}</p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Repository</h3>
            <a 
              href={projectData.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
            >
              {repoInfo}
            </a>
          </motion.div>

          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Deployed URL</h3>
            <a 
              href={projectData.projectUrl.startsWith("http") ? projectData.projectUrl : `https://${projectData.projectUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
            >
              {projectData.projectUrl}
            </a>
          </motion.div>
        </div>

        {/* Build Logs */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold">Build Logs</h2>
          </div>
          <div className="p-4 h-[400px] overflow-y-auto font-mono text-sm">
            {projectData.logs.map((log, index) => (
              <div 
                key={index} 
                className={`py-1 ${getLogColor(log)}`}
              >
                <span className="text-gray-500">[{new Date().toLocaleString()}]</span> {log}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;