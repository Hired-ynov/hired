export async function sha256(input: string) {
  const inputBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', inputBuffer);
  const hashArray = [...new Uint8Array(hashBuffer)];

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
