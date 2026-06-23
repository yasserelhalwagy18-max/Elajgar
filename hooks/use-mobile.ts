import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Set initial value without triggering synchronous state update in the main effect body
    // if possible, but actually we can just rely on the matchMedia event or read it initially
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)

    // Defer the initial setting to avoid synchronous setState inside useEffect body warning,
    // though the standard way is to initialize the state with window value if possible.
    // Given SSR considerations, we do it in a small timeout or just leave the initial read to happen immediately.
    setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 0)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
