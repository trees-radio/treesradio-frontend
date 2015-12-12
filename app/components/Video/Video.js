

import React from 'react';
import ReactPlayer from 'react-player';

// import './Video.scss';

var Video = React.createClass({
  shouldBePlaying: function(){
    return true;
  },
  render: function() {
    return(
      <div>
        <ReactPlayer
          className="reactplayer"
          width="1280px"
          height="720px"
          id="reactplayerid"
          url='https://www.youtube.com/watch?v=3CkUmuNuA1g'
          playing={this.shouldBePlaying()}
          />
      </div>
    )
  }

});

module.exports = Video;

// fgF7O_-vQzc - 10HR youtube buffer video


// "L41cCGnnjiw", //YTcracker - The Link
// "nDopn_p2wk4", //Syn Cole - Miami 82 (Kygo Remix)
// "kWrjYdD0Tg0", //Jonathan Coulton - Code Monkey
// "9RHFFeQ2tu4", //Fever The Ghost - SOURCE
// "NhheiPTdZCw", //Blockhead - The Music Scene
// "6qmVNB4nalk", //Bonobo - 'Eyesdown' (Machinedrum Remix)
// "0ScYz9sNaQk", //Flying Lotus - Zodiac Shit
// "wycjnCCgUes", //Tame Impala - Feels Like We Only Go Backwards
// "Oy9RB_jI0Ts", //Cosmic Flower Unfolding HD
// "TuJqUvBj4rE", //DDWIWDD (Dan Deacon “When I Was Done Dying”)
// "sifVwz5Nguc", //Adweedure time with Snoop & Dogg
// "5Z8oYH_bhnA", //Starfucker - Rawnald Gregory Erickson the Second
// "A2zKARkpDW4", //Boards of Canada - Dayvan Cowboy
// "SPlQpGeTbIE", //Junior Senior - Move Your Feet
// "WW8VmSfYLAU", //Ratatat "Cherry"
// "8a3-1TgyB6k", //Deca - "Breadcrumbs"
// "xlcywgEMuGI", //RATATAT - CREAM ON CHROME
// "_X8nMMJimgk", //Psychedelic Dumbo [Slytrance - Chuggernaut]
// "QQPhwQK4H1U", //MONO - Where We Begin
// "miUfEhInvtI", //Ott - Adrift In Hilbert Space
// "37sKI7d7-xA", //darwin deez - constellations
// "egNKlUHZqOY", //The Legendary Hero - EDM [ dj-Jo Remix ]
// "zlbobfNF0S0", //I Wanna Know Now - Bob Marley & MGMT (Is this Love+Kids) Remix
// "yhOKhJaM1QE", //Just Dropped In - Kenny Rogers & The First Edition
// "aame895RBG0", //"Always Alright" by Alabama Shakes
// "ggLh9P9x24Q", //Vessels - The Sky Was Pink
// "Gs069dndIYk", //Earth, Wind & Fire - September
// "WF34N4gJAKE", //Bonobo : Cirrus
// "c3GN9CqxKAY", //Bon Iver - Perth (Deluxe)
// "HBfgQvM7wtE", //of Montreal - Gronlandic Edit
// "bBtR3XwN_z4", //Epic Sax Guy (Cruzo Remix)
// "Mg_oDxDoDMY", //Balam Acab - Oh Why
// "F5KsbQcSf1g", //Bloodhound Gang - The Bad Touch 2015 (Simon Jay & Impulz Remix)
// "xXjjoy7bJuE", //Particle Audio React: Tipper - The Re-Up
// "uOUjnJrw1yQ", //Shpongle - Tickling the Amygdala
// "whScLb0aAiM", //Kognitif - Twenty Past Four
// "H9tTMwof1zY", //RIVKA - Swim High
// "LgJwzV_qYCE", //Tenru - The Way She Moves
// "XdqgSaidWZo", //Bastille & Audien vs. Porter Robinson - Pompeii vs. Language (Northmark Bootleg)
// "fU7hZ3smj0g", //Mike Love - Permanent Holiday
// "Fjs4hVSGdJc", //The Floozies - Body Slam
// "wFiweI7_6Do", //65Daysofstatic - Debutante
// "4y5ovWd6neQ", //Vini Vici - The Tribe
// "qssa6ec7faQ", //psyche rock
// "TLs3xaUInB8", //Bryce Vine - Sour Patch Kids
// "5hBWRuMfiL4", //Pink Floyd - Anisina
// "sJe3K2nW7Vc", //Shpongle - Dorset Perception
// "Bparw9Jo3dk", //Modestep - Sunlight
// "3CkUmuNuA1g", //KOAN Sound - 7th Dimension
// "R8RnMK06EmM", //Jenova 7 and Mr. Moods - Smooth Jazz Backup
// "6XDwlQZKaK0", //Goldfish - Three Second Memory
// "21UmYMJPX9g", //Boogie Vice - Bel Air
// "xbpbA8l9nr4", //Cypress Hill - Hits From The Bong
// "DhFy4qZ0ah8", //ELO - Mr. Blue Sky
// "lS5TIcLJXTw", //Cypress Hill - Illusions
// "U1ei5rwO7ZI", //Snoop Dogg (SWED) Dubstep Remix
// "7AoJwMImQZE", //We Are All Astronauts - Doves
// "gdS352ujN7I", //Astronaut - Champions (Laszlo Remix)
// "Z-3z3DNUGiE", //Etienne de Crecy - No Brain
