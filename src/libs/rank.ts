import {getDatabaseRef} from "./fbase";

export default function getRank(uid: string) {
  return getDatabaseRef("ranks")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

export async function getUserRank(uid: string) {
  let rank = await getDatabaseRef("ranks")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
  if (!rank) rank = "User";
  return rank;
}

export function listenRank(uid: string) {
  return getDatabaseRef("ranks")
    .child(uid)
    .on("value", snap => snap.val());
}

async function ranksSettings() {
  const snap = await getDatabaseRef("settings")
    .child("ranks")
    .once("value");
  return snap.val();
}

export async function getSettingsForRank(rank: string) {
  const settings = await ranksSettings();
  console.log(`Rank settings for ${rank}:`, settings);
  return (await settings.ranks[rank]) || {};
}

export async function getAllRanks(cbFunc: (ranks: any) => void) {
  getDatabaseRef("ranks").once("value", snap => cbFunc(snap.val()));
}
