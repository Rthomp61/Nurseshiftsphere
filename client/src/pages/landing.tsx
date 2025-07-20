import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/80 via-cyan-500/60 to-teal-500/60"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-lg animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-teal-400/15 rounded-full blur-lg animate-float-slow" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Hero Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Shift
                  <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    Genie
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
                  Revolutionizing healthcare shift management with real-time updates, 
                  smart matching, and glass-morphism design that nurses actually love to use.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={handleLogin}
                    className="glass-morphism px-8 py-6 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg"
                    variant="ghost"
                  >
                    <i className="fas fa-user-nurse mr-2" />
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Right Column: Feature Preview Cards */}
              <div className="lg:block hidden">
                <div className="relative">
                  {/* Live Shift Card */}
                  <GlassCard className="rounded-2xl p-6 mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">ICU Night Shift</h3>
                        <p className="text-sm text-gray-600">7:00 PM - 7:00 AM</p>
                      </div>
                      <div className="text-right">
                        <div className="pay-rate text-2xl font-bold font-mono">$65/hr</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <i className="fas fa-map-marker-alt text-red-400 mr-1" />
                      City General Hospital
                    </p>
                    <Button className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                      <i className="fas fa-hand-pointer mr-1" /> Claim Shift
                    </Button>
                  </GlassCard>

                  {/* Stats Card */}
                  <GlassCard className="rounded-2xl p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <h3 className="font-semibold text-gray-800 mb-3">This Week</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="pay-rate text-xl font-bold font-mono">$2,340</div>
                        <p className="text-xs text-gray-600">Earned</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">36h</div>
                        <p className="text-xs text-gray-600">Worked</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
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
