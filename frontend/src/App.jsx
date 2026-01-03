import { BrowserRouter } from 'react-router-dom'
import { LoaderProvider } from './contexts/LoaderContext'
import GlobalLoader from './components/GlobalLoader'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <LoaderProvider>
      <BrowserRouter>
        <GlobalLoader />
        <AppRoutes />
      </BrowserRouter>
    </LoaderProvider>
  )
}

export default App

