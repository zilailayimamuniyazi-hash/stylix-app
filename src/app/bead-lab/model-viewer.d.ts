import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          "auto-rotate"?: boolean | string;
          "camera-controls"?: boolean | string;
          "environment-image"?: string;
          exposure?: string | number;
          "shadow-intensity"?: string | number;
          "shadow-softness"?: string | number;
          "tone-mapping"?: string;
          scale?: string;
          loading?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
      "extra-model": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          offset?: string;
          orientation?: string;
          scale?: string;
          background?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
