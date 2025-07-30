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
      {/* Hero Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-cyan-900/75 to-teal-900/80" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-lg animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-teal-400/15 rounded-full blur-lg animate-float-slow" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Centered Hero Content */}
            <div className="text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-xl" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>
                Shift
                <span className="bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent drop-shadow-lg">
                  Genie
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-white font-medium mb-12 leading-relaxed max-w-4xl mx-auto drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Revolutionizing healthcare shift management with real-time updates, 
                smart matching, and glass-morphism design that nurses actually love to use.
              </p>
              
              {/* Dual Login Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={() => handleLogin('nurse')}
                  className="glass-morphism px-12 py-8 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-xl min-w-[280px]"
                  variant="ghost"
                >
                  <i className="fas fa-user-nurse mr-3 text-2xl" />
                  <div className="text-left">
                    <div className="font-bold">I'm a Practitioner</div>
                    <div className="text-sm opacity-80">Find and claim shifts</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleLogin('coordinator')}
                  className="glass-morphism px-12 py-8 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-xl min-w-[280px]"
                  variant="ghost"
                >
                  <i className="fas fa-clipboard-list mr-3 text-2xl" />
                  <div className="text-left">
                    <div className="font-bold">I'm a Coordinator</div>
                    <div className="text-sm opacity-80">Manage shifts & staff</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-white text-xl opacity-70" />
      </div>
    </div>
  );
}
