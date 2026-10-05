// jsdom has no AnimationEvent, so react-dom would bind `onAnimationEnd` to the
// vendor-prefixed `webkitAnimationEnd` instead of the real `animationend` event.
// This must run before react-dom is first imported.
if (typeof window !== "undefined" && !("AnimationEvent" in window)) {
  Object.defineProperty(window, "AnimationEvent", { value: Event, configurable: true });
}
