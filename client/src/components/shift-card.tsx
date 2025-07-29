import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { type ShiftWithDetails } from "@shared/schema";

interface ShiftCardProps {
  shift: ShiftWithDetails;
  onClaim: (shift: ShiftWithDetails) => void;
}

export function ShiftCard({ shift, onClaim }: ShiftCardProps) {
  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  const now = new Date();
  const timeDiff = startTime.getTime() - now.getTime();
  const hoursUntilShift = timeDiff / (1000 * 60 * 60);
  
  // Calculate potential early claim bonus
  const calculateEarlyBonus = (hours: number): number => {
    if (hours >= 24) return 5.00;
    if (hours >= 12) return 3.00;
    if (hours >= 6) return 1.00;
    return 0.00;
  };
  
  const baseRate = parseFloat(shift.baseHourlyRate || shift.payRate);
  const potentialBonus = calculateEarlyBonus(hoursUntilShift);
  const potentialTotalRate = baseRate + potentialBonus;
  const totalPay = Math.round(duration * potentialTotalRate);
  
  const isUrgent = hoursUntilShift < 3;
  const isCritical = shift.priority === "critical" || hoursUntilShift < 2;

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

  return (
    <GlassCard 
      className={`rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-slide-in ${
        isCritical ? 'asymmetric-card' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-800 text-lg">{shift.title}</h3>
            {isCritical && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>
            )}
            {shift.priority === "urgent" && !isCritical && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Urgent</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <i className="far fa-clock mr-2 text-blue-500" />
            <span>
              {formatDate(startTime)} • {formatTime(startTime)} - {formatTime(endTime)} ({duration}hrs)
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-map-marker-alt mr-2 text-red-400" />
            <span>{shift.location} - {shift.department}</span>
          </div>
        </div>
        <div className="text-right">
          {potentialBonus > 0 ? (
            <div className="mb-2">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-sm text-gray-500 line-through">${baseRate.toFixed(2)}/hr</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  +${potentialBonus.toFixed(2)} Early Bird
                </span>
              </div>
              <div className="pay-rate text-3xl font-bold font-mono text-green-600">${potentialTotalRate.toFixed(2)}/hr</div>
            </div>
          ) : (
            <div className="pay-rate text-3xl font-bold font-mono mb-1">${shift.payRate}/hr</div>
          )}
          <div className="text-sm text-green-600 font-medium">${totalPay} total</div>
        </div>
      </div>
      
      {/* Early Bird Bonus Timer */}
      {potentialBonus > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-green-600" />
              <span className="text-sm font-medium text-gray-700">Early Bird Bonus Active</span>
            </div>
            <div className="text-sm text-gray-600">
              {hoursUntilShift >= 24 && "24+ hours early"}
              {hoursUntilShift >= 12 && hoursUntilShift < 24 && "12-24 hours early"}
              {hoursUntilShift >= 6 && hoursUntilShift < 12 && "6-12 hours early"}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {hoursUntilShift >= 24 && hoursUntilShift < 25 && "Bonus drops to $3/hr in less than 1 hour"}
            {hoursUntilShift >= 12 && hoursUntilShift < 13 && "Bonus drops to $1/hr in less than 1 hour"}
            {hoursUntilShift >= 6 && hoursUntilShift < 7 && "Bonus expires in less than 1 hour"}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {shift.patientRatio && (
            <span className="flex items-center">
              <i className="fas fa-users mr-1" /> {shift.patientRatio}
            </span>
          )}
          <span className="flex items-center">
            <i className="fas fa-hourglass-half mr-1" /> 
            {hoursUntilShift > 0 ? `${Math.floor(hoursUntilShift)}h ${Math.round((hoursUntilShift % 1) * 60)}m left` : 'Started'}
          </span>
        </div>
        <Button 
          onClick={() => onClaim(shift)}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
            isCritical 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
              : shift.priority === "urgent"
              ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600'
              : 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600'
          } text-white`}
        >
          <i className="fas fa-hand-pointer mr-1" /> Claim Now
        </Button>
      </div>
    </GlassCard>
  );
}