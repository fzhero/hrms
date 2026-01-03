// Loader service to manage global loader state
// This allows axios interceptors to control the loader without React hooks

let loaderFunctions = null

export const setLoaderFunctions = (showLoader, hideLoader) => {
  loaderFunctions = { showLoader, hideLoader }
}

export const showLoader = () => {
  if (loaderFunctions) {
    loaderFunctions.showLoader()
  }
}

export const hideLoader = () => {
  if (loaderFunctions) {
    loaderFunctions.hideLoader()
  }
}

