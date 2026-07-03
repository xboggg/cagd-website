import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxHeroProps {
  backgroundImage?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
  height?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxHero({
  backgroundImage,
  backgroundColor = "bg-accent",
  overlayOpacity = 0.5,
  height = "h-[400px] md:h-[500px]",
  children,
  className = "",
}: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [elementTop, setElementTop] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setElementTop(ref.current.offsetTop);
    }
  }, []);

  // Parallax effect - background moves slower than scroll
  const y = useTransform(
    scrollY,
    [elementTop - 500, elementTop + 500],
    ["-20%", "20%"]
  );

  // Fade out text as user scrolls
  const opacity = useTransform(
    scrollY,
    [elementTop, elementTop + 200],
    [1, 0.3]
  );

  if (!backgroundImage) {
    // Simple gradient background without parallax
    return (
      <section
        ref={ref}
        className={`relative ${backgroundColor} text-accent-foreground ${height} flex items-center overflow-hidden ${className}`}
      >
        <div className="container relative z-10">
          <motion.div style={{ opacity }}>
            {children}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={`relative ${height} flex items-center overflow-hidden ${className}`}
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[140%] -top-[20%]"
      >
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="container relative z-10 text-white">
        <motion.div style={{ opacity }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
