// src/store/toke.ts
import { computed, observable, autorun, action, makeObservable } from "mobx";
import { getDatabaseRef } from "../libs/fbase";
import { send } from "../libs/events";
import { TokeState, TokeUser, TokeDisplayData } from "../types/toke";

export default new (class TokeTimer {
  constructor() {
    makeObservable(this); // Required for newer MobX versions
    
    autorun(() => {
      getDatabaseRef("toke").on("value", snap => {
        const tokestatus = snap.val() as TokeState | null;
        if (tokestatus != null) {
          this.updateTokeState(tokestatus);
        }
      });
    });
  }

  @observable accessor underway = false;
  @observable accessor time = 0;
  @observable accessor totalTime = 0;
  @observable accessor initiator = "";
  @observable accessor participants: TokeUser[] = [];
  @observable accessor currentSession = 1;
  @observable accessor totalSessions = 1;
  @observable accessor sessionUid = "";

  @action
  updateTokeState(tokeState: TokeState) {
    this.underway = tokeState.tokeUnderway;
    this.time = tokeState.remainingTime;
    this.totalTime = tokeState.tokeLength;
    this.initiator = tokeState.tokeUser || "";
    this.participants = tokeState.seshtoker || [];
    this.sessionUid = tokeState.uid || "";
    
    // Calculate current session and total sessions based on participants
    if (this.participants.length > 0) {
      const maxTimes = Math.max(...this.participants.map(p => p.times));
      this.totalSessions = maxTimes;
      this.currentSession = maxTimes - (this.participants[0]?.times || 0) + 1;
    }
  }

  @computed get tokeUnderway() {
    return this.underway;
  }

  @computed get remainingTime() {
    return this.time;
  }

  @computed get formattedTimeRemaining() {
    const totalSeconds = Math.floor(this.time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  @computed get percentRemaining() {
    if (this.totalTime <= 0) return 0;
    return (this.time / this.totalTime) * 100;
  }

  @computed get displayData(): TokeDisplayData {
    return {
      isActive: this.underway,
      totalDuration: this.totalTime,
      remainingTime: this.time,
      initiator: this.initiator,
      participants: this.participants,
      currentSession: this.currentSession,
      totalSessions: this.totalSessions,
      formattedTimeRemaining: this.formattedTimeRemaining,
      percentRemaining: this.percentRemaining
    };
  }

  @action
  joinToke() {
    if (this.underway) {
      send("chat", { mentions: [], msg: "/join" });
    } else {
      send("chat", { mentions: [], msg: "/toke" });
    }
  }
  
  @action
  joinTokeMultiple(times: number) {
    if (this.underway) {
      send("chat", { mentions: [], msg: `/join ${times}` });
    }
  }
  
  @action
  cancelToke() {
    send("chat", { mentions: [], msg: "/canceltoke" });
  }
})();