import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export default function UserFlowDemo() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [userRole, setUserRole] = useState('nurse');

  const flowSteps = {
    landing: {
      title: 'Landing Page',
      description: 'User arrives at ShiftGenie homepage',
      options: ['Login with Replit Auth'],
      next: 'auth'
    },
    auth: {
      title: 'Authentication',
      description: 'Replit OAuth login process',
      options: ['Choose Role: Nurse', 'Choose Role: Coordinator'],
      next: 'dashboard'
    },
    dashboard: {
      title: userRole === 'nurse' ? 'Nurse Dashboard' : 'Coordinator Dashboard',
      description: userRole === 'nurse' 
        ? 'View stats, available shifts, and personal management tools'
        : 'Manage posted shifts, create new shifts, and view analytics',
      options: userRole === 'nurse' 
        ? ['Browse Available Shifts', 'Update Availability', 'View Upcoming Shifts', 'Check Earnings']
        : ['Create New Shift', 'Manage Posted Shifts', 'View Analytics', 'Nurse Management'],
      next: userRole === 'nurse' ? 'nurseAction' : 'coordinatorAction'
    },
    nurseAction: {
      title: 'Nurse Actions',
      description: 'Primary nurse workflows',
      options: ['Claim Shift', 'Set Preferences', 'View Shift History', 'Generate Tax Report'],
      next: 'completion'
    },
    coordinatorAction: {
      title: 'Coordinator Actions', 
      description: 'Primary coordinator workflows',
      options: ['Post Emergency Shift', 'Review Applications', 'Send Invitations', 'Analyze Fill Rates'],
      next: 'completion'
    },
    completion: {
      title: 'Task Completed',
      description: 'User successfully completes their primary task',
      options: ['Return to Dashboard', 'Logout'],
      next: 'dashboard'
    }
  };

  const currentStepData = flowSteps[currentStep as keyof typeof flowSteps];

  const handleNext = (option: string) => {
    if (currentStep === 'auth') {
      if (option.includes('Nurse')) setUserRole('nurse');
      if (option.includes('Coordinator')) setUserRole('coordinator');
    }
    
    if (currentStepData.next === 'dashboard' && option === 'Logout') {
      setCurrentStep('landing');
    } else {
      setCurrentStep(currentStepData.next);
    }
  };

  const resetFlow = () => {
    setCurrentStep('landing');
    setUserRole('nurse');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ShiftGenie User Flow Demo
          </h1>
          <p className="text-gray-600">Interactive demonstration of key user journeys</p>
          <Button 
            onClick={resetFlow}
            variant="outline"
            className="mt-4"
          >
            Reset Flow
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {Object.keys(flowSteps).map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === currentStep 
                    ? 'bg-blue-500 text-white scale-110' 
                    : Object.keys(flowSteps).indexOf(currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-600 text-center">
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(flowSteps).indexOf(currentStep) + 1) / Object.keys(flowSteps).length * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Current Step Display */}
        <GlassCard className="rounded-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <i className={`fas ${
                currentStep === 'landing' ? 'fa-home' :
                currentStep === 'auth' ? 'fa-shield-alt' :
                currentStep === 'dashboard' ? 'fa-tachometer-alt' :
                currentStep.includes('Action') ? 'fa-tasks' :
                'fa-check-circle'
              } text-white text-xl`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* Role Indicator */}
          {(currentStep === 'dashboard' || currentStep.includes('Action')) && (
            <div className="text-center mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                userRole === 'nurse' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                <i className={`fas ${userRole === 'nurse' ? 'fa-user-md' : 'fa-users-cog'} mr-2`} />
                {userRole === 'nurse' ? 'Nurse View' : 'Coordinator View'}
              </span>
            </div>
          )}

          {/* Action Options */}
          <div className="grid gap-3">
            {currentStepData.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleNext(option)}
                className="w-full text-left justify-start p-4 h-auto bg-white/50 hover:bg-white/70 text-gray-800 border border-white/20"
                variant="ghost"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <i className={`fas ${
                      option.includes('Login') ? 'fa-sign-in-alt' :
                      option.includes('Role') || option.includes('Choose') ? 'fa-user-check' :
                      option.includes('Browse') || option.includes('View') ? 'fa-search' :
                      option.includes('Create') || option.includes('Post') ? 'fa-plus' :
                      option.includes('Claim') ? 'fa-hand-pointer' :
                      option.includes('Update') || option.includes('Set') ? 'fa-cog' :
                      option.includes('Manage') ? 'fa-tasks' :
                      'fa-arrow-right'
                    } text-white text-sm`} />
                  </div>
                  <div>
                    <p className="font-medium">{option}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.includes('Login') && 'Secure authentication with Replit'}
                      {option.includes('Nurse') && 'Access nurse dashboard and shift claiming'}
                      {option.includes('Coordinator') && 'Access coordinator tools and shift management'}
                      {option.includes('Browse') && 'View all available shifts with filters'}
                      {option.includes('Create') && 'Post new shifts with requirements and pay'}
                      {option.includes('Claim') && 'One-click shift claiming with conflict detection'}
                      {option.includes('Update') && 'Set availability preferences and locations'}
                      {option.includes('Upcoming') && 'Review claimed shifts and schedules'}
                      {option.includes('Earnings') && 'View 1099 tax reports and expense tracking'}
                      {option.includes('Analytics') && 'Monitor fill rates and performance metrics'}
                      {option.includes('Emergency') && 'Create high-priority shifts with bonuses'}
                      {option.includes('Tax') && 'Generate quarterly tax reports'}
                      {option.includes('Dashboard') && 'Return to main dashboard'}
                      {option.includes('Logout') && 'End session securely'}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </GlassCard>

        {/* Flow Summary */}
        <GlassCard className="rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-route text-blue-500 mr-2" />
            Flow Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Nurse Journey</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Login → Dashboard → Browse Shifts</li>
                <li>• Filter by specialty/location/pay</li>
                <li>• One-click claim with real-time updates</li>
                <li>• Manage availability and preferences</li>
                <li>• Track earnings and generate tax reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Coordinator Journey</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Login → Dashboard → Create Shifts</li>
                <li>• Set requirements and premium pay</li>
                <li>• Monitor fill rates and applications</li>
                <li>• Send direct invitations to nurses</li>
                <li>• Analyze performance metrics</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}