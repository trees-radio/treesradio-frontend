import { FC, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';
import profile from "../stores/profile";
import Modal from "./utility/Modal";
import { hasTosBeenAccepted } from "../libs/tos";

import $ from "cash-dom";

const Login: FC = () => {
    // This is a login modal that's centered on the screen with a backdrop preventing interaction with the rest of the page.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resettingPassword, setResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [tosAccepted, setTosAccepted] = useState(false);
    
    useEffect(() => {
        // Check if user has already accepted TOS
        const accepted = hasTosBeenAccepted();
        setTosAccepted(accepted);
        
        // Set up a listener to check for TOS acceptance changes
        const checkTosInterval = setInterval(() => {
            const currentAcceptance = hasTosBeenAccepted();
            if (currentAcceptance !== tosAccepted) {
                setTosAccepted(currentAcceptance);
            }
        }, 1000);
        
        return () => {
            clearInterval(checkTosInterval);
        };
    }, [tosAccepted]);
    
    const login = async () => {
        if (!tosAccepted) {
            return; // Prevent login if TOS not accepted
        }
        
        if (await profile.login(email, password)) {
            document.getElementById("chatscroll")?.setAttribute("style", "");

            const navbarGrid = document.getElementById("navbar-grid");

            navbarGrid?.classList.remove('navbar-grid-noLogin');

            if (window.matchMedia("only screen and (orientation: portrait)")) {
                navbarGrid
                    ?.setAttribute("grid-template-columns",
                        window
                            .matchMedia("only screen and (max-width: 1500px")
                            .matches ? "15vw 42vw 14vw 9vw 20vw" : "15vw 46vw 14vw 9vw 16vw");
            }

            const buttons = document.querySelectorAll('.disabledNoLogin');
            buttons.forEach(button => button.classList.remove('greyDisabled'));
        }
    }
    
    const resetPassword = async () =>
        await profile.sendPassReset(resetEmail) && setResettingPassword(false);

    const register = () => {
        if (!tosAccepted) {
            return; // Prevent registration if TOS not accepted
        }
        
        profile.register(email, password);
    };

    // If TOS not accepted, don't render the login form at all
    if (!tosAccepted) {
        return null;
    }

    return (
        <>
            <Dialog open={true} onClose={() => { }} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                {/* Add this div to properly center the dialog content */}
                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 rounded-2xl">
                    <DialogPanel className="w-full max-w-sm p-4 bg-black rounded shadow-xl sm:max-w-md sm:p-6">
                        <DialogTitle>
                            <span className="text-lg font-bold sm:text-xl">Login</span>
                        </DialogTitle>
                        
                        <form className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[rgb(119, 180, 32)]">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="emailInput" 
                                    value={email}
                                    className="block w-full p-2 mt-1 text-base bg-gray-200 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && $("#passInput").trigger("focus")} 
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[rgb(119, 180, 32)]">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="passInput"
                                    className="block w-full p-2 mt-1 text-base bg-gray-200 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    onChange={e => setPassword(e.target.value)}
                                    value={password} 
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-3 sm:flex-row">
                                <button 
                                    type="button"
                                    className="w-full p-2 btn btn-primary"
                                    id="loginbutton"
                                    onClick={login}>
                                    Login
                                </button>
                                <button 
                                    type="button"
                                    className="w-full p-2 btn btn-primary"
                                    id="regbutton"
                                    onClick={register}>
                                    Register
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <button 
                                    type="button"
                                    className="p-2 text-sm btn btn-secondary"
                                    id="reset-password-btn"
                                    onClick={() => setResettingPassword(true)}>
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
            
            <Modal
                title="Password Reset"
                show={resettingPassword}
                hideModal={() => setResettingPassword(false)}
                leftButton={() => resetPassword()}
                leftButtonText="Send!"
            >
                <p className="text-sm sm:text-base">Please enter the email of the account you would like to recover.</p>
                <input
                    className="w-full p-2 mt-2 text-base border rounded form-control sm:text-sm"
                    type="text"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && resetPassword()}
                    placeholder="Email Address"
                />
            </Modal>
        </>
    );
}

export default Login;