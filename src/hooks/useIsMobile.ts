import { useEffect, useState } from 'react'

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  xxxl: 1920,
}

const isClient = typeof window !== 'undefined'

function getIsMobile() {
  return isClient ? window.innerWidth < breakpoints.sm : false
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    function handleResize() {
      setIsMobile(getIsMobile())
    }

    if (isClient) {
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    return undefined
  }, [])

  return isMobile
}
