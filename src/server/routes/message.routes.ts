import { Router } from 'express';
import Amqp from '../../common/amqp';

const message = Router();

message.post('/', async (req, res) => {
  const amqp = new Amqp();

  amqp.publish('teste', 'teste.log', req.body);

  return res.json({
    message: 'Message published!',
    data: req.body,
  });
});

message.post('/random/:qtd', async (req, res) => {
  const amqp = new Amqp();
  const { qtd = 1 } = req.params;

  for (let i = 1; i <= qtd; i++) {
    amqp.publish('teste', 'teste.log', {
      message: `teste ${i}`,
    });
  }

  return res.json({
    message: `Message published ${qtd} times`,
  });
});

export default message;
