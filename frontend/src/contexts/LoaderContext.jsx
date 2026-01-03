import { createContext, useContext, useState, useEffect } from 'react'
import { setLoaderFunctions } from '../services/loaderService'

const LoaderContext = createContext()

export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return context
}

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  const showLoader = () => {
    setRequestCount(prev => {
      const newCount = prev + 1
      if (newCount === 1) {
        setLoading(true)
      }
      return newCount
    })
  }

  const hideLoader = () => {
    setRequestCount(prev => {
      const newCount = Math.max(0, prev - 1)
      if (newCount === 0) {
        setLoading(false)
      }
      return newCount
    })
  }

  // Register loader functions with the service so axios can use them
  useEffect(() => {
    setLoaderFunctions(showLoader, hideLoader)
  }, [])

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  )
}

