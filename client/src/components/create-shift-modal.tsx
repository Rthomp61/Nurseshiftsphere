import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateShiftModal({ isOpen, onClose }: CreateShiftModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    payRate: "",
    patientRatio: "",
    additionalNotes: "",
    priority: "normal",
    requirements: {
      rnLicense: true,
      bls: false,
      acls: false,
      icuExperience: false,
    },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      let endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      // If end time is before start time, assume it's the next day (overnight shift)
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      await apiRequest("POST", "/api/shifts", {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        payRate: formData.payRate,
        patientRatio: formData.patientRatio,
        additionalNotes: formData.additionalNotes,
        priority: formData.priority,
        requirements: formData.requirements,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
      toast({
        title: "Shift Created Successfully!",
        description: `${formData.title} has been posted and is now available for nurses to claim`,
        className: "notification-toast",
      });
      
      // Reset form
      setFormData({
        title: "",
        department: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
        payRate: "",
        patientRatio: "",
        additionalNotes: "",
        priority: "normal",
        requirements: {
          rnLicense: true,
          bls: false,
          acls: false,
          icuExperience: false,
        },
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
        title: "Failed to Create Shift",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.department || !formData.location || 
        !formData.date || !formData.startTime || !formData.endTime || !formData.payRate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if end time is after start time (handle overnight shifts)
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    let endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    
    // If end time is before start time, assume it's the next day (overnight shift)
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    // Now check if the shift duration is reasonable (max 24 hours)
    const shiftDurationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (shiftDurationHours > 24) {
      toast({
        title: "Validation Error",
        description: "Shift duration cannot exceed 24 hours.",
        variant: "destructive",
      });
      return;
    }

    // Check if shift is at least 3 hours in the future
    const now = new Date();
    const timeDiff = startDateTime.getTime() - now.getTime();
    const hoursUntilShift = timeDiff / (1000 * 60 * 60);

    if (hoursUntilShift < 3) {
      toast({
        title: "Validation Error",
        description: "Shifts must be created at least 3 hours in advance.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate();
  };

  const updateRequirement = (key: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [key]: checked,
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-0 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-800">Create New Shift</DialogTitle>
            <p className="text-gray-600">Fill in the details below to post a new shift</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2">
                Shift Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., ICU Night Shift"
                required
              />
            </div>
            <div>
              <Label htmlFor="department" className="text-sm font-medium text-gray-700 mb-2">
                Department *
              </Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Emergency Department">Emergency Department</SelectItem>
                  <SelectItem value="Medical-Surgical">Medical-Surgical</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Operating Room">Operating Room</SelectItem>
                  <SelectItem value="Labor & Delivery">Labor & Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2">
              Location *
            </Label>
            <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
              <SelectTrigger className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="City General Hospital">City General Hospital</SelectItem>
                <SelectItem value="Regional Medical Center">Regional Medical Center</SelectItem>
                <SelectItem value="University Hospital">University Hospital</SelectItem>
                <SelectItem value="Children's Hospital">Children's Hospital</SelectItem>
                <SelectItem value="Community Health Center">Community Health Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 mb-2">
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Pay Rate and Requirements */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="payRate" className="text-sm font-medium text-gray-700 mb-2">
                Pay Rate (per hour) *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <Input
                  id="payRate"
                  type="number"
                  value={formData.payRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, payRate: e.target.value }))}
                  className="bg-white/30 border-gray-300 border-2 pl-8 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="65.00"
                  step="0.50"
                  min="25"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="patientRatio" className="text-sm font-medium text-gray-700 mb-2">
                Patient Ratio
              </Label>
              <Select value={formData.patientRatio} onValueChange={(value) => setFormData(prev => ({ ...prev, patientRatio: value }))}>
                <SelectTrigger className="bg-white/30 border-gray-300 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:4 (ICU)">1:4 (ICU)</SelectItem>
                  <SelectItem value="1:6 (Med-Surg)">1:6 (Med-Surg)</SelectItem>
                  <SelectItem value="1:8 (General)">1:8 (General)</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3">Requirements</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <Checkbox 
                  checked={formData.requirements.rnLicense}
                  onCheckedChange={(checked) => updateRequirement('rnLicense', checked === true)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">RN License Required</span>
              </label>
              <label className="flex items-center glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <Checkbox 
                  checked={formData.requirements.bls}
                  onCheckedChange={(checked) => updateRequirement('bls', checked === true)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">BLS Certification</span>
              </label>
              <label className="flex items-center glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <Checkbox 
                  checked={formData.requirements.acls}
                  onCheckedChange={(checked) => updateRequirement('acls', checked === true)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">ACLS Certification</span>
              </label>
              <label className="flex items-center glass-morphism rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <Checkbox 
                  checked={formData.requirements.icuExperience}
                  onCheckedChange={(checked) => updateRequirement('icuExperience', checked === true)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">ICU Experience</span>
              </label>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="glass-morphism border-0 focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Any special instructions or requirements..."
            />
          </div>

          {/* Priority Settings */}
          <GlassCard className="rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Posting Options</h4>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={formData.priority === "normal"}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mr-3 text-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Standard Post</p>
                  <p className="text-xs text-gray-500">Regular visibility to available nurses</p>
                </div>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={formData.priority === "urgent"}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mr-3 text-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Urgent Post</p>
                  <p className="text-xs text-gray-500">Higher visibility and priority placement</p>
                </div>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="critical"
                  checked={formData.priority === "critical"}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mr-3 text-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Critical Post</p>
                  <p className="text-xs text-gray-500">Maximum visibility with instant notifications</p>
                </div>
              </label>
            </div>
          </GlassCard>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 glass-morphism rounded-xl py-3 text-gray-700 font-medium hover:bg-white/20 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2" />
                  Create Shift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}