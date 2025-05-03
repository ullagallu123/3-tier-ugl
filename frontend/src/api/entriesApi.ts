import { Entry } from '../types';
import { apiCallCounter, httpRequestDurationMicroseconds } from '../monitoring/metrics';

const API_URL = import.meta.env.VITE_API_URL || '/api/entries';

// Only initialize New Relic in server environment
const newrelic = typeof window === 'undefined' && import.meta.env.VITE_NEW_RELIC_LICENSE_KEY ? 
  require('newrelic') : null;

export const fetchEntries = async (): Promise<Entry[]> => {
  const startTime = Date.now();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Record metrics
    apiCallCounter.inc({ method: 'GET', endpoint: '/entries' });
    httpRequestDurationMicroseconds.observe(
      { method: 'GET', route: '/entries', status_code: response.status },
      (Date.now() - startTime) / 1000
    );

    // New Relic custom attributes
    if (newrelic) {
      newrelic.addCustomAttribute('responseTime', Date.now() - startTime);
      newrelic.addCustomAttribute('entriesCount', data.length);
    }

    return data;
  } catch (error) {
    if (newrelic) {
      newrelic.noticeError(error);
    }
    throw error;
  }
};

export const addEntry = async (amount: number, description: string): Promise<void> => {
  const startTime = Date.now();
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Record metrics
    apiCallCounter.inc({ method: 'POST', endpoint: '/entries' });
    httpRequestDurationMicroseconds.observe(
      { method: 'POST', route: '/entries', status_code: response.status },
      (Date.now() - startTime) / 1000
    );

  } catch (error) {
    if (newrelic) {
      newrelic.noticeError(error);
    }
    throw error;
  }
};

export const deleteEntry = async (id: number): Promise<void> => {
  const startTime = Date.now();
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Record metrics
    apiCallCounter.inc({ method: 'DELETE', endpoint: '/entries' });
    httpRequestDurationMicroseconds.observe(
      { method: 'DELETE', route: '/entries', status_code: response.status },
      (Date.now() - startTime) / 1000
    );

  } catch (error) {
    if (newrelic) {
      newrelic.noticeError(error);
    }
    throw error;
  }
};