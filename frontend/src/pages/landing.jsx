import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallax effect for hero section
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const featureCardVariants = {
    offscreen: { 
      opacity: 0, 
      y: 50
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <motion.div 
        className="px-6 py-24 text-center relative"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <motion.h1 
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Develop. Preview. Ship.
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Deploy your web projects with Mini-Vercel. Experience seamless deployment, 
          instant previews, and simplified workflow.
        </motion.p>
        <motion.button 
          onClick={() => navigate('/login')}
          className="bg-white text-black px-8 py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Start Deploying
        </motion.button>
      </motion.div>

      {/* Features Grid with Scroll Animations */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: "🚀",
              title: "Instant Deployments",
              description: "Push your code and watch it go live instantly with automatic deployments."
            },
            {
              icon: "🌐",
              title: "Global Edge Network",
              description: "Your applications are served from the closest edge location for optimal performance."
            },
            {
              icon: "👥",
              title: "Team Collaboration",
              description: "Work together seamlessly with built-in collaboration tools and preview deployments."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={featureCardVariants}
              custom={index}
            >
              <motion.div 
                className="text-2xl mb-4"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Preview Section with Scroll-triggered Animation */}
      <motion.div 
        className="max-w-7xl mx-auto px-6 py-16"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="rounded-xl border border-gray-800 p-2 bg-gradient-to-b from-gray-900 to-black"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-lg bg-gray-900 p-4 h-96 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="inline-block"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </motion.div>
              <motion.p 
                className="mt-4 text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Your Next Project Could Be Here
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Start Building Section with Reveal on Scroll */}
      <motion.div 
        className="px-6 py-24 text-center bg-gradient-to-b from-black to-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          className="text-4xl font-bold mb-6"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to Start Building?
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join developers who deploy their projects with Mini-Vercel.
        </motion.p>
        <motion.button 
          onClick={() => navigate('/login')}
          className="bg-white text-black px-8 py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Deploy Your First Project
        </motion.button>
      </motion.div>
    </div>
  );
}