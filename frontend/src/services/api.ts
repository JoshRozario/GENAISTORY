export async function getHealth() {
  const res = await fetch('/api/health');
  return res.json();
}
