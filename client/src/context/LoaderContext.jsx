import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/api';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRequests = useRef(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stall at 90%
        // Decelerate: add less as we get higher
        const add = Math.max(1, (90 - prev) / 10);
        return prev + add;
      });
    }, 200);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    const onRequest = (config) => {
      if (activeRequests.current === 0) {
        setIsLoading(true);
        setProgress(10); // Start at 10%
        startTimer();
      }
      activeRequests.current++;
      return config;
    };

    const onRequestError = (error) => {
      activeRequests.current--;
      if (activeRequests.current === 0) {
        stopTimer();
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 500);
      }
      return Promise.reject(error);
    };

    const onResponse = (response) => {
      activeRequests.current--;
      if (activeRequests.current === 0) {
        stopTimer();
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 500);
      }
      return response;
    };

    const onResponseError = (error) => {
      activeRequests.current--;
      if (activeRequests.current === 0) {
        stopTimer();
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 500);
      }
      return Promise.reject(error);
    };

    const reqInterceptor = axiosInstance.interceptors.request.use(onRequest, onRequestError);
    const resInterceptor = axiosInstance.interceptors.response.use(onResponse, onResponseError);

    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
      stopTimer();
    };
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, progress, setIsLoading, setProgress }}>
      {children}
    </LoaderContext.Provider>
  );
};
