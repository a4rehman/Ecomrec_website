declare module "*.css";

// ---------------------------------------------------------------------------
// ElevenLabs custom web component — typed without importing React so this
// global ambient file stays free of module imports.
// Both JSX and React.JSX namespaces are augmented for compatibility with
// React 19 (uses React.JSX) and older TypeScript tooling (uses global JSX).
// ---------------------------------------------------------------------------
interface ElevenLabsConvaiProps {
  "agent-id"?: string;
  id?: string;
  class?: string;
  className?: string;
  style?: string;
  [key: string]: unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    "elevenlabs-convai": ElevenLabsConvaiProps;
  }
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": ElevenLabsConvaiProps;
    }
  }
}
