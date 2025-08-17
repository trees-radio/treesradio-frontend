import { FC, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';
import { auth } from "../libs/fbase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import toast from "../utils/toast";

const PasswordReset: FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [oobCode, setOobCode] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [validCode, setValidCode] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);
    
    useEffect(() => {
        // Get the action code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const actionCode = urlParams.get('oobCode');
        
        if (mode === 'resetPassword' && actionCode) {
            setOobCode(actionCode);
            
            // Verify the password reset code
            verifyPasswordResetCode(auth, actionCode)
                .then((email) => {
                    setEmail(email);
                    setValidCode(true);
                })
                .catch((error) => {
                    console.error("Invalid or expired reset code:", error);
                    toast("This password reset link is invalid or has expired. Please request a new one.", { type: "error" });
                    setValidCode(false);
                    
                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                });
        }
    }, []);
    
    const handlePasswordReset = async () => {
        if (!oobCode) {
            toast("No reset code found. Please use the link from your email.", { type: "error" });
            return;
        }
        
        if (password !== confirmPassword) {
            toast("Passwords do not match!", { type: "error" });
            return;
        }
        
        if (password.length < 6) {
            toast("Password must be at least 6 characters long!", { type: "error" });
            return;
        }
        
        setLoading(true);
        
        try {
            // Confirm the password reset
            await confirmPasswordReset(auth, oobCode, password);
            toast("Password has been reset successfully! You can now log in with your new password.", { type: "success" });
            setResetComplete(true);
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            console.error("Error resetting password:", error);
            
            let errorMessage = "Failed to reset password. ";
            switch (error.code) {
                case 'auth/expired-action-code':
                    errorMessage += "This reset link has expired. Please request a new one.";
                    break;
                case 'auth/invalid-action-code':
                    errorMessage += "This reset link is invalid. Please request a new one.";
                    break;
                case 'auth/weak-password':
                    errorMessage += "Password is too weak. Please choose a stronger password.";
                    break;
                default:
                    errorMessage += "Please try again or request a new reset link.";
            }
            
            toast(errorMessage, { type: "error" });
        } finally {
            setLoading(false);
        }
    };
    
    // If no valid code, don't show the form
    if (!validCode) {
        return (
            <Dialog open={true} onClose={() => {}} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm p-6 bg-black rounded shadow-xl">
                        <DialogTitle className="text-lg font-bold">Password Reset</DialogTitle>
                        <p className="mt-4 text-sm">Verifying reset link...</p>
                    </DialogPanel>
                </div>
            </Dialog>
        );
    }
    
    // If reset is complete, show success message
    if (resetComplete) {
        return (
            <Dialog open={true} onClose={() => {}} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm p-6 bg-black rounded shadow-xl">
                        <DialogTitle className="text-lg font-bold text-green-500">Success!</DialogTitle>
                        <p className="mt-4 text-sm">Your password has been reset. Redirecting to login...</p>
                    </DialogPanel>
                </div>
            </Dialog>
        );
    }
    
    return (
        <Dialog open={true} onClose={() => {}} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
                <DialogPanel className="w-full max-w-sm p-4 bg-black rounded shadow-xl sm:max-w-md sm:p-6">
                    <DialogTitle>
                        <span className="text-lg font-bold sm:text-xl">Reset Password</span>
                    </DialogTitle>
                    
                    <p className="mt-2 text-sm text-gray-400">
                        Reset password for: <strong>{email}</strong>
                    </p>
                    
                    <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[rgb(119, 180, 32)]">
                                New Password
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password"
                                value={password}
                                className="block w-full p-2 mt-1 text-base bg-gray-200 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(119, 180, 32)]">
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                id="confirmPassword"
                                value={confirmPassword}
                                className="block w-full p-2 mt-1 text-base bg-gray-200 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-3">
                            <button 
                                type="submit"
                                className="w-full p-2 btn btn-primary"
                                disabled={loading || !password || !confirmPassword}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                            
                            <button 
                                type="button"
                                className="w-full p-2 text-sm btn btn-secondary"
                                onClick={() => window.location.href = '/'}
                                disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default PasswordReset;