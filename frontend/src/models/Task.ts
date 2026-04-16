
export class Task {
    id: string;
    parentId: string
    title: string
    description: string

    constructor(id: string, parentId: string, title: string, description: string) {
        this.id = id;
        this.parentId = parentId;
        this.title = title;
        this.description = description;
    }
}

