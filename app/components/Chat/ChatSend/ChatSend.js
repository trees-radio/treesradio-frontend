/**
 * Created by zachb on 2015-12-05.
 */

var React = require('react');

var ChatSend = React.createClass({
    render: function(){
        return (
            <div id="sendbox">
                <input type="text" placeholder="enter to send" id="chatinput" className="form-control" onKeyDown={this.props.send}> </input>
                {/* <button id="sendchat" type="submit" class="btn">Send</button> */}
            </div>
        )

    }

});

module.exports = ChatSend;