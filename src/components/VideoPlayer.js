import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.plyr.source = {
        type: 'video',
        sources: [
          {
            src: src,
            type: 'application/x-mpegURL',
          },
        ],
      };
    }
  }, [src]);

  return (
    <Plyr
      ref={videoRef}
      source={{
        type: 'video',
        sources: [
          {
            src: src,
            type: 'application/x-mpegURL',
          },
        ],
      }}
      options={{
        controls: [
          'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'
        ],
        settings: ['quality', 'speed'],
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default VideoPlayer; 