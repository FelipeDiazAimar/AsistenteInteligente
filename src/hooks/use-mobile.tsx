
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mql.matches);
    
    handler(); // Set initial value on client mount
    mql.addEventListener("change", handler);
    
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
