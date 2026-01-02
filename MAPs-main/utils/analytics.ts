export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  try {
    await fetch('http://localhost:8000/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};
