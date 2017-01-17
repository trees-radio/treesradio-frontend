import URL from 'url-parse';

const allowedDomains = [
  'i.imgur.com',
  'imgur.com',
  'i.reddituploads.com'
];

export default function imgUrlWhitelisted(url) {
  const parsed = new URL(url);
  return allowedDomains.includes(parsed.hostname);
}