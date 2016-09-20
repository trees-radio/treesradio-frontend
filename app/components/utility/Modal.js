/*
  A wrapper around react-modal-bootstrap for ease of use
  Usage:
    import Modal from '...';
    React.createClass({
      render() {
        return (
          <Modal isOpen={this.someState} hideModal={this.someFunction} title="My Title">
           <p>Content goes inside it.</p>
          </Modal>
        );
      }
    });
  See propTypes for additional possible props
*/


import React, { PropTypes } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalFooter
} from 'react-modal-bootstrap';

const UtilityModal = React.createClass({
  propTypes: {
    size: PropTypes.string,
    keyboard: PropTypes.bool,
    backdrop: PropTypes.bool,
    title: PropTypes.node.isRequired, // title at top of modal
    children: PropTypes.node,
    isOpen: PropTypes.bool.isRequired, // boolean to tell Modal whether to be open or not
    hideModal: PropTypes.func.isRequired, // function to hide the modal (for close button)
    leftButton: PropTypes.func, // function for bottom left button (will not display button if missing)
    leftButtonText: PropTypes.string, // text for bottom left button (will not display button if missing)
    closeText: PropTypes.string // alternate close button text
  },
  render() {
    var leftButton;
    if (this.props.leftButton && this.props.leftButtonText) {
      leftButton = (
        <button onClick={this.props.leftButton} className='btn btn-primary pull-left'>
          {this.props.leftButtonText}
        </button>
      );
    }

    var size = this.props.size || '';
    var keyboard = this.props.keyboard || true;
    var backdrop = this.props.backdrop || true;

    return (
      <Modal isOpen={this.props.isOpen} size={size} keyboard={keyboard} backdrop={backdrop} onRequestHide={this.props.hideModal}>
        <ModalHeader>
          <ModalClose onClick={this.props.hideModal}/>
          <ModalTitle>{this.props.title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {this.props.children}
        </ModalBody>
        <ModalFooter>
          {
            this.props.noClose ? false :
            <button className='btn btn-default pull-right' onClick={this.props.hideModal}>
              {this.props.closeText || 'Close'}
            </button>
          }
          {leftButton}
        </ModalFooter>
      </Modal>
    );
  }
});

export default UtilityModal;
