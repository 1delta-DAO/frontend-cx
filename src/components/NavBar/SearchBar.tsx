// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import clsx from 'clsx'
import { NftVariant, useNftFlag } from 'featureFlags/flags/nft'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { magicalGradientOnHover } from 'nft/css/common.css'
import { useIsMobile } from 'hooks/useIsMobile'
import { ChangeEvent, useEffect, useReducer, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'

import { ChevronLeftIcon, MagnifyingGlassIcon, NavMagnifyingGlassIcon } from '../../nft/components/icons'
import { NavIcon } from './NavIcon'
import * as styles from './SearchBar.css'
import { useIsTablet } from 'hooks/useIsTablet'

export const SearchBar = () => {
  const [isOpen, toggleOpen] = useReducer((state: boolean) => !state, false)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const phase1Flag = useNftFlag()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  useOnClickOutside(searchRef, () => {
    isOpen && toggleOpen()
  })

  // close dropdown on escape
  useEffect(() => {
    const escapeKeyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        toggleOpen()
      }
    }

    document.addEventListener('keydown', escapeKeyDownHandler)

    return () => {
      document.removeEventListener('keydown', escapeKeyDownHandler)
    }
  }, [isOpen, toggleOpen])

  // clear searchbar when changing pages
  useEffect(() => {
    setSearchValue('')
  }, [pathname])

  // auto set cursor when searchbar is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const placeholderText = phase1Flag === NftVariant.Enabled ? t`Search tokens and NFT collections` : t`Search tokens`
  const isMobileOrTablet = isMobile || isTablet
  const showCenteredSearchContent =
    !isOpen && phase1Flag !== NftVariant.Enabled && !isMobileOrTablet && searchValue.length === 0

  const navbarSearchEventProperties = {
    navbar_search_input_text: debouncedSearchValue,
  }

  return (
    <Box position="relative">
      <Box
        position={{ sm: 'fixed', md: 'absolute' }}
        width={{ sm: isOpen ? 'viewWidth' : 'auto', md: 'auto' }}
        ref={searchRef}
        className={styles.searchBarContainer}
        display={{ sm: isOpen ? 'inline-block' : 'none', xl: 'inline-block' }}
      >
        <Row
          className={clsx(
            ` ${styles.searchBar} ${!isOpen && !isMobile && magicalGradientOnHover} ${isMobileOrTablet && (isOpen ? styles.visible : styles.hidden)
            }`
          )}
          borderRadius={isOpen || isMobileOrTablet ? undefined : '12'}
          borderTopRightRadius={isOpen && !isMobile ? '12' : undefined}
          borderTopLeftRadius={isOpen && !isMobile ? '12' : undefined}
          borderBottomWidth={isOpen || isMobileOrTablet ? '0px' : '1px'}
          onClick={() => !isOpen && toggleOpen()}
          gap="12"
        >
          <Box className={showCenteredSearchContent ? styles.searchContentCentered : styles.searchContentLeftAlign}>
            <Box display={{ sm: 'none', md: 'flex' }}>
              <MagnifyingGlassIcon />
            </Box>
            <Box display={{ sm: 'flex', md: 'none' }} color="textTertiary" onClick={toggleOpen}>
              <ChevronLeftIcon />
            </Box>
          </Box>
          <Box
            as="input"
            placeholder={placeholderText}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              !isOpen && toggleOpen()
              setSearchValue(event.target.value)
            }}
            className={`${styles.searchBarInput} ${showCenteredSearchContent ? styles.searchContentCentered : styles.searchContentLeftAlign
              }`}
            value={searchValue}
            ref={inputRef}
            width={phase1Flag === NftVariant.Enabled || isOpen ? 'full' : '160'}
          />
        </Row>
      </Box>
      <NavIcon onClick={toggleOpen}>
        <NavMagnifyingGlassIcon />
      </NavIcon>
    </Box>
  )
}
