export interface TaskInterface {
  id?:string;
  title: string;
  description: string;
  category: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string[];
  subtasks?: { title: string; done: boolean }[];
}