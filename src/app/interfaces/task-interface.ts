export interface TaskInterface {
  id?:string;
  status: 'todo' | 'inProgress' | 'feedback' | 'done';
  title: string;
  description: string;
  category: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string[];
  subtasks?: { title: string; done: boolean }[];
}
