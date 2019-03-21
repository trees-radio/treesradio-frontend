import React from 'react';
import { Modal,Button } from 'react-bootstrap';

class UtilityModal extends React.Component {
	componentWillUnmount(){
		this.setState = (state,callback)=>{
			return;
		};
	}
	constructor(props, context) {
		super(props, context);
		this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.state = { show: false };
	}
	handleClose(){
		this.props.hideModal();
	}
	handleShow(){
		this.setState({show: true});
	}
  	render() {
    		var leftButton;
    		if (this.props.leftButton && this.props.leftButtonText) {
      			leftButton = (
        			<Button onClick={this.props.leftButton} variant="primary">
          				{this.props.leftButtonText}
        			</Button>
      			);
    		}

    		var size = this.props.size || '';
    		var keyboard = this.props.keyboard || true;
    		var backdrop = this.props.backdrop || true;
    		return (
			<>
      			<Modal show={this.props.show} onHide={this.handleClose} size={size} keyboard={keyboard} backdrop={backdrop}> 
        			<Modal.Header closeButton>
          				<Modal.Title>{this.props.title}</Modal.Title>
        			</Modal.Header>
        			<Modal.Body>
          				{this.props.children}
        			</Modal.Body>
        			<Modal.Footer>
          				{ this.props.noClose ? false :
	    					<button type="button" className="btn btn-primary" onClick={this.handleClose}>{this.props.closeText || 'Close'}</button>
          				}
          				{leftButton}
        			</Modal.Footer>
      			</Modal>
			</>
    		);
  	}
};

export default UtilityModal;
