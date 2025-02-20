import React from "react";
import { Dialog } from '@headlessui/react';
import './Modal.scss';

class UtilityModal extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = { show: false };
  }
  
  handleClose() {
    this.props.hideModal();
  }
  
  handleShow() {
    this.setState({ show: true });
  }
  
  render() {
    let leftButton;
    if (this.props.leftButton && this.props.leftButtonText) {
      leftButton = (
        <button onClick={this.props.leftButton} className="btn btn-primary">
          {this.props.leftButtonText}
        </button>
      );
    }

    // Size classes mapping
    const sizeClasses = {
      sm: 'w-20',
      lg: 'w-40',
      xl: 'w-60',
      '': 'w-30' // default
    };
    
    const sizeClass = sizeClasses[this.props.size || ''];
    
    // Note: Headless UI's Dialog doesn't have direct equivalents for keyboard and backdrop props
    // For backdrop, we can control it with styling and render conditions
    const showBackdrop = this.props.backdrop !== false;

    return (
      <Dialog 
        open={Boolean(this.props.show)} 
        onClose={this.props.keyboard !== false ? this.handleClose : () => {}}
        className="relative z-50"
      >
        {/* Backdrop overlay */}
        {showBackdrop && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        )}
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className={`w-[50vw] rounded bg-black shadow-xl overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <Dialog.Title className="text-lg font-medium leading-6 ">
                {this.props.title}
              </Dialog.Title>
              {!this.props.noClose && (
                <button 
                  type="button" 
                  onClick={this.handleClose} 
                  className="rounded-md bg-[rgb(119, 180, 32)] text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-4 overflow-scroll max-h-[70vh]">
              {this.props.children}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t p-4">
              {leftButton}
              {!this.props.noClose && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={this.handleClose}
                >
                  {this.props.closeText || "Close"}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }
}

export default UtilityModal;