//MAIN JS

var React = require('react');
import './Main.scss';
import Nav from './components/Nav/Nav.js';

var Main = React.createClass({
  render: function(){
    return (
      <Nav />
    )
  }
});

React.render(<Main />, document.getElementById('app'));
