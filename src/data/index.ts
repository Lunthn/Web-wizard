export const MANIFEST_DATA = {
  manifest_version: 3,
  name: "Web Wizard",
  version: "1.0",
  description:
    "Analyze website designs - instantly reveal color palettes and typography choices with a single click. Perfect for designers and developers.",
  action: {
    default_popup: "index.html",
  },
  author: "Nathan Lupke",
  permissions: ["activeTab", "scripting"],
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["content.js"],
      run_at: "document_idle",
      type: "module",
    },
  ],
  icons: {
    "16": "icon-16.png",
    "32": "icon-32.png",
    "48": "icon-48.png",
    "128": "icon-128.png",
  },
};

export const SOCIAL_LINKS = {
  GITHUB_PROFILE: "https://github.com/lunthn",
  GITHUB_REPO: "https://github.com/lunthn/web-tools",
  MAIL: "nr.lupke@gmail.com",
  LINKEDIN: "https://linkedin.com/in/nathanlupke",
  COFFE: "https://buymeacoffee.com/lunthn",
};

export const DEFAULT_SETTINGS = {
  THEME: "dark" as "dark" | "light",
  FORMAT: "rgb",
  HIGHLIGHT_COLOR: "#FFFF00",
  HIDE_NOTES: false,
};
