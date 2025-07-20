import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShiftBoard } from "../components/shift-board";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function NurseDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
    retry: false,
  });

  const { data: myShifts } = useQuery({
    queryKey: ["/api/my-shifts"],
    enabled: !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="glass-morphism sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-magic text-white text-sm" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">ShiftGenie</h1>
              </div>
              <div className="hidden md:flex bg-white/20 rounded-lg p-1">
                <button className="px-4 py-2 rounded-md bg-white/30 text-gray-800 font-medium">
                  <i className="fas fa-th-large mr-2" />Dashboard
                </button>
                <button className="px-4 py-2 rounded-md text-gray-600 hover:bg-white/20 transition-all">
                  <i className="fas fa-calendar-alt mr-2" />Shifts
                </button>
                <button 
                  onClick={() => {
                    // Simulate role switch for demo purposes
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-md text-gray-600 hover:bg-white/20 transition-all"
                >
                  <i className="fas fa-user-tie mr-2" />Coordinator View
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button className="relative p-2 glass-morphism rounded-lg hover:bg-white/20 transition-all">
                  <i className="fas fa-bell text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </button>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <img 
                  src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                  alt="Profile picture" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50" 
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">RN • Available</p>
                </div>
              </div>
              
              <Button
                onClick={() => window.location.href = "/api/logout"}
                variant="ghost"
                size="sm"
                className="glass-morphism hover:bg-white/20"
              >
                <i className="fas fa-sign-out-alt mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="pay-rate text-2xl font-bold font-mono animate-counter-up">
                  ${(stats as any)?.weeklyEarnings || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl">
                <i className="fas fa-dollar-sign text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                <p className="text-2xl font-bold text-blue-600 animate-counter-up">
                  {(stats as any)?.hoursWorked || 0}h
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl">
                <i className="fas fa-clock text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shifts Claimed</p>
                <p className="text-2xl font-bold text-purple-600 animate-counter-up">
                  {(stats as any)?.shiftsClaimed || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl">
                <i className="fas fa-hand-pointer text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-orange-500 animate-counter-up">
                    {(stats as any)?.averageRating || 4.9}
                  </p>
                  <div className="ml-2">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400 text-xs" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl">
                <i className="fas fa-star text-white" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Shifts Board */}
          <div className="lg:col-span-2">
            <ShiftBoard />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* My Upcoming Shifts */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-calendar-check text-blue-500 mr-2" />
                My Upcoming Shifts
              </h3>
              <div className="space-y-3">
                {myShifts && Array.isArray(myShifts) && myShifts.length > 0 ? (
                  myShifts.slice(0, 2).map((shift: any) => (
                    <div key={shift.id} className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{shift.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(shift.startTime).toLocaleDateString()} {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-
                            {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-gray-500">{shift.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="pay-rate font-bold font-mono">${shift.payRate}/hr</p>
                          <p className="text-xs text-green-600">
                            ${Math.round(parseFloat(shift.payRate) * ((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming shifts</p>
                )}
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-bolt text-yellow-500 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group">
                  <div className="flex items-center">
                    <i className="fas fa-user-clock text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Update Availability</span>
                  </div>
                </button>
                <button className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group">
                  <div className="flex items-center">
                    <i className="fas fa-map-marked-alt text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Set Preferred Locations</span>
                  </div>
                </button>
                <button className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group">
                  <div className="flex items-center">
                    <i className="fas fa-chart-line text-purple-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">View Earnings Report</span>
                  </div>
                </button>
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-trophy text-yellow-500 mr-2" />
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center bg-yellow-50 rounded-xl p-3">
                  <i className="fas fa-medal text-yellow-500 text-xl mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Perfect Week</p>
                    <p className="text-xs text-gray-600">No missed shifts this week</p>
                  </div>
                </div>
                <div className="flex items-center bg-blue-50 rounded-xl p-3 opacity-60">
                  <i className="far fa-star text-blue-500 text-xl mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Quick Responder</p>
                    <p className="text-xs text-gray-600">Claim 5 shifts within 1 hour</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
