let isMac = undefined;
export function isMacOS() {
  if (isMac === undefined) {
    isMac = /^mac/i.test(window.navigator.platform);
  }

  return isMac;
}