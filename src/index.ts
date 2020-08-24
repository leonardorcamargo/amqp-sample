import { HttpServer, AmqpServer } from './server';

new AmqpServer().start();
new HttpServer().start();
