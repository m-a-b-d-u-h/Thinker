let pendingUrl: string | null = null;

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Refresh: () => void;
    };
    createLemonSqueezy?: () => void;
  }
}

export function openCheckout(url: string) {
  if (window.LemonSqueezy?.Url) {
    window.LemonSqueezy.Url.Open(url);
    return;
  }
  pendingUrl = url;
  const check = setInterval(() => {
    if (window.LemonSqueezy?.Url) {
      window.LemonSqueezy.Url.Open(pendingUrl!);
      pendingUrl = null;
      clearInterval(check);
    }
  }, 200);
  setTimeout(() => clearInterval(check), 10000);
}
