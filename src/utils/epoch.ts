export default function epoch(): number {
  return Math.round(Date.now() / 1000);
}
