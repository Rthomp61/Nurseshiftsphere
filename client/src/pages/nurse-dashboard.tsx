import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShiftBoard } from "../components/shift-board";
import { GlassCard } from "../components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function NurseDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  const [availability, setAvailability] = useState({
    monday: { morning: false, afternoon: false, evening: false, night: false },
    tuesday: { morning: false, afternoon: false, evening: false, night: false },
    wednesday: { morning: false, afternoon: false, evening: false, night: false },
    thursday: { morning: false, afternoon: false, evening: false, night: false },
    friday: { morning: false, afternoon: false, evening: false, night: false },
    saturday: { morning: false, afternoon: false, evening: false, night: false },
    sunday: { morning: false, afternoon: false, evening: false, night: false },
  });
  const [preferredLocations, setPreferredLocations] = useState({
    cityGeneral: false,
    regionalMedical: false,
    universityHospital: false,
    childrensHospital: false,
    communityHealth: false,
  });

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
              {/* Role Toggle Slider */}
              <div className="flex items-center bg-white/20 rounded-xl p-1">
                <div className="relative w-20 h-8 bg-white/30 rounded-lg">
                  <div className="absolute left-0 top-0 w-10 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <i className="fas fa-user-nurse text-white text-xs" />
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/users/switch-role', { 
                        method: 'POST', 
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: 'coordinator' })
                      });
                      window.location.reload();
                    }}
                    className="absolute right-0 top-0 w-10 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                  >
                    <i className="fas fa-user-tie text-xs" />
                  </button>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Nurse</span>
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
                <button 
                  onClick={() => setIsAvailabilityModalOpen(true)}
                  className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <i className="fas fa-user-clock text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Update Availability</span>
                  </div>
                </button>
                <button 
                  onClick={() => setIsLocationsModalOpen(true)}
                  className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <i className="fas fa-map-marked-alt text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Set Preferred Locations</span>
                  </div>
                </button>
                <button 
                  onClick={() => setIsEarningsModalOpen(true)}
                  className="w-full text-left glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all duration-200 group"
                >
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

      {/* Availability Modal */}
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-lg">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">Update Availability</DialogTitle>
            <p className="text-gray-600">Set your weekly availability preferences</p>
          </DialogHeader>
          
          <div className="space-y-4">
            {Object.entries(availability).map(([day, times]) => (
              <div key={day} className="bg-white/20 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 capitalize">{day}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(times).map(([shift, checked]) => (
                    <label key={shift} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          setAvailability(prev => ({
                            ...prev,
                            [day]: {
                              ...prev[day],
                              [shift]: isChecked === true
                            }
                          }));
                        }}
                      />
                      <span className="text-sm text-gray-700 capitalize">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsAvailabilityModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Availability Updated",
                  description: "Your availability preferences have been saved successfully.",
                  className: "notification-toast",
                });
                setIsAvailabilityModalOpen(false);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferred Locations Modal */}
      <Dialog open={isLocationsModalOpen} onOpenChange={setIsLocationsModalOpen}>
        <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">Set Preferred Locations</DialogTitle>
            <p className="text-gray-600">Select healthcare facilities where you prefer to work</p>
          </DialogHeader>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 bg-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all">
              <Checkbox
                checked={preferredLocations.cityGeneral}
                onCheckedChange={(checked) => 
                  setPreferredLocations(prev => ({ ...prev, cityGeneral: checked === true }))
                }
              />
              <div>
                <p className="font-medium text-gray-800">City General Hospital</p>
                <p className="text-sm text-gray-600">Downtown • 15 min drive</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 bg-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all">
              <Checkbox
                checked={preferredLocations.regionalMedical}
                onCheckedChange={(checked) => 
                  setPreferredLocations(prev => ({ ...prev, regionalMedical: checked === true }))
                }
              />
              <div>
                <p className="font-medium text-gray-800">Regional Medical Center</p>
                <p className="text-sm text-gray-600">Midtown • 20 min drive</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 bg-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all">
              <Checkbox
                checked={preferredLocations.universityHospital}
                onCheckedChange={(checked) => 
                  setPreferredLocations(prev => ({ ...prev, universityHospital: checked === true }))
                }
              />
              <div>
                <p className="font-medium text-gray-800">University Hospital</p>
                <p className="text-sm text-gray-600">University District • 25 min drive</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 bg-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all">
              <Checkbox
                checked={preferredLocations.childrensHospital}
                onCheckedChange={(checked) => 
                  setPreferredLocations(prev => ({ ...prev, childrensHospital: checked === true }))
                }
              />
              <div>
                <p className="font-medium text-gray-800">Children's Hospital</p>
                <p className="text-sm text-gray-600">Northside • 30 min drive</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 bg-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all">
              <Checkbox
                checked={preferredLocations.communityHealth}
                onCheckedChange={(checked) => 
                  setPreferredLocations(prev => ({ ...prev, communityHealth: checked === true }))
                }
              />
              <div>
                <p className="font-medium text-gray-800">Community Health Center</p>
                <p className="text-sm text-gray-600">Westside • 18 min drive</p>
              </div>
            </label>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsLocationsModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Location Preferences Updated",
                  description: "Your preferred work locations have been saved successfully.",
                  className: "notification-toast",
                });
                setIsLocationsModalOpen(false);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Earnings Report Modal */}
      <Dialog open={isEarningsModalOpen} onOpenChange={setIsEarningsModalOpen}>
        <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">Earnings Report</DialogTitle>
            <p className="text-gray-600">Detailed breakdown of your earnings and hours</p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-green-600">$1,722</p>
                  </div>
                  <i className="fas fa-dollar-sign text-green-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hours Worked</p>
                    <p className="text-2xl font-bold text-blue-600">24h</p>
                  </div>
                  <i className="fas fa-clock text-blue-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Hourly</p>
                    <p className="text-2xl font-bold text-purple-600">$71.75</p>
                  </div>
                  <i className="fas fa-chart-line text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Recent Shifts */}
            <div className="bg-white/20 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Recent Shifts</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-800">Emergency Department - Day Shift</p>
                    <p className="text-sm text-gray-600">Jan 20, 2025 • 7:00 AM - 7:00 PM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$860</p>
                    <p className="text-sm text-gray-600">12 hours</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-800">ICU Night Shift</p>
                    <p className="text-sm text-gray-600">Jan 19, 2025 • 7:00 PM - 7:00 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$862</p>
                    <p className="text-sm text-gray-600">12 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Overview */}
            <div className="bg-white/20 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-4">January 2025 Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-800">$5,166</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-xl font-bold text-gray-800">72h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shifts Completed</p>
                  <p className="text-xl font-bold text-gray-800">6</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Perfect Attendance</p>
                  <p className="text-xl font-bold text-green-600">100%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsEarningsModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Export Coming Soon",
                  description: "Earnings export feature will be available in the next update.",
                  className: "notification-toast",
                });
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              Export Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
