/** First-visit splash: only show if load is still pending after this delay. */
export const LOADER_SHOW_DELAY_MS = 500;

/** Once visible, keep the splash up long enough for the motion to land. */
export const LOADER_MIN_VISIBLE_MS = 700;

/** Exit fade duration (seconds for motion, ms for unmount timer). */
export const LOADER_EXIT_DURATION_S = 0.45;
export const LOADER_EXIT_DURATION_MS = LOADER_EXIT_DURATION_S * 1000;

/** Hard failsafe so the splash never sticks forever. */
export const LOADER_FAILSAFE_MS = 3000;
