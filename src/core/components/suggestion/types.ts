import type { UseFloatingOptions } from "@floating-ui/react";
import type { Editor } from "@tiptap/core";
import type { PluginKey } from "@tiptap/pm/state";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { ReactNode } from "react";

export interface SuggestionItemProps<T = any> {
  title: string;
  subtext?: string;
  badge?: string;
  group?: string;
  keywords?: string[];
  context?: T; // ?
  onSelect: (props: { editor: Editor; range: Range; context?: T }) => void;
}

export type SuggestionMenuRenderProps<T> = {
  items: SuggestionItemProps<T>[];
  selectedIndex?: number;
  onSelect: (item: SuggestionItemProps<T>) => void;
};

export interface SuggestionMenuProps<T = any>
  extends Omit<SuggestionOptions<SuggestionItemProps<T>>, "pluginKey" | "editor"> {
  editor?: Editor | null;
  floatingOptions?: Partial<UseFloatingOptions>;
  selector?: string;
  pluginKey?: string | PluginKey;
  maxHeight?: number;
  children: (props: SuggestionMenuRenderProps<T>) => ReactNode;
}
