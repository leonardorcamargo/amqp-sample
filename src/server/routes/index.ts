import { Router } from 'express';
import helloWorld from './hello.routes';
import message from './message.routes';

const router = Router();

router.use('/', helloWorld);
router.use('/message', message)

export default router;
