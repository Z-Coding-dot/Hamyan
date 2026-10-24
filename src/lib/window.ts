export type DesktopPlatform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd'

/** Web build has no native window chrome. */
export function getDesktopPlatform(): DesktopPlatform {
  return 'linux'
}

export function hasWindowControls(): boolean {
  return false
}

export function getWindowApi() {
  return undefined
}
