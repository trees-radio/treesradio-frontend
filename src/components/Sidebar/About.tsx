import React from "react";
import Karan from "./karan";
import { clearTosAcceptance } from "../../libs/tos";

interface AboutProps {
  show: boolean;
}

export default class About extends React.Component {
  props: AboutProps;
  state: { showKaran: boolean };
  constructor(props: AboutProps) {
    super(props);
    this.props = props;

    this.state = {
      showKaran: false
    };

    this.showKaranObit = this.showKaranObit.bind(this);
    this.resetTosAndRedirect = this.resetTosAndRedirect.bind(this);
  }

  showKaranObit() {
    this.setState({
      showKaran: !this.state.showKaran
    });
  }

  resetTosAndRedirect() {
    // Clear the TOS acceptance so the dialog will show again
    clearTosAcceptance();
    
    // Check if we're accessing via the /terms-of-service route
    if (window.location.pathname === '/terms-of-service') {
      // If so, just reload the page
      window.location.reload();
    } else {
      // Otherwise redirect to the terms page
      window.location.href = '/terms-of-service';
    }
  }

  render() {
    return (
      <div className="px-4 pb-20 sidebar-about" style={this.props.show ? {} : { display: "none" }}>
        <div className="my-3 about-summary font-bold text-[#77B420]">
          <p className="text-xl">TreesRadio is an online social music site.</p>
        </div>
        
        <div className="mb-4 about-rules">
          <div className="mb-2">Rules:</div>
          <ol className="space-y-1 list-decimal outside ml-7">
            <li>Max Video length is 8 minutes without a mod exemption.</li>
            <li>Like/Dislike Skip Ratio = 1:1.5 (Must have atleast 5 dislikes)</li>
            <li>Do not try to buy/sell/give/trade drugs on TreesRadio.</li>
            <li>Please be nice to each other, unnecessary rudeness/attacks may result in a ban.</li>
            <li>TreesRadio is 18+ only, minors will be banned.</li>
            <li>Do not queue NSFW videos</li>
            <li>Be mindful of controversial media/chat (group targeted hate/religion/politics/sex)</li>
            <li>Songs that have been recently played (2 hours) may be skipped.</li>
            <li>Staff reserve the right to skip any video.</li>
          </ol>
        </div>
        
        <div className="mb-4 text-[#77B420]">Legal Information</div>
        
        <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2">
          <div className="bg-[#131836] rounded p-3">
            <div className="mb-2">Terms of Service</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a
                  href="#"
                  onClick={this.resetTosAndRedirect}
                  className="text-[#77B420] hover:underline"
                >
                  TreesRadio Terms of Service
                </a>
              </li>
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a
                  href="https://www.youtube.com/static?template=terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  YouTube Terms of Service
                </a>
              </li>
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a
                  href="https://vimeo.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  Vimeo Terms of Service
                </a>
              </li>
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a
                  href="https://policies.google.com/privacy?hl=en-US"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#131836] rounded p-3">
            <div className="mb-2">Community Links</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a 
                  href="https://discord.gg/tMmDQtn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  Join the Discord-Entmoot
                </a>
              </li>
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a 
                  href="https://youtu.be/84qIWSRRZM8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  Video Tutorial / Walkthrough
                </a>
              </li>
              <li className="flex items-center">
                <span className="inline-block mr-2">→</span>
                <a 
                  href="https://reddit.com/r/treesradio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#77B420] hover:underline"
                >
                  /r/treesradio Subreddit
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="float-right align-middle">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              this.setState({ showKaran: !this.state.showKaran });
            }}
          >
            <img className="avatarimg" src="//i.imgur.com/NgqxUDF.jpg" alt="In Memory of Saeft" />
          </button>
          <div className="mt-1 text-xs text-gray-400">In Memoriam</div>
        </div>
        
        <Karan isVisible={this.state.showKaran} hideCallback={this.showKaranObit} />
      </div>
    );
  }
}