import { useNavigate } from "react-router-dom";
import useStore from "../store/store";
import axios  from "axios";

export default function Header() {
  const navigate = useNavigate();
  const { login, setLogin } = useStore();

  return (
    <header className="bg-gradient-to-r from-gray-900 to-black text-white border-b border-gray-800">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">👾</span>
          <span className="text-xl font-bold tracking-tight">Mini Vercel</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-8">
          {login ? (
            <>
              {/* Dashboard Link */}
              <div className="text-white transition-colors">{login}</div>
              <a 
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </a>

              {/* Logout Button */}
              <button 
                onClick={async() => {
                  setLogin(null);  // ✅ Clearing Zustand login state
                  await axios.post('https://api.naresh.today/auth/logout',{},{withCredentials:true});
                  navigate('/');    // ✅ Redirect to home after logout
                }} 
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <button 
                onClick={() => navigate('/login')} 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
