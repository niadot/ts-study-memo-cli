export interface Memo {
    id: string;
    url: string;
    title: string;
    description?: string;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface MemoData {
    version: string;
    memos: Memo[];
}
