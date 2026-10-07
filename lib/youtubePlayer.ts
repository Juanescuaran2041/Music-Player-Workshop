export type YTPlayer = {
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};

type YTEvent = { data: number };

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      playerVars: Record<string, number>;
      events: {
        onReady: () => void;
        onStateChange: (event: YTEvent) => void;
        onError: (event: YTEvent) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 } as const;

// Explains the error codes the IFrame player reports
export function youtubeErrorMessage(code: number): string {
  switch (code) {
    case 2:
      return "YouTube rejected this video link.";
    case 5:
      return "YouTube could not play this video in the browser.";
    case 100:
      return "This video was removed or is private.";
    case 101:
    case 150:
      return "The owner of this video does not allow playing it outside YouTube. Try another version, such as a lyric or audio upload.";
    case 153:
      return "YouTube blocked this embed because the page sent no referrer.";
    default:
      return `YouTube could not play this video (error ${code}).`;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  apiPromise ??= new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!);
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiPromise;
}
