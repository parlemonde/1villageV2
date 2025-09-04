import { FaceIcon } from '@radix-ui/react-icons';
import { Popover, Toolbar as RadixToolbar } from 'radix-ui';

import styles from './emoji-button.module.css';

const EMOJIS = [
    '😀',
    '😁',
    '😂',
    '😃',
    '😉',
    '😋',
    '😎',
    '😍',
    '😗',
    '🤗',
    '🤔',
    '😣',
    '😫',
    '😴',
    '😌',
    '🤓',
    '😛',
    '😜',
    '😠',
    '😇',
    '😷',
    '😈',
    '👻',
    '😺',
    '😸',
    '😹',
    '😻',
    '😼',
    '😽',
    '🙀',
    '🙈',
    '🙉',
    '🙊',
    '👼',
    '👮',
    '🕵',
    '💂',
    '👳',
    '🎅',
    '👸',
    '👰',
    '👲',
    '🙍',
    '🙇',
    '🚶',
    '🏃',
    '💃',
    '⛷',
    '🏂',
    '🏌',
    '🏄',
    '🚣',
    '🏊',
    '⛹',
    '🏋',
    '🚴',
    '👫',
    '💪',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '🖖',
    '🤘',
    '🖐',
    '👌',
    '👍',
    '👎',
    '✊',
    '👊',
    '👏',
    '🙌',
    '🙏',
    '🐵',
    '🐶',
    '🐇',
    '🐥',
    '🐸',
    '🐌',
    '🐛',
    '🐜',
    '🐝',
    '🍉',
    '🍄',
    '🍔',
    '🍤',
    '🍨',
    '🍪',
    '🎂',
    '🍰',
    '🍾',
    '🍷',
    '🍸',
    '🍺',
    '🌍',
    '🚑',
    '⏰',
    '🌙',
    '🌝',
    '🌞',
    '⭐',
    '🌟',
    '🌠',
    '🌨',
    '🌩',
    '⛄',
    '🔥',
    '🎄',
    '🎈',
    '🎉',
    '🎊',
    '🎁',
    '🎗',
    '🏀',
    '🏈',
    '🎲',
    '🔇',
    '🔈',
    '📣',
    '🔔',
    '🎵',
    '🎷',
    '💰',
    '🖊',
    '📅',
    '✅',
    '❎',
    '💯',
];

interface EmojiButtonProps {
    className?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onInsertEmoji: (emoji: string) => void;
}

export const EmojiButton = ({ className, isOpen, setIsOpen, onInsertEmoji }: EmojiButtonProps) => {
    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <RadixToolbar.Button className={className}>
                    <FaceIcon width={24} height={24} />
                </RadixToolbar.Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} sideOffset={8}>
                    {EMOJIS.map((emoji) => (
                        <button
                            className={styles.popoverEmojiButton}
                            key={emoji}
                            onClick={() => {
                                onInsertEmoji(emoji);
                                setIsOpen(false);
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
