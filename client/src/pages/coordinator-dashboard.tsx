import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CreateShiftModal } from "../components/create-shift-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompletedShiftsModal } from "../components/completed-shifts-modal";

export default function CoordinatorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [showCriticalShifts, setShowCriticalShifts] = useState(false);
  const [showCompletedShifts, setShowCompletedShifts] = useState(false);

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

  const { data: shifts } = useQuery({
    queryKey: ["/api/my-shifts"],
    enabled: !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const urgentShifts = (shifts && Array.isArray(shifts) ? shifts.filter((shift: any) => {
    const now = new Date();
    const timeDiff = new Date(shift.startTime).getTime() - now.getTime();
    const hoursUntilShift = timeDiff / (1000 * 60 * 60);
    return hoursUntilShift < 2 && shift.status === 'open';
  }) : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Coordinator Navigation */}
      <nav className="glass-morphism sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users-cog text-white text-sm" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">ShiftGenie <span className="text-purple-600">Pro</span></h1>
              </div>
              {/* Role Toggle Slider */}
              <div className="flex items-center bg-white/20 rounded-xl p-1">
                <div className="relative w-20 h-8 bg-white/30 rounded-lg">
                  <button
                    onClick={async () => {
                      await fetch('/api/users/switch-role', { 
                        method: 'POST', 
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: 'nurse' })
                      });
                      window.location.reload();
                    }}
                    className="absolute left-0 top-0 w-10 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                  >
                    <i className="fas fa-user-nurse text-xs" />
                  </button>
                  <div className="absolute right-0 top-0 w-10 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <i className="fas fa-user-tie text-white text-xs" />
                  </div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Coordinator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                  alt="Coordinator profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50" 
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">Shift Coordinator</p>
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
        {/* Coordinator Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Shifts</p>
                <p className="text-3xl font-bold text-red-600 animate-counter-up">
                  {(stats as any)?.openShifts || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl">
                <i className="fas fa-exclamation-circle text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fill Rate</p>
                <p className="text-3xl font-bold text-green-600 animate-counter-up">
                  {(stats as any)?.fillRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl">
                <i className="fas fa-chart-line text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Nurses</p>
                <p className="text-3xl font-bold text-blue-600 animate-counter-up">
                  {(stats as any)?.activeNurses || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl">
                <i className="fas fa-user-nurse text-white" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Cost</p>
                <p className="pay-rate text-2xl font-bold font-mono animate-counter-up">
                  ${Math.round(((stats as any)?.weeklyCost || 0) / 1000)}K
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl">
                <i className="fas fa-dollar-sign text-white" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shift Management Board */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Shift Management</h2>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowCompletedShifts(true)}
                  variant="outline"
                  className="px-4 py-2 rounded-xl font-medium border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <i className="fas fa-history mr-2" />View Completed
                </Button>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  <i className="fas fa-plus mr-2" />Create New Shift
                </Button>
              </div>
            </div>

            {/* Urgent Shifts Alert */}
            {urgentShifts.length > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-6 text-white animate-pulse-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-2">⚠️ Urgent: {urgentShifts.length} shifts need immediate attention</h3>
                    <p className="text-red-100">These shifts start within 2 hours and are still unfilled</p>
                  </div>
                  <Button 
                    onClick={() => setShowCriticalShifts(true)}
                    className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
                  >
                    View Critical
                  </Button>
                </div>
              </div>
            )}

            {/* Shift Status Grid */}
            <div className="space-y-4">
              {shifts && Array.isArray(shifts) && shifts.length > 0 ? (
                shifts.slice(0, 5).map((shift: any) => {
                  const now = new Date();
                  const timeDiff = new Date(shift.startTime).getTime() - now.getTime();
                  const hoursUntilShift = timeDiff / (1000 * 60 * 60);
                  const isUrgent = hoursUntilShift < 2 && shift.status === 'open';
                  
                  return (
                    <GlassCard 
                      key={shift.id} 
                      className={`rounded-2xl p-6 border-l-4 ${
                        isUrgent ? 'border-red-500' : 
                        shift.status === 'claimed' ? 'border-green-500' : 
                        'border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-800">{shift.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isUrgent ? 'bg-red-500 text-white animate-pulse' :
                              shift.status === 'claimed' ? 'bg-green-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {isUrgent ? `UNFILLED - ${Math.round(hoursUntilShift)}h ${Math.round((hoursUntilShift % 1) * 60)}m` :
                               shift.status === 'claimed' ? 'FILLED' : 
                               'ACTIVE'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {new Date(shift.startTime).toLocaleDateString()} • {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-600">{shift.location} • {shift.patientRatio || 'Variable ratio'}</p>
                        </div>
                        <div className="text-right">
                          <div className="pay-rate text-2xl font-bold font-mono">${shift.payRate}/hr</div>
                          <p className="text-sm text-gray-500">
                            ${Math.round(parseFloat(shift.payRate) * ((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)))} total cost
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            shift.status === 'claimed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {shift.status === 'claimed' ? `Claimed by ${shift.claimedBy?.firstName || 'Unknown'}` : '0 applicants'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Posted {Math.round((now.getTime() - new Date(shift.createdAt).getTime()) / (1000 * 60 * 60))}h ago
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {shift.status === 'open' && (
                            <Button className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-all">
                              <i className="fas fa-bullhorn mr-1" />Boost
                            </Button>
                          )}
                          <Button 
                            onClick={() => setEditingShift(shift)}
                            className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-600 transition-all"
                          >
                            <i className="fas fa-edit mr-1" />Edit
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              ) : (
                <GlassCard className="rounded-2xl p-8 text-center">
                  <i className="fas fa-calendar-plus text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No shifts created yet</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first shift</p>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <i className="fas fa-plus mr-2" />Create Shift
                  </Button>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-chart-pie text-purple-500 mr-2" />
                Today's Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Shifts Posted</span>
                  <span className="font-semibold text-gray-800">{(shifts && Array.isArray(shifts) ? shifts.length : 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filled</span>
                  <span className="font-semibold text-green-600">
                    {(shifts && Array.isArray(shifts) ? shifts.filter((s: any) => s.status === 'claimed').length : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-blue-600">
                    {(shifts && Array.isArray(shifts) ? shifts.filter((s: any) => s.status === 'open').length : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Fill Time</span>
                  <span className="font-semibold text-purple-600">2.5h</span>
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-history text-blue-500 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">Shift claimed by nurse</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">New shift created</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">Nurse updated availability</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Top Performers */}
            <GlassCard className="rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-star text-yellow-500 mr-2" />
                Top Performers
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
                      alt="Top performer" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">24 shifts • 4.9★</p>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">MVP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
                      alt="Top performer 2" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Michael Chen</p>
                      <p className="text-xs text-gray-500">19 shifts • 4.8★</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">⭐</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <CreateShiftModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      {/* Edit Shift Modal */}
      {editingShift && (
        <CreateShiftModal 
          isOpen={!!editingShift} 
          onClose={() => setEditingShift(null)}
          editData={editingShift}
        />
      )}

      {/* Critical Shifts Modal */}
      <Dialog open={showCriticalShifts} onOpenChange={setShowCriticalShifts}>
        <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              ⚠️ Critical & Urgent Shifts
            </DialogTitle>
            <p className="text-gray-600">
              Shifts requiring immediate attention (starting within 2 hours)
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {urgentShifts.length > 0 ? (
              urgentShifts.map((shift: any) => {
                const now = new Date();
                const timeDiff = new Date(shift.startTime).getTime() - now.getTime();
                const hoursUntilShift = timeDiff / (1000 * 60 * 60);
                const minutesUntilShift = Math.round((hoursUntilShift % 1) * 60);
                
                return (
                  <GlassCard key={shift.id} className="rounded-2xl p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{shift.title}</h3>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            CRITICAL
                          </span>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {Math.floor(hoursUntilShift)}h {minutesUntilShift}m left
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <i className="far fa-clock mr-2 text-blue-500" />
                          <span>
                            {new Date(shift.startTime).toLocaleDateString()} • {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <i className="fas fa-map-marker-alt mr-2 text-red-400" />
                          <span>{shift.location} - {shift.department}</span>
                        </div>
                        <div className="text-2xl font-bold pay-rate">${shift.payRate}/hr</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => setEditingShift(shift)}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-all"
                        >
                          <i className="fas fa-edit mr-1" />Edit
                        </Button>
                        <Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-all">
                          <i className="fas fa-bullhorn mr-1" />Boost Pay
                        </Button>
                      </div>
                    </div>
                    {shift.additionalNotes && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">{shift.additionalNotes}</p>
                      </div>
                    )}
                  </GlassCard>
                );
              })
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-green-500 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">All Good!</h3>
                <p className="text-gray-500">No critical shifts requiring immediate attention.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completed Shifts Modal */}
      <CompletedShiftsModal 
        isOpen={showCompletedShifts} 
        onClose={() => setShowCompletedShifts(false)} 
      />
    </div>
  );
}
