export type Task = {
  id: string;
  name: string;
  completed: boolean;
  deadline: string;
};

export type TaskBody = {
  name: string;
  completed: boolean;
  deadline: string;
};
