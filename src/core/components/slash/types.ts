import type { SlashMenuItemType } from "@/components/slash/use-slash-dropdown";
import type { SuggestionItemProps, SuggestionMenuProps } from "@/components/suggestion/types";

export type SlashProps = Omit<SuggestionMenuProps, "items" | "children"> & {
  config?: SlashMenuConfigProps;
};

export interface SlashMenuConfigProps {
  enabledItems?: SlashMenuItemType[];
  customItems?: SuggestionItemProps[];
  itemGroups?: {
    [key in SlashMenuItemType]?: string;
  };
  showGroups?: boolean;
}
