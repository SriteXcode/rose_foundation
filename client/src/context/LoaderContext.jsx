import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let activeRequests = 0;

    const onRequest = (config) => {
      activeRequests++;
      setIsLoading(true);
      setProgress(0); // Reset on new request? Or keep accumulating? 
      // For single global loader, resetting is safer but might flicker if multiple requests.
      // Let's rely on individual progress events.
      return config;
    };

    const onRequestError = (error) => {
      activeRequests--;
      if (activeRequests === 0) {
        setIsLoading(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 200);
      }
      return Promise.reject(error);
    };

    const onResponse = (response) => {
      activeRequests--;
      if (activeRequests === 0) {
        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
        }, 300); // Short delay to show 100%
      }
      return response;
    };

    const onResponseError = (error) => {
      activeRequests--;
      if (activeRequests === 0) {
        setIsLoading(false);
        setProgress(0);
      }
      return Promise.reject(error);
    };

    // Progress handlers need to be attached to the config per request
    // But we can set defaults or wrap them. 
    // Axios interceptors don't get 'progress' events directly. 
    // We need to inject the handler into the config in the request interceptor.

    const reqInterceptor = axiosInstance.interceptors.request.use((config) => {
        config.onUploadProgress = (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            setProgress(percent);
        };
        config.onDownloadProgress = (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            // Download progress might conflict with upload progress if happening simultaneously.
            // We'll just take the latest event.
            setProgress(percent);
        };
        return onRequest(config);
    }, onRequestError);

    const resInterceptor = axiosInstance.interceptors.response.use(onResponse, onResponseError);

    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
    };
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, progress, setIsLoading, setProgress }}>
      {children}
    </LoaderContext.Provider>
  );
};
