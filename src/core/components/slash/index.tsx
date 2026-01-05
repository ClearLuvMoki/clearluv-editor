import clsx from "clsx";
import { type ReactElement, useMemo } from "react";
import { Separator } from "react-aria-components";
import { useSlashDropdownMenu } from "@/components/slash/use-slash-dropdown";
import { SuggestionMenu } from "@/components/suggestion";
import type { SuggestionItemProps } from "@/components/suggestion/types";
import { filterSuggestionItems } from "@/components/suggestion/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { SlashMenuConfigProps, SlashProps } from "./types";

export function Slash(props: SlashProps) {
  const { config, ...restProps } = props;
  const { getSlashMenuItems } = useSlashDropdownMenu({});

  return (
    <SuggestionMenu
      char="/"
      pluginKey="slashDropdownMenu"
      decorationClass="editor-slash-decoration rounded-xs"
      decorationContent="Filter..."
      items={({ query, editor }) => filterSuggestionItems(getSlashMenuItems(editor), query)}
      {...restProps}
    >
      {(props) => <List {...props} config={config} />}
    </SuggestionMenu>
  );
}

function SuggestItem({
  item,
  isSelected,
  onSelect,
}: {
  item: SuggestionItemProps;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const BadgeIcon = item.badge;

  return (
    <div
      className={clsx(
        "hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        {
          "bg-accent": isSelected,
        },
      )}
      onClick={() => onSelect?.()}
    >
      {BadgeIcon && <BadgeIcon />}
      <div>{item.title}</div>
    </div>
  );
}

const List = ({
  items,
  selectedIndex,
  onSelect,
  config,
}: any & { config?: SlashMenuConfigProps }) => {
  const renderedItems = useMemo(() => {
    const rendered: ReactElement[] = [];
    const showGroups = config?.showGroups !== false;

    if (!showGroups) {
      items.forEach((item, index) => {
        rendered.push(
          <SuggestItem
            key={`slash-item-${index}-${item.title}`}
            item={item}
            isSelected={index === selectedIndex}
            onSelect={() => onSelect(item)}
          />,
        );
      });
      return rendered;
    }

    const groups: {
      [groupLabel: string]: { items: SuggestionItemProps[]; indices: number[] };
    } = {};

    items.forEach((item, index) => {
      const groupLabel = item.group || "";
      if (!groups[groupLabel]) {
        groups[groupLabel] = { items: [], indices: [] };
      }
      groups[groupLabel].items.push(item);
      groups[groupLabel].indices.push(index);
    });
    console.log(groups, "groups");

    Object.entries(groups).forEach(([groupLabel, groupData], groupIndex) => {
      if (groupIndex > 0) {
        rendered.push(
          <Separator key={`separator-${String(groupIndex)}`} orientation="horizontal" />,
        );
      }

      const groupItems = groupData.items.map((item, itemIndex) => {
        const originalIndex = groupData.indices[itemIndex];
        return (
          <SuggestItem
            key={`slash-item-${originalIndex}-${item.title}`}
            item={item}
            isSelected={originalIndex === selectedIndex}
            onSelect={() => onSelect(item)}
          />
        );
      });

      if (groupLabel) {
        rendered.push(
          <div key={`slash-group-${groupIndex}-${groupLabel}`}>
            <span className="text-gray-400 text-xs px-2">{groupLabel}</span>
            <div>{groupItems}</div>
          </div>,
        );
      } else {
        rendered.push(...groupItems);
      }
    });

    return rendered;
  }, [items, selectedIndex, onSelect, config?.showGroups]);

  if (!renderedItems.length) {
    return null;
  }

  return (
    <Card
      className="p-1"
      style={{
        maxHeight: "var(--suggestion-menu-max-height)",
      }}
    >
      <CardContent className="w-50 p-0 select-none">{renderedItems}</CardContent>
    </Card>
  );
};
