import { autorun, observable, action, makeAutoObservable } from "mobx";
import fbase from "../libs/fbase";
import { send } from "../libs/events";
import profile from "./profile";
import epoch from "../utils/epoch";

export const hypeIntervalSeconds = 60; // It was 260 = 4:20 before, people found that too long

class HypeTimer {
  @observable accessor lasthype = epoch();
  @observable accessor hypePercentageCharged = 0;
  @observable accessor secondsfromhype = 0;

  constructor() {

    autorun(() => {
      const recheck = setInterval(action("initializeHypeTimer", () => {
        if (profile.uid == false) return;
        clearInterval(recheck);

        // Initial fetch
        this.initializeHypeData();

        // Setup listener
        this.setupHypeListener();
      }), 10000);

      // Regular timer check
      setInterval(action("regularTimerCheck", () => {
        this.checkTimer();
      }), 1000);
    });
  }

  private initializeHypeData = action("initializeHypeData", async () => {
    try {
      const snap = await fbase.database().ref("/hypes").child(profile.uid).once("value");
      const hypesnap = snap.val();

      if (hypesnap != null) {
        action("initializeHypeData", () => {
          this.lasthype = hypesnap.lasthype;
        })
      } else {
        action("initializeHypeData", () => {
          this.lasthype = epoch() - hypeIntervalSeconds;
        })
      }
      this.checkTimer();
    } catch (error) {
      console.error("Error initializing hype data:", error);
    }
  });

  private setupHypeListener = action("setupHypeListener", () => {
    fbase
      .database()
      .ref("/hypes")
      .child(profile.uid)
      .on("value", action("onHypeUpdate", (snap) => {
        const hypesnap = snap.val();
        if (hypesnap != null) {
          this.lasthype = hypesnap.lasthype;
        } else {
          this.lasthype = epoch() - hypeIntervalSeconds;
        }
        this.checkTimer();
      }));
  });

  private checkTimer = action("checkTimer", () => {
    let timeleft = Math.round(((epoch() - this.lasthype) / hypeIntervalSeconds) * 100);
    this.secondsfromhype = epoch() - this.lasthype;
    if (timeleft > 100) timeleft = 100;
    this.hypePercentageCharged = timeleft;
  });

  public getHyped = action("getHyped", async (): Promise<void> => {
    return await send("chat", { mentions: [], msg: "/hype" });
  });
}

export const hypetimer = new HypeTimer();