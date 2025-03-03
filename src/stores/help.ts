import {autorun, observable, action} from "mobx";
import {getDatabaseRef} from "../libs/fbase";

export interface HelpCommand {
  [key: string]: {
    helpstring: string;
  };
}

export default new (class HelpList {
  constructor() {
    autorun(() => {
      getDatabaseRef("help")
        .once("value", snap => {
          this.setHelpCommands(snap.val());
        });
    });
  }
  @observable accessor   helpCommands: HelpCommand = {};

  @action
  setHelpCommands(commands: any) {
    this.helpCommands = commands;
  }

})();

/*
{
    "adminsay": {
        "helpstring": "/adminsay [message]  --  Whisper to other mods in the channel"
    },
    "approve": {
        "helpstring": "/approve  --  Approves the current song for play VIP+"
    },
    "ask": {
        "helpstring": "/ask [sentence]   --  Ask BlazeBot a question"
    },
    "ban": {
        "helpstring": "/ban [username] [days]  --  Ban a user for X days"
    },
    "bang": {
        "helpstring": "/bang  --  Shoot a duck during a hunt"
    },
    "banhammer": {
        "helpstring": "/ban [username] [days]  --  Ban a user for X days"
    },
    "bansong": {
        "helpstring": "/bansong  --  Bans the current playing song."
    },
    "canceltoke": {
        "helpstring": "/canceltoke  --  Cancels a toke"
    },
    "cannabis": {
        "helpstring": "/toke [minutes] [times]  --  Start a toke for X minutes, repeated X times. (Session)"
    },
    "clear": {
        "helpstring": "/clear --  Clears the chat logs"
    },
    "dalle": {
        "helpstring": "/dalle [sentence]   --  Ask BlazeBot to draw you a picture"
    },
    "demote": {
        "helpstring": "/demote [username] --  Decrease a user rank"
    },
    "duckhunt": {
        "helpstring": "/duckhunt  --  Starts a new Duck Hunt"
    },
    "flair": {
        "helpstring": "/flair [username] [Flair String]  --  Sets a user's flair."
    },
    "forcejoin": {
        "helpstring": "/forcejoin [username]  --  adds this user to the waitlist"
    },
    "forcerefresh": {
        "helpstring": "/forcerefresh  --  Forces all users to reload their page."
    },
    "friend": {
        "helpstring": "/friend  --  Friend a duck during a hunt"
    },
    "gelato": {
        "helpstring": "/leaderboard  --  Shows the leaderboard"
    },
    "getip": {
        "helpstring": "/getips [username]  --  Gets the known ip addresses for a user"
    },
    "gif": {
        "helpstring": "/gif [keywords]   --  Fetch a gif"
    },
    "hype": {
        "helpstring": "/hype  --  Give a boost to the song that has you groovin"
    },
    "join": {
        "helpstring": "/join [times]  --  Join the session in progress X times."
    },
    "joint": {
        "helpstring": "/toke [minutes] [times]  --  Start a toke for X minutes, repeated X times. (Session)"
    },
    "leaderboard": {
        "helpstring": "/leaderboard  --  Shows the leaderboard"
    },
    "lock": {
        "helpstring": "/lock  --  Locks the chat for new users."
    },
    "me": {
        "helpstring": "/me [message]  --  Emote to the channel (italics)"
    },
    "motd": {
        "helpstring": "/motd [message]  --  Sets the Message of the Day"
    },
    "mute": {
        "helpstring": "/mute [username] [days]  --  Mute a user for X days"
    },
    "patreon": {
        "helpstring": "/patreon [username] [Greeting]--  Sets the user's patreon flag"
    },
    "patreons": {
        "helpstring": "/patreons -- Gets a list of current patreons"
    },
    "promote": {
        "helpstring": "/promote [username]  --  Increase a user rank"
    },
    "remove": {
        "helpstring": "/remove [username]  --  Remove user from waitlist."
    },
    "resethype": {
        "helpstring": "/resethype [username]  --  Resets the hype timer for this user"
    },
    "roll": {
        "helpstring": "/roll [sides] [times]  --  Rolls a X sided dice X times"
    },
    "save": {
        "helpstring": "/friend  --  Friend a duck during a hunt"
    },
    "say": {
        "helpstring": "/say [string]  --  Force the bot to say something (Admin/Dev Only)"
    },
    "scores": {
        "helpstring": "/leaderboard  --  Shows the leaderboard"
    },
    "skip": {
        "helpstring": "/skip  --  Skips the current song"
    },
    "skipto": {
        "helpstring": "/skipto [MM:SS] -- Skips to a new position in the song."
    },
    "spirittoke": {
        "helpstring": "/spirittoke  --  Offer a toke to a random god"
    },
    "spoopy": {
        "helpstring": "/spoopy [1-6]  --  How spoopy is the song?"
    },
    "stonith": {
        "helpstring": "/stonith - kill blazebot (he's like jesus, he'll be back)"
    },
    "t": {
        "helpstring": "/toke [minutes] [times]  --  Start a toke for X minutes, repeated X times. (Session)"
    },
    "timelimit": {
        "helpstring": "/timelimit [minutes]  --  Set the current time limit for plays"
    },
    "toke": {
        "helpstring": "/toke [minutes] [times]  --  Start a toke for X minutes, repeated X times. (Session)"
    },
    "tokers": {
        "helpstring": "/tokers -- Show who's joined the toke"
    },
    "top": {
        "helpstring": "/top [username]  --  Moves this user to the top of the playlist."
    },
    "unban": {
        "helpstring": "/unban [username]  --  Remove a user ban"
    },
    "unbansong": {
        "helpstring": "/unbansong [url]  --  Removes the URL from the banned songs list."
    },
    "unlock": {
        "helpstring": "/unlock  --  Removes the chat lock"
    },
    "unmute": {
        "helpstring": "/unmute [username]  --  Remove a user mute"
    },
    "unpatreon": {
        "helpstring": "/unpatreon [username] -- Unsets the user's patreon flag"
    },
    "verify": {
        "helpstring": "/verify [email] -- Manually verify a users email."
    }
}
*/