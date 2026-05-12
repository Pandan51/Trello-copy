export type Task = {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: string;
  completed: boolean;
  isGhost?: boolean;
  isDragged?: boolean;
};

export type TaskListType = {
  id: string;
  title: string;
  color?: string;
};
