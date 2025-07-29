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

export type typeIsNull = string | number | boolean | null | undefined

export interface ISectoralTable {
    address: string
    appletQr: string
    hasChildren?: boolean
    cldOrgDepts?: ISectoralTable[]
    deptAlias: string
    initialPinyin: string
    deptCode: string
    deptName: string
    email: string
    leader: string
    mark: string
    officialQr: string
    orgCode: string
    parentCode: string
    phone: string
    pk: string
    sort: number
    status: number
}
