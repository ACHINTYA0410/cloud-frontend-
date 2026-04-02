import { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";

interface Props {
  value: number;
  className?: string;
  decimals?: number;
  suffix?: string;
  useGrouping?: boolean;
}

export default function AnimatedNumber({
  value,
  className,
  decimals = 0,
  suffix = "",
  useGrouping = false,
}: Props) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  useMotionValueEvent(motionValue, "change", (latest) => {
    const factor = 10 ** decimals;
    const rounded = Math.round(latest * factor) / factor;
    setDisplayValue(
      rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      }),
    );
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [motionValue, value]);

  return (
    <span className={className}>
      {displayValue}
      {suffix}
    </span>
  );
}
