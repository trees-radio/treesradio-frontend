import React from "react";
import Modal from "../utility/Modal";
import { observer } from "mobx-react";

interface KaranProps {
  isVisible: boolean;
  hideCallback: () => void;
}

class Karan extends React.Component {
  props: KaranProps;
  state: { modalIsOpen: boolean; hideCallback: () => void };
  constructor(props: KaranProps) {
    super(props);
    this.props = props;
    this.state = {
      modalIsOpen: props.isVisible,
      hideCallback: props.hideCallback
    };
  }
  render() {
    return (
      <Modal show={this.state.modalIsOpen} title="In Memoriam">
        <div className="row">
          <div className="col-md-3">
            <img src="https://i.imgur.com/f9cyJz3.jpg" width="100%" />
          </div>
          <div className="col-md-9">
            <h4>
              In July of 2017, TreesRadio lost a moderator and a great contributor to our community.
            </h4>
            <p>
              Saeft, or Karan as some of us came to know him, was a wonderful human being and a
              great friend to many of us here at TR. His presence was one of love, respect, and a
              lightheartedness that was unmatched. His love of music and the laughs he shared with
              us is something that we&apos;re all going to miss dearly.
            </p>
          </div>
        </div>
      </Modal>
    );
  }
}

export default observer(Karan);