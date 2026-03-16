export const isOnScreen = (element: HTMLDivElement, offset = 0) => {
  const top = element.getBoundingClientRect().top;
  return top + offset >= 0 && top - offset <= window.innerHeight;
};
