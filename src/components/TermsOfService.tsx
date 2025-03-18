import { FC, useState } from "react";
import { CURRENT_TOS_VERSION, setTosAccepted } from "../libs/tos";
import toast from "../utils/toast";

const TermsOfServicePage: FC = () => {
  const [_accepted, setAccepted] = useState(false);
  
  // Handle TOS acceptance
  const handleAccept = () => {
    setTosAccepted(true);
    setAccepted(true);
    toast("Terms of Service accepted!", { type: "success" });
    
    // If we came from another page, redirect back
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname)) {
      window.history.back();
    } else {
      // Otherwise go to the main page
      window.location.href = '/';
    }
  };
  
  // Handle go back
  const handleGoBack = () => {
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname)) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black sm:p-6">
      <div className="w-full max-w-2xl rounded bg-black p-6 shadow-xl border border-[rgb(119, 180, 32)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[rgb(119, 180, 32)]">Terms of Service</h1>
          <span className="text-sm text-gray-400">v{CURRENT_TOS_VERSION}</span>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="p-4 overflow-y-auto text-sm bg-gray-900 rounded max-h-[60vh]">
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
            <p className="mb-2 font-medium text-[rgb(119, 180, 32)]">If you take issue with these values, or stand behind people like Trump, Putin, etc., you are not welcome here.</p>
            
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
          
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button"
              className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
              onClick={handleGoBack}>
              Go Back
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-[rgb(119,180,32)] text-white rounded hover:bg-[rgb(140,200,50)]"
              onClick={handleAccept}>
              Accept Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;