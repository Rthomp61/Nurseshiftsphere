import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/useAuth";

interface CompletedShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompletedShiftsModal({ isOpen, onClose }: CompletedShiftsModalProps) {
  const { user } = useAuth();
  
  const { data: completedShifts, isLoading } = useQuery({
    queryKey: ["/api/completed-shifts"],
    enabled: isOpen && !!user,
    retry: false,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.round(duration * 10) / 10; // Round to 1 decimal place
  };

  const calculateEarnings = (startTime: string, endTime: string, payRate: string) => {
    const duration = calculateDuration(startTime, endTime);
    return Math.round(duration * parseFloat(payRate));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            📋 Completed Shifts History
          </DialogTitle>
          <p className="text-gray-600">
            {user?.role === 'nurse' 
              ? "Your completed shift assignments and earnings" 
              : "Shifts you've created that have been completed"
            }
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-300 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : completedShifts && completedShifts.length > 0 ? (
            completedShifts.map((shift: any) => {
              const startTime = new Date(shift.startTime);
              const endTime = new Date(shift.endTime);
              const duration = calculateDuration(shift.startTime, shift.endTime);
              const earnings = calculateEarnings(shift.startTime, shift.endTime, shift.payRate);
              const daysSince = Math.floor((new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <GlassCard key={shift.id} className="rounded-2xl p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{shift.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Completed
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <i className="far fa-clock mr-2 text-blue-500" />
                        <span>
                          {formatDate(startTime)} • {formatTime(startTime)} - {formatTime(endTime)} ({duration}hrs)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <i className="fas fa-map-marker-alt mr-2 text-red-400" />
                        <span>{shift.location} - {shift.department}</span>
                      </div>
                      {user?.role === 'nurse' && (
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <i className="fas fa-dollar-sign mr-2" />
                          <span>Earned: ${earnings} (${shift.payRate}/hr)</span>
                        </div>
                      )}
                      {user?.role === 'coordinator' && shift.claimedBy && (
                        <div className="flex items-center text-sm text-blue-600">
                          <i className="fas fa-user-nurse mr-2" />
                          <span>Completed by: {shift.claimedBy.firstName} {shift.claimedBy.lastName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="pay-rate text-2xl font-bold font-mono mb-1">${shift.payRate}/hr</div>
                      {user?.role === 'nurse' && (
                        <div className="text-sm text-green-600 font-medium">${earnings} total</div>
                      )}
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
            <div className="text-center py-12">
              <i className="fas fa-history text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Completed Shifts</h3>
              <p className="text-gray-500">
                {user?.role === 'nurse' 
                  ? "You haven't completed any shifts yet. Start claiming shifts to build your history!" 
                  : "No completed shifts found. Shifts you create will appear here after they're finished."
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <Button onClick={onClose} variant="outline" className="px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}