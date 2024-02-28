import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from 'redis';
import { Task } from './commonTypes';
import { uuid } from 'uuidv4';

dotenv.config();
const app = express();

const redisClient = createClient();
const connection = redisClient.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/tasks/', async function (request, response) {
  const redis = await connection;
  const savedTasks = await redis.get('tasks');

  if (savedTasks === null) {
    response.send([]);
    return;
  }

  const parsedTasks: Task[] = JSON.parse(savedTasks);
  response.send(parsedTasks);
});

app.post('/tasks/', async function (request, response) {
  if (
    typeof request.body.name !== 'string' ||
    typeof request.body.completed !== 'boolean' ||
    typeof request.body.deadline !== 'string' ||
    isNaN(new Date(request.body.deadline).getTime())
  ) {
    response.send(400);
    return;
  }

  const task: Task = {
    id: uuid(),
    name: request.body.name,
    completed: request.body.completed,
    deadline: request.body.deadline,
  };

  const redis = await connection;
  const savedTasks = await redis.get('tasks');

  if (savedTasks === null) {
    const taskList = [task];
    await redis.set('tasks', JSON.stringify(taskList));

    response.send(taskList);
    return;
  }
  const parsedTasks: Task[] = JSON.parse(savedTasks);
  parsedTasks.push(task);
  await redis.set('tasks', JSON.stringify(parsedTasks));

  response.send(parsedTasks);
});

app.delete('/tasks/:id', async function (request, response) {
  const id = request.params.id;

  const redis = await connection;
  const savedTasks = await redis.get('tasks');

  if (savedTasks === null) {
    response.send(404);
    return;
  }

  const parsedTasks: Task[] = JSON.parse(savedTasks);

  const taskToDelete = parsedTasks.find(function (task) {
    if (task.id === id) {
      return true;
    } else {
      return false;
    }
  });

  if (taskToDelete === undefined) {
    response.send(404);
    return;
  }

  const keptTasks = parsedTasks.filter(function (task) {
    if (task.id !== id) {
      return true;
    } else {
      return false;
    }
  });

  await redis.set('tasks', JSON.stringify(keptTasks));
  response.send(keptTasks);
});

app.get('/', function (request, response) {
  response.send('Я живой!');
});
const port = process.env.PORT;
app.listen(port, function () {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
