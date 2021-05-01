import React from "react";
// import Button from "react-bootstrap/Button";
// import Modal from "react-bootstrap/Modal";

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
    var leftButton;
    if (this.props.leftButton && this.props.leftButtonText) {
      leftButton = (
        <button onClick={this.props.leftButton} variant="primary">
          {this.props.leftButtonText}
        </button>
      );
    }

    var size = this.props.size || "";
    var keyboard = this.props.keyboard || true;
    var backdrop = this.props.backdrop || true;
    return (
      <>
        {/* <BaseModal
          show={this.props.show}
          onHide={this.handleClose}
          size={size}
          keyboard={keyboard}
          backdrop={backdrop}
        >
          <BaseModal.Header closeButton>
            <BaseModal.Title>{this.props.title}</BaseModal.Title>
          </BaseModal.Header>
          <BaseModal.Body>{this.props.children}</BaseModal.Body>
          <BaseModal.Footer>
            {this.props.noClose ? (
              false
            ) : (
              <button type="button" className="btn btn-primary" onClick={this.handleClose}>
                {this.props.closeText || "Close"}
              </button>
            )}
            {leftButton}
          </BaseModal.Footer>
        </BaseModal> */}
      </>
    );
  }
}

export default UtilityModal;
