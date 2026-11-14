import { keyframes } from "@mui/material/styles";
import { colors, LINE, motion } from "./tokens";

/** Token turning from its cardboard back to the champion face. */
export const flipIn = keyframes`
  from { transform: rotateY(180deg); }
  to { transform: rotateY(0deg); }
`;

/** Token landing on its seat. */
export const dropIn = keyframes`
  from { transform: translateY(-22px) scale(1.08); opacity: 0; }
  60% { opacity: 1; }
  to { transform: translateY(0) scale(1); opacity: 1; }
`;

/** Die rolling over before settling on its new face. */
export const tumble = keyframes`
  0% { transform: translateY(-16px) rotate(-220deg) scale(0.84); }
  55% { transform: translateY(0) rotate(14deg) scale(1.05); }
  78% { transform: translateY(0) rotate(-5deg) scale(0.99); }
  100% { transform: translateY(0) rotate(0deg) scale(1); }
`;

/** Text that arrives with its token. */
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** Reduced motion: a short ink ring instead of movement. */
export const highlight = keyframes`
  from { outline: ${LINE + 1}px solid ${colors.ink}; outline-offset: 4px; }
  to { outline: ${LINE + 1}px solid transparent; outline-offset: 4px; }
`;

export const REDUCED = "@media (prefers-reduced-motion: reduce)";

export const highlightAnimation = `${highlight} 900ms ${motion.easeOut} both`;
