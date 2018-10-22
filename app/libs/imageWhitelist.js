import URL from "url-parse";

export const allowedDomains = [
  "i.imgur.com",
  "imgur.com",
  "i.reddituploads.com",
  "media.giphy.com",
  "tr-avatars.herokuapp.com",
  "thumbs.gfycat.com",
  "gfycat.com",
  "giant.gfycat.com"
];

export default function imgUrlWhitelisted(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return false; //probably not a link.
  }
  return allowedDomains.includes(parsed.hostname);
}
