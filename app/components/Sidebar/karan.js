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
            <Modal isOpen={this.state.modalIsOpen} hideModal={() => this.toggleModal} title="In Memorium">
                <div className="row">
                    <div className="col-md-2">
                        <img src="//i.imgur.com/NgqxUDF.jpg" width="100%"/>
                    </div>
                    <div className="col-md-10">
                        <h4>In July of 2017, TreesRadio lost a moderator and a great contributor to our community.</h4>
                        <p>Saeft, or Karan as some of us came to know him, was a wonderful human being and a great friend to many of
                            us here at TR. His presence was one of love, respect, and a lightheartedness that was unmatched. His love
                            of music and hanging out with the ents was something that we're going to miss dearly.</p>
                        <p>While the details of Saeft's passing are not clear, if you, or someone you know
                            is suffering from depression and has turned to the abuse of substances as the alternative, 
                            please seek help immediately. We're firm believers that responsible Marijuana use has great benefits, 
                            but sometimes the desire to get higher needs to be kept in check.</p>
                        <ul>
                          <li>
                              <a href="https://www.reddit.com/r/SubstanceAbuseHelp/" target="_blank">Substance Abuse Help Sub-Reddit</a>
                           </li>
                           <li>
                               <a href="https://www.reddit.com/r/SuicideWatch" target="_blank">Suicide Watch Sub-Reddit</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        );
    }
}