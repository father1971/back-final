import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from 'redis';
import { Task } from './commonTypes';

dotenv.config();
const app = express();

const redisClient = createClient();
const connection = redisClient.connect();

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

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get('/', function (request, response) {
  response.send('Я живой!');
});
const port = process.env.PORT;
app.listen(port, function () {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
