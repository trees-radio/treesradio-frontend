//MAIN JS

var React = require('react');

var Main = React.createClass({
  render: function(){
    return (
      <div>Hello Trees</div>
    )
  }
});

React.render(<Main />, document.getElementById('app'));
