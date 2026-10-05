// jsdom has no AnimationEvent, which makes react-dom listen for `webkitAnimationEnd`
// instead of `animationend`. This must load before react-dom is first imported.
if (typeof window !== "undefined" && typeof window.AnimationEvent === "undefined") {
  window.AnimationEvent = class AnimationEvent extends Event {
    readonly animationName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init);
      this.animationName = init.animationName ?? "";
      this.elapsedTime = init.elapsedTime ?? 0;
      this.pseudoElement = init.pseudoElement ?? "";
    }
  };
}
