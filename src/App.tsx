import { Features } from './components/Features';
import { HeroSection } from './components/HeroSection';
import { Newsletter } from './components/Newsletter';
import { Particles } from './components/Particles';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Particles />  
      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <button
              // onClick={() => navigate('/login')}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-80 transition-opacity"
            >
              Bento
            </button>
            <span className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300">
              Coming Soon
            </span>
          </nav>
        </header>

        <main>
          <HeroSection />
          <Features />
          <Newsletter />
        </main>
      </div>
    </div>
  );
}

export default App;