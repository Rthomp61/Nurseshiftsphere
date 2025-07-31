import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function Landing() {
  const handleLogin = (role: 'nurse' | 'coordinator') => {
    // Store the intended role in sessionStorage so we can set it after login
    sessionStorage.setItem('intendedRole', role);
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hospital Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Light overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title */}
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-white drop-shadow-2xl">Shift</span>
              <span className="text-teal-400 drop-shadow-2xl">Genie</span>
            </h1>
            
            {/* Description */}
            <p className="text-xl lg:text-2xl text-white font-medium mb-16 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              Revolutionizing healthcare shift management with real-time updates, smart
              matching, and glass-morphism design that nurses actually love to use.
            </p>
            
            {/* Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div 
                onClick={() => handleLogin('nurse')}
                className="group cursor-pointer bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-black/60 transition-all duration-300 transform hover:scale-105 min-w-[300px]"
              >
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-user-md text-xl" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">I'm a Practitioner</div>
                    <div className="text-sm opacity-80">Find and claim shifts</div>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => handleLogin('coordinator')}
                className="group cursor-pointer bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-black/60 transition-all duration-300 transform hover:scale-105 min-w-[300px]"
              >
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clipboard-list text-xl" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">I'm a Coordinator</div>
                    <div className="text-sm opacity-80">Manage shifts & staff</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
