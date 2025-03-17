import { FC, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';
import { hasTosBeenAccepted, setTosAccepted, CURRENT_TOS_VERSION, getAcceptedTosVersion, hasAcceptedAnyTosVersion } from "../libs/tos";

interface TOSAgreementProps {
  onAccept: () => void;
}

const TOSAgreement: FC<TOSAgreementProps> = ({ onAccept }) => {
  // Use state to control dialog visibility
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [previousVersion, setPreviousVersion] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user has already accepted the current TOS version
    const acceptedCurrentVersion = hasTosBeenAccepted();
    const acceptedVersion = getAcceptedTosVersion();
    const hasAcceptedPreviously = hasAcceptedAnyTosVersion();
    
    console.log("TOS check - accepted current version:", acceptedCurrentVersion);
    console.log("TOS check - previously accepted version:", acceptedVersion);
    
    if (acceptedCurrentVersion) {
      console.log("Current TOS version already accepted, hiding dialog");
      setShowDialog(false);
      onAccept();
    } else {
      // Current version not accepted, show the dialog
      setShowDialog(true);
      
      if (hasAcceptedPreviously) {
        // User has accepted a previous version, show dialog with update message
        setPreviousVersion(acceptedVersion);
      }
    }
  }, [onAccept]);

  const handleAccept = () => {
    console.log(`User accepted TOS version ${CURRENT_TOS_VERSION}`);
    // Store acceptance in local storage with current version
    setTosAccepted(true);
    // Update local state
    setShowDialog(false);
    // Notify parent component
    onAccept();
  };

  return (
    <Dialog 
      open={showDialog} 
      onClose={() => {}} 
      className="relative z-[9999]"
      aria-labelledby="dialog-title" 
      aria-describedby="dialog-description"
      id="terms-of-service"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-md rounded bg-black p-6 shadow-xl border border-[rgb(119, 180, 32)]">
          <DialogTitle id="dialog-title">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[rgb(119, 180, 32)]">Terms of Service</span>
              <span className="text-sm text-gray-400">v{CURRENT_TOS_VERSION}</span>
            </div>
          </DialogTitle>
          
          {previousVersion && (
            <div className="p-2 mt-2 text-sm text-yellow-300 rounded bg-yellow-900/30">
              <p>Our Terms of Service have been updated since your last visit (v{previousVersion}). Please review and accept the new terms to continue.</p>
            </div>
          )}
          
          <div className="mt-4 space-y-4" id="dialog-description">
            <div className="p-2 overflow-y-auto text-sm bg-gray-900 rounded max-h-60">
              <p className="mb-2">Welcome to Trees Radio! By using our service, you agree to the following terms:</p>
              
              <h3 className="mt-4 mb-1 font-bold">1. Acceptance of Terms</h3>
              <p>By accessing or using Trees Radio, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
              
              <h3 className="mt-4 mb-1 font-bold">2. Community Values</h3>
              <p className="mb-2">The Trees Radio community believes in and supports:</p>
              <ul className="mb-2 ml-5 list-disc">
                <li>Trans rights</li>
                <li>LGBTQIA+ rights</li>
                <li>Land back</li>
                <li>Free Palestine</li>
                <li>Black Lives Matter</li>
                <li>1312</li>
                <li>Reproductive rights</li>
                <li>Women's rights</li>
                <li>Disability rights</li>
                <li>Freedom of expression and human rights</li>
              </ul>
              
              <h3 className="mt-4 mb-1 font-bold">3. User Content</h3>
              <p>You are solely responsible for the content you share, submit, or display on or through Trees Radio. You agree not to share content that violates any laws or infringes on others' rights.</p>
              
              <h3 className="mt-4 mb-1 font-bold">4. Prohibited Activities</h3>
              <p>Users must not engage in any activities that could harm the Trees Radio service or community, including but not limited to spamming, harassing others, or attempting to gain unauthorized access to the system.</p>
              
              <h3 className="mt-4 mb-1 font-bold">5. Content Guidelines</h3>
              <p>All content shared must comply with our community guidelines and relevant laws. Content that promotes hate speech, discrimination, violence, or illegal activities is prohibited.</p>
              
              <h3 className="mt-4 mb-1 font-bold">6. Privacy</h3>
              <p>Your use of Trees Radio is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.</p>
              
              <h3 className="mt-4 mb-1 font-bold">7. Changes to Terms</h3>
              <p>We reserve the right to modify these Terms of Service at any time. Your continued use of Trees Radio after any changes indicates your acceptance of the new terms.</p>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="button"
                className="w-full p-2 btn btn-primary"
                onClick={handleAccept}>
                {previousVersion ? 'I Accept the Updated Terms' : 'I Accept'}
              </button>
              
              <a 
                href="https://www.example.com/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center text-sm text-[rgb(119, 180, 32)] underline">
                View Full Terms & Privacy Policy
              </a>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TOSAgreement;