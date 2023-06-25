import React from 'react';
import {Popover} from "@arco-design/web-react";
import Button from "../../components/Button";
import EmojiPicker from 'emoji-picker-react';
import {Editor} from "@tiptap/core";
import {BsEmojiLaughing} from "react-icons/bs"
import deepEqual from "deep-equal";

type SuperscriptMenuProps = {
    editor: Editor
}

const EmojiMenu = React.memo(({editor}: SuperscriptMenuProps) => {


    return (
        <Popover
            unmountOnExit={false}
            triggerProps={{
                style: {
                    width: 380
                }
            }}
            trigger='click'
            content={<EmojiPicker
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                onEmojiClick={(emojiValue) => {
                    const {selection} = editor.state;
                    const {$anchor} = selection;
                    editor.chain().insertContentAt($anchor.pos, emojiValue?.emoji).run();
                }}
            />}
        >
            <Button
                type={"normal"}
            >
                <BsEmojiLaughing/>
            </Button>
        </Popover>
    );
}, (prevProps, nextProps) => {
    return deepEqual(prevProps, nextProps);
});

export default EmojiMenu;
