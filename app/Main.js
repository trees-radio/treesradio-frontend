//MAIN JS

var React = require('react');
import './Main.scss';

var Main = React.createClass({
  render: function(){
    return (
      <div>Hello Trees</div>
    )
  }
});

React.render(<Main />, document.getElementById('app'));
