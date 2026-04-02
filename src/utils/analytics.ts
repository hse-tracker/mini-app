const YM_COUNTER_ID = 108365028;

export const logUXToBackend = async (tabName: string, token: string) => {
  if (!token) return;
  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logs/navigation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tab_name: tabName })
    });
  } catch (err) {
    console.warn("Failed to log action:", err);
  }
};

export const trackPageView = (url: string) => {
  console.log(`[Analytics] send page:`, url);
  if (typeof window.ym !== 'undefined') {
    window.ym(YM_COUNTER_ID, 'hit', url);
  } else {
    console.warn(`[Analytics] window.ym not found`);
  }

  const token = localStorage.getItem('initial_token');
  if (token) {
    logUXToBackend(`page_view: ${url}`, token);
  }
};

export const trackEvent = (eventName: string, params?: object) => {
  console.log(`[Analytics] send event:`, eventName, params);
  if (typeof window.ym !== 'undefined') {
    window.ym(YM_COUNTER_ID, 'reachGoal', eventName, params);
  } else {
    console.warn(`[Analytics] window.ym not found`);
  }

  const token = localStorage.getItem('initial_token');
  if (token) {
    let actionString = `event: ${eventName}`;
    if (params) {
      actionString += ` | params: ${JSON.stringify(params)}`;
    }
    logUXToBackend(actionString, token);
  }
};
