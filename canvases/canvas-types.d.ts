/**
 * Ambient types for Cursor canvas files so the IDE typechecks without bundling `cursor/canvas`.
 */
declare module "cursor/canvas" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  type TextTone = "secondary" | "success" | "warning" | "info" | "neutral";
  type PillTone = "success" | "warning" | "info" | "neutral";

  export const H1: ComponentType<{ children?: ReactNode }>;
  export const H2: ComponentType<{ children?: ReactNode }>;
  export const H3: ComponentType<{ children?: ReactNode }>;
  export const Text: ComponentType<{
    children?: ReactNode;
    size?: "small" | "medium" | "large";
    tone?: TextTone;
    weight?: "normal" | "semibold" | "bold";
  }>;
  export const Divider: ComponentType<Record<string, never>>;
  export const Grid: ComponentType<{ columns?: number; gap?: number; children?: ReactNode }>;
  export const Stack: ComponentType<{ gap?: number; style?: CSSProperties; children?: ReactNode }>;
  export const Row: ComponentType<{ gap?: number; children?: ReactNode }>;
  export const Stat: ComponentType<{ value: string | number; label: string; tone?: string }>;
  export const Table: ComponentType<{
    headers: string[];
    rows: string[][];
    striped?: boolean;
    stickyHeader?: boolean;
    framed?: boolean;
    rowTone?: string[];
  }>;
  export const Pill: ComponentType<{
    size?: string;
    tone?: PillTone;
    active?: boolean;
    children?: ReactNode;
  }>;
  export const Card: ComponentType<{
    collapsible?: boolean;
    defaultOpen?: boolean;
    children?: ReactNode;
  }>;
  export const CardHeader: ComponentType<{ children?: ReactNode; trailing?: ReactNode }>;
  export const CardBody: ComponentType<{ children?: ReactNode }>;
}
