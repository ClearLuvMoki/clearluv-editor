import { isEqual } from "@react-hookz/deep-equal";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CodeBlockNode = memo(
  ({ node: { attrs }, updateAttributes, extension }: any) => {
    const { language: defaultLanguage } = attrs;
    const [value, setValue] = useState("auto");
    const LanguageList: string[] = useMemo(
      () => extension.options.lowlight.listLanguages().concat(["auto"]),
      [extension],
    );
    const [_ref, setRef] = useState<HTMLDivElement | null>(null);
    const container = useMemo(() => _ref, [_ref]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      defaultLanguage && setValue(defaultLanguage);
    }, [defaultLanguage]);

    return (
      <NodeViewWrapper>
        <div ref={setRef} className="border border-gray-100 rounded-lg bg-gray-50 my-2">
          <pre style={{ marginTop: "6px 0 0 0 " }}>
            <Suspense fallback={<span>loading...</span>}>
              {container && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      {value
                        ? LanguageList.find((language) => language === value)
                        : "Select language..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" container={container}>
                    <Command>
                      <CommandInput placeholder="Search language..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {LanguageList.map((language) => (
                            <CommandItem
                              key={language}
                              value={language}
                              onSelect={(currentValue) => {
                                setValue(currentValue === value ? "" : currentValue);
                                updateAttributes(currentValue === value ? "" : currentValue);
                                setOpen(false);
                              }}
                            >
                              {language}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === language ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </Suspense>
            <NodeViewContent style={{ marginTop: 10, padding: 14 }} />
          </pre>
        </div>
      </NodeViewWrapper>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  },
);

export default CodeBlockNode;
