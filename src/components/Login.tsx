import { FC, useState } from "react";
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';
// import '../scss/Modal.scss';
import profile from "../stores/profile";
import Modal from "./utility/Modal";

import $ from "cash-dom";
const Login: FC = () => {
    // This is a login modal that's centered on the screen with a backdrop preventing interaction with the rest of the page.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resettingPassword, setResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const login = async () => {
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

            // TODO noop?
            // profile.setAvatar(this.avatarField);
        }
    }
    const resetPassword = async () =>
        await profile.sendPassReset(resetEmail) && setResettingPassword(false);

    return (
        <>
            <Dialog open={true} onClose={() => { }} className="relative z-50">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                
                {/* Add this div to properly center the dialog content */}
                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 rounded-2xl">
                    <DialogPanel className="w-full max-w-sm sm:max-w-md rounded bg-black p-4 sm:p-6 shadow-xl">
                        <DialogTitle>
                            <span className="text-lg sm:text-xl font-bold">Login</span>
                        </DialogTitle>
                        
                        <form className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[rgb(119, 180, 32)]">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="emailInput" 
                                    value={email}
                                    className="p-2 mt-1 block w-full rounded-md border-gray-300 bg-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm"
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
                                    className="p-2 mt-1 block w-full rounded-md border-gray-300 bg-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm"
                                    onChange={e => setPassword(e.target.value)}
                                    value={password} 
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 pt-3">
                                <button 
                                    type="button"
                                    className="btn btn-primary w-full p-2"
                                    id="loginbutton"
                                    onClick={login}>Login</button>
                                <button 
                                    type="button"
                                    className="btn btn-primary w-full p-2"
                                    id="regbutton"
                                    onClick={() => profile.register(email, password)}>Register</button>
                            </div>
                            
                            <div className="text-center">
                                <button 
                                    type="button"
                                    className="btn btn-secondary text-sm p-2"
                                    id="reset-password-btn"
                                    onClick={() => setResettingPassword(true)}>Reset Password</button>
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
                    className="form-control w-full mt-2 text-base sm:text-sm p-2 border rounded"
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