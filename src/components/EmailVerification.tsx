import { FC, useState, useEffect } from "react";
import { auth } from "../libs/fbase";
import { applyActionCode } from "firebase/auth";
import toast from "../utils/toast";

const EmailVerification: FC = () => {
    const [loading, setLoading] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Get the action code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const actionCode = urlParams.get('oobCode');
        
        if (mode === 'verifyEmail' && actionCode) {
            handleEmailVerification(actionCode);
        } else {
            // If no valid verification code, redirect to home
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }, []);
    
    const handleEmailVerification = async (actionCode: string) => {
        setLoading(true);
        
        try {
            // Apply the email verification action code
            await applyActionCode(auth, actionCode);
            
            toast("Email verified successfully! You can now access all features.", { type: "success" });
            setVerificationComplete(true);
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            console.error("Error verifying email:", error);
            
            let errorMessage = "Failed to verify email. ";
            switch (error.code) {
                case 'auth/expired-action-code':
                    errorMessage += "This verification link has expired. Please request a new one.";
                    break;
                case 'auth/invalid-action-code':
                    errorMessage += "This verification link is invalid. Please request a new one.";
                    break;
                case 'auth/user-disabled':
                    errorMessage += "This account has been disabled.";
                    break;
                default:
                    errorMessage += "Please try again or request a new verification email.";
            }
            
            setError(errorMessage);
            toast(errorMessage, { type: "error" });
            
            // Redirect to home after 5 seconds on error
            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        } finally {
            setLoading(false);
        }
    };
    
    if (verificationComplete) {
        return (
            <div className="main-load">
                <div className="container main-loadingcard">
                    <div className="main-vcenter">
                        <div className="main-center">
                            <center className="loading-txt">
                                <i className="fa fa-check-circle fa-2x" style={{ color: 'green', marginBottom: '20px' }} />
                                <br />
                                Email verified successfully!
                                <br />
                                <small>Redirecting to TreesRadio...</small>
                            </center>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="main-load">
                <div className="container main-loadingcard">
                    <div className="main-vcenter">
                        <div className="main-center">
                            <center className="loading-txt">
                                <i className="fa fa-exclamation-triangle fa-2x" style={{ color: 'red', marginBottom: '20px' }} />
                                <br />
                                {error}
                                <br />
                                <small>Redirecting to TreesRadio...</small>
                            </center>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="main-load">
            <div className="container main-loadingcard">
                <div className="main-vcenter">
                    <div className="main-center">
                        <center className="loading-txt">
                            {loading ? (
                                <>
                                    <i className="fa fa-spin fa-2x fa-circle-o-notch" />
                                    <br />
                                    Verifying your email...
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-envelope fa-2x" />
                                    <br />
                                    Processing email verification...
                                </>
                            )}
                        </center>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
