export const findElement = <Found extends Element = HTMLElement>(
  parent: ParentNode,
  selector: string,
): Found => {
  const foundElement = parent.querySelector<Found>(selector);
  if (foundElement == null) throw new Error(`The page has no element for ${selector}`);

  return foundElement;
};

export const isReducedMotionPreferred = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
