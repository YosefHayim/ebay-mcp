/** Inner SVG markup for one line icon per tool family. 24x24 grid, drawn with a 1.75 stroke. */
const familyIconMarkup: Record<string, string> = {
  marketing:
    '<path d="M3 10.5v3a1 1 0 0 0 1 1h2.5L15 18.5v-13L6.5 9.5H4a1 1 0 0 0-1 1z"/><path d="M18.5 9a4 4 0 0 1 0 6"/><path d="M7 14.5l1 4.5h2.5l-.9-4"/>',
  inventory:
    '<rect x="8" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  fulfillment:
    '<path d="M3 5.5h10v11H3z"/><path d="M13 9h4.2l3.8 3.5V16.5H13"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  finances:
    '<ellipse cx="9" cy="6.5" rx="6" ry="3"/><path d="M3 6.5v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4"/><path d="M3 10.5v4c0 1.7 2.7 3 6 3 1.2 0 2.3-.2 3.2-.5"/><path d="M15 12.2c3.3 0 6 1.2 6 2.8v3.5c0 1.6-2.7 2.8-6 2.8s-6-1.2-6-2.8V15c0-1.6 2.7-2.8 6-2.8z"/>',
  account:
    '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 9.5-5.7"/><circle cx="18" cy="17" r="2.2"/><path d="M18 13.2v1.3M18 19.5v1.3M14.2 17h1.3M20.5 17h1.3"/>',
  communication:
    '<path d="M4 4.5h10a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H9L6 15v-2.5H4A1.5 1.5 0 0 1 2.5 11V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M18 9.5h2a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-.5V20l-3-2.5H11a1.5 1.5 0 0 1-1.5-1.5v-.5"/>',
  feed: '<path d="M8 3h7l4 4v8"/><path d="M5 7h7l4 4v10H5z"/><path d="M10.5 18v-5M8 15.5l2.5-2.5 2.5 2.5"/>',
  stores:
    '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/><path d="M10 20v-4h4v4"/>',
  logistics:
    '<path d="M12 2.5a5 5 0 0 1 5 5c0 3.5-5 8.5-5 8.5s-5-5-5-8.5a5 5 0 0 1 5-5z"/><circle cx="12" cy="7.5" r="1.7"/><path d="M8.5 17.5C5.5 18 4 19 4 20.2c0 1.3 3.6 2.3 8 2.3s8-1 8-2.3c0-1.2-1.5-2.2-4.5-2.7"/>',
  analytics:
    '<rect x="4.5" y="12" width="3.5" height="8" rx="1"/><rect x="10.25" y="4.5" width="3.5" height="15.5" rx="1"/><rect x="16" y="9" width="3.5" height="11" rx="1"/>',
  metadata:
    '<path d="M3.5 4.5H12l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-5.4 5.4a1.5 1.5 0 0 1-2.1 0L3.5 12z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  taxonomy:
    '<rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="3" y="16" width="6" height="5" rx="1.2"/><rect x="15" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M6 16v-4h12v4"/>',
  browse: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
  trading: '<path d="M4 8h14M14 4l4 4-4 4"/><path d="M20 16H6M10 12l-4 4 4 4"/>',
  developer: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/>',
  'token-management':
    '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L20 3M16 7l3 3M14 9l2 2"/>',
  connector: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>',
  other:
    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
};

/** One complete family icon as an SVG string, for pages built in the browser. */
export const renderFamilyIconSvg = (familyKey: string, size: number): string => {
  const innerMarkup = familyIconMarkup[familyKey] ?? familyIconMarkup.other;

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${innerMarkup}</svg>`;
};
