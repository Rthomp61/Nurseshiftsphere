import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";
import { type ShiftWithDetails } from "@shared/schema";

interface ClaimModalProps {
  shift: ShiftWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimModal({ shift, isOpen, onClose }: ClaimModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch incentive preview
  const { data: incentivePreview, isLoading: isLoadingIncentive } = useQuery({
    queryKey: ['/api/shifts', shift.id, 'incentive-preview'],
    enabled: isOpen,
    retry: false,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/shifts/${shift.id}/claim`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
      const bonusMessage = earlyClaimBonus > 0 
        ? ` with +$${earlyClaimBonus.toFixed(2)}/hr Early Bird bonus!` 
        : '';
      
      toast({
        title: "Shift Claimed Successfully!",
        description: `${shift.title} has been added to your schedule${bonusMessage}`,
        className: "notification-toast",
      });
      
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Failed to Claim Shift",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Use incentive preview if available, otherwise fallback to shift rate
  const incentiveData = incentivePreview as { 
    totalHourlyRate: number; 
    earlyClaimBonus: number; 
    baseHourlyRate: number; 
    hoursBeforeStart: number;
  } | undefined;
  
  const displayRate = incentiveData?.totalHourlyRate || parseFloat(shift.payRate);
  const totalPay = Math.round(duration * displayRate);
  const earlyClaimBonus = incentiveData?.earlyClaimBonus || 0;
  
  const now = new Date();
  const timeDiff = startTime.getTime() - now.getTime();
  const hoursUntilShift = timeDiff / (1000 * 60 * 60);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleClaim = () => {
    if (!isConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you can fulfill this shift.",
        variant: "destructive",
      });
      return;
    }
    
    claimMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-lg">
        <DialogHeader className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl mb-4 mx-auto">
            <i className="fas fa-hand-pointer text-white text-2xl" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">Claim This Shift</DialogTitle>
          <p className="text-gray-600">Confirm you want to claim this shift</p>
        </DialogHeader>

        {/* Shift Details Summary */}
        <GlassCard className="rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{shift.title}</h3>
              <p className="text-sm text-gray-600">
                {formatDate(startTime)} • {formatTime(startTime)} - {formatTime(endTime)} ({duration}hrs)
              </p>
              <p className="text-sm text-gray-600">{shift.location} - {shift.department}</p>
            </div>
            <div className="text-right">
              {earlyClaimBonus > 0 ? (
                <div className="relative">
                  {/* Enhanced Floating Early Bird Badge */}
                  <div className="absolute -top-4 -right-4 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-2 rounded-full font-bold shadow-xl early-bird-highlight border-2 border-yellow-300">
                      🐦 +${earlyClaimBonus.toFixed(2)}/hr
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-end gap-3 mb-2">
                      <span className="text-sm text-gray-500 line-through">${incentiveData?.baseHourlyRate.toFixed(2)}/hr</span>
                      <div className="bg-yellow-400 p-1 rounded-full">
                        <i className="fas fa-arrow-up text-white text-xs" />
                      </div>
                    </div>
                    <div className="pay-rate text-4xl font-bold font-mono text-green-700 drop-shadow-lg">
                      ${displayRate.toFixed(2)}/hr
                    </div>
                    <div className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-bold mt-2 inline-block">
                      🎯 +${(earlyClaimBonus * duration).toFixed(0)} Extra!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pay-rate text-3xl font-bold font-mono">${shift.payRate}/hr</div>
              )}
              <div className="text-sm text-green-600 font-medium mt-2">${totalPay} total</div>
            </div>
          </div>
          
          {/* Travel Time Warning */}
          {hoursUntilShift < 6 && hoursUntilShift > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-yellow-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Travel Time Notice</p>
                  <p className="text-xs text-yellow-700">
                    This shift starts in {Math.floor(hoursUntilShift)}h {Math.round((hoursUntilShift % 1) * 60)}m. 
                    Please ensure you have adequate travel time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Early Bird Bonus Celebration */}
          {earlyClaimBonus > 0 && (
            <div className="relative mb-4 overflow-hidden">
              {/* Enhanced celebration background */}
              <div className="absolute inset-0 celebration-bg opacity-30"></div>
              
              <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 border-2 border-amber-400 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-full shadow-lg bonus-sparkle">
                      <i className="fas fa-trophy text-white text-xl" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-amber-800">🎉 EARLY BIRD BONUS!</span>
                      <div className="text-sm text-amber-700 font-medium">
                        Amazing! You're claiming {incentiveData?.hoursBeforeStart.toFixed(1)} hours early
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2 rounded-xl font-bold shadow-lg">
                      +${earlyClaimBonus.toFixed(2)}/hr
                    </div>
                    <div className="text-xs text-green-700 font-medium mt-1">Bonus Rate!</div>
                  </div>
                </div>
                
                {/* Detailed breakdown with visual emphasis */}
                <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Rate:</span>
                      <span className="font-mono text-gray-500 line-through">${incentiveData?.baseHourlyRate.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Enhanced Rate:</span>
                      <span className="font-mono font-bold text-green-700">${displayRate.toFixed(2)}/hr</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-100 rounded-lg border border-green-300">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-coins text-green-600" />
                      <span className="text-green-800 font-bold">
                        Total Bonus Earned: +${(earlyClaimBonus * duration).toFixed(0)}
                      </span>
                      <i className="fas fa-star text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <i className="fas fa-users text-blue-500 mb-1" />
              <p className="text-xs text-gray-600">{shift.patientRatio || 'Variable'}</p>
            </div>
            <div>
              <i className="fas fa-clock text-green-500 mb-1" />
              <p className="text-xs text-gray-600">{duration}h shift</p>
            </div>
            <div>
              <i className="fas fa-star text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600">{shift.priority} priority</p>
            </div>
          </div>
        </GlassCard>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-start glass-morphism rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all">
            <Checkbox 
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
              className="mr-3 mt-1"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">I confirm I can fulfill this shift</p>
              <p className="text-xs text-gray-500">
                By checking this, you commit to completing this shift. Late cancellations may affect your rating.
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 glass-morphism rounded-xl py-3 text-gray-700 font-medium hover:bg-white/20 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaim}
            disabled={claimMutation.isPending}
            className="flex-1 bg-gradient-to-r from-green-400 to-teal-500 text-white py-3 rounded-xl font-medium hover:from-green-500 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2" />
                Claiming...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2" />
                Claim Shift
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
