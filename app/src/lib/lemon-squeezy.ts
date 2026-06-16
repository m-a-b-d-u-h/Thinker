declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Refresh: () => void;
    };
  }
}

export function openCheckout(url: string) {
  if (window.LemonSqueezy?.Url) {
    try {
      window.LemonSqueezy.Url.Open(url);
      return;
    } catch {}
  }
  window.open(url, "_blank");
}
