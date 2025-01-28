import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

const shrinkConfig = { tension: 170, friction: 20, duration: 600 };
const fadeConfig = { duration: 200 };

const StartRecordingButton = ({ startRecording, isRecording }) => {

  const handleClick = () => {
    startRecording();
  };

  const shrinkProps = useSpring({
    transform: isRecording ? "scale(0)" : "scale(1)",
    config: shrinkConfig,
  });

  const fadeProps = useSpring({
    opacity: isRecording ? 0 : 1,
    delay: 200,
    config: fadeConfig,
  });

  return (
    <animated.button
      type="button"
      onClick={handleClick}
      style={{
        ...shrinkProps,
        ...fadeProps,
        transform: `${shrinkProps.transform.get()} translate(-50%, -50%)`,
      }}
      className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl"
    ></animated.button>
  );
};

export default StartRecordingButton;
