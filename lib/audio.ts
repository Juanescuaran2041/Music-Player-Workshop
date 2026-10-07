export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () =>
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => reject(new Error("Could not read audio file"));
    audio.src = url;
  });
}
