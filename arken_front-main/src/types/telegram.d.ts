export { };

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                openLink: (url: string) => void;
            };
        };
    }
}