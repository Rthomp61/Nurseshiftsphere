import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShiftCard } from "../components/shift-card";
import { ClaimModal } from "../components/claim-modal";
import { type ShiftWithDetails } from "@shared/schema";

export function ShiftBoard() {
  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");

  const { data: shifts, isLoading } = useQuery({
    queryKey: ["/api/shifts", { status: statusFilter }],
    retry: false,
  });

  const handleClaimShift = (shift: ShiftWithDetails) => {
    setSelectedShift(shift);
    setIsClaimModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-4" />
            <div className="h-8 bg-gray-300 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Available Shifts</h2>
        <div className="flex items-center space-x-2">
          <div className="glass-morphism rounded-lg px-4 py-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-transparent border-0 text-sm text-gray-600 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">All Available</SelectItem>
                <SelectItem value="urgent">Urgent Only</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" className="glass-morphism rounded-lg p-2 hover:bg-white/20">
            <i className="fas fa-filter text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 custom-scroll max-h-96 overflow-y-auto pr-2">
        {shifts && Array.isArray(shifts) && shifts.length > 0 ? (
          shifts.map((shift: ShiftWithDetails) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onClaim={handleClaimShift}
            />
          ))
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center">
            <i className="fas fa-calendar-alt text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No shifts available</h3>
            <p className="text-gray-500">Check back later for new opportunities</p>
          </div>
        )}
      </div>

      {selectedShift && (
        <ClaimModal
          shift={selectedShift}
          isOpen={isClaimModalOpen}
          onClose={() => {
            setIsClaimModalOpen(false);
            setSelectedShift(null);
          }}
        />
      )}
    </div>
  );
}