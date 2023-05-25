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

function getIsTablet() {
  return isClient ? window.innerWidth < breakpoints.lg && window.innerWidth >= breakpoints.sm : false
}

export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(getIsTablet)

  useEffect(() => {
    function handleResize() {
      setIsTablet(getIsTablet())
    }

    if (isClient) {
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    return undefined
  }, [])

  return isTablet
}
