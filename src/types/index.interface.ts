export interface Tag {
    type: 'node' | 'content';
    tag?: string;
    content?: string;
    endIndex?: number;
    $for?: string;
    $if?: string;
    $style?: string;
    $class?: string;
    $disabledFor?: boolean;
}