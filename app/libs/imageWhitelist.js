import URL from 'url-parse';

const allowedDomains = [
  'i.imgur.com',
  'imgur.com',
  'i.reddituploads.com'
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