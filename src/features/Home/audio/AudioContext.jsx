import React from 'react';
import { useAudio as useGlobalAudio } from '../../../context/AudioContext';

export const useAudio = () => {
  return useGlobalAudio();
};

export const AudioProvider = ({ children }) => {
  return <>{children}</>;
};

export default { useAudio, AudioProvider };
