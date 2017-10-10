import React from "react";
import Modal from "../../components/utility/Modal";
import {observer} from "mobx-react";
import {observable, computed} from "mobx";

@observer
export default class Karan extends React.Component {
    
    componentWillMount() {
        this.state = {
            modalIsOpen: true
        };
    }
    @computed
    get toggleModal() {
        this.setState(
            {
                modalIsOpen: !this.state.modalIsOpen
            }
        );
    }
    render() {
        return (
            <Modal isOpen={this.state.modalIsOpen} hideModal={() => this.toggleModal} title="In Memoriam">
                <div className="row">
                    <div className="col-md-3">
                        <img src="//i.imgur.com/NgqxUDF.jpg" width="100%"/>
                    </div>
                    <div className="col-md-9">
                        <h4>In July of 2017, TreesRadio lost a moderator and a great contributor to our community.</h4>
                        <p>Saeft, or Karan as some of us came to know him, was a wonderful human being and a great friend to many of
                            us here at TR. His presence was one of love, respect, and a lightheartedness that was unmatched. His love
                            of music and the laughs he shared with us is something that we're all going to miss dearly.</p>
                        {/* <p>If you or someone you know is suffering from depression or suicidal thoughts, please seek help immediately. 
                            Self medication has its limits. All problems can be managed, and nobody has to suffer alone.</p>
                        <ul>
                          <li>
                              <a href="https://www.reddit.com/r/SubstanceAbuseHelp/" target="_blank">Substance Abuse Help Sub-Reddit</a>
                           </li>
                           <li>
                               <a href="https://www.reddit.com/r/SuicideWatch" target="_blank">Suicide Watch Sub-Reddit</a>
                            </li>
                        </ul> */}
                    </div>
                </div>
            </Modal>
        );
    }
}