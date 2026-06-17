declare global {
  interface Window {
    createLemonSqueezy?: () => void;
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

      const observer = new MutationObserver(() => {
        const iframes = document.querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="lemonsqueezy"]',
        );
        iframes.forEach((iframe) => {
          iframe.setAttribute("allowtransparency", "true");
          iframe.style.background = "transparent";
        });
        if (iframes.length > 0) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return;
    } catch {}
  }
  window.open(url, "_blank");
}
