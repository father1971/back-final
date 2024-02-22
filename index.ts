import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from 'redis';

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
app.get('/', function (request, response) {
  response.send('Я живой!');
});
const port = process.env.PORT;
app.listen(port, function () {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
