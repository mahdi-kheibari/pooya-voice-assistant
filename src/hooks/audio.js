import { useEffect, useState } from 'react';

export const useAudio = () => {
  const [amplitude, setAmplitude] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let audioContext;
    let analyser;
    let bufferLength;
    let dataArray;

    const getMicrophoneInput = async () => {
      try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (err) {
        alert(`Error accessing microphone ${err}`);
      }
    };

    const updateAmplitude = () => {
      analyser.getByteFrequencyData(dataArray);
      const avgAmplitude = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setAmplitude(avgAmplitude);
      if (isRecording) {
        requestAnimationFrame(updateAmplitude);
      }
    };

    if (isRecording) {
      getMicrophoneInput().then(updateAmplitude);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);

  const startRecording = () => setIsRecording(true);

  return { amplitude, startRecording };
};
