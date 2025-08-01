import React, { useEffect } from 'react';
import './AdBanner.css';

const AdBanner = () => {
  useEffect(() => {
    // Add the ad configuration
    window.atOptions = {
      'key': '8b5bc42d6636f0065d9d200dffde79b1',
      'format': 'iframe',
      'height': 300,
      'width': 160,
      'params': {}
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = '//www.highperformanceformat.com/8b5bc42d6636f0065d9d200dffde79b1/invoke.js';
    script.async = true;
    document.getElementById('ad-banner-container').appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="ad-banner-fixed">
      <div id="ad-banner-container" className="ad-banner-inner"></div>
    </div>
  );
};

export default AdBanner; 