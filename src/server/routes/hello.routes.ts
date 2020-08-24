import { Router } from 'express';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  return res.json({
    message: 'Hello World!'
  })
});

export default helloRouter;