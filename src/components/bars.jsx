import { animated, useSpring } from "@react-spring/web";

const Bar = ({ amplitude, multiplier, delay }) => {
  const springProps = useSpring({
    height: amplitude * multiplier,
    transform: amplitude > 0 ? 'translateY(0px)' : 'translateY(100px)',
    opacity: amplitude > 0 ? 1 : 0,
    from: { height: 0, transform: 'translateY(100px)', opacity: 0 },
    delay: delay,
  });

  return (
    <animated.div
      style={springProps}
      className="min-h-2 min-w-2 bg-white rounded-lg"
    ></animated.div>
  );
};

export default Bar;
