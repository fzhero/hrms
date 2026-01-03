import { useLoader } from '../contexts/LoaderContext'
import Loader from './common/Loader'
import './GlobalLoader.css'

const GlobalLoader = () => {
  const { loading } = useLoader()

  if (!loading) return null

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-content">
        <Loader size="large" />
        <p className="global-loader-text">Loading...</p>
      </div>
    </div>
  )
}

export default GlobalLoader

