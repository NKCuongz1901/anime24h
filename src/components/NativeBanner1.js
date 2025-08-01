import { useEffect } from 'react';

export default function NativeBanner1() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//pl26750802.profitableratecpm.com/040841fe1ef9c8041cccce179597d781/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    const container = document.getElementById('container-040841fe1ef9c8041cccce179597d781');
    if (container) container.innerHTML = '';
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 0, padding: 0 }}>
      <div id="container-040841fe1ef9c8041cccce179597d781"></div>
    </div>
  );
} 