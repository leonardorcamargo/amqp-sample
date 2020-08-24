import 'express-async-errors';
import express, {
  Express,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from 'express';
import routes from './routes';

class HttpServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(routes);
    this.app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
      return res.status(500).json({
        status: 'error',
        message: err.message,
      });
    });
  }

  public start(port = process.env.PORT || 3000): void {
    this.app
      .listen(port, () => {
        console.log(`HttpServer started on port ${port}`);
      })
      .on('error', err => {
        console.error(err);
        process.exit(1);
      });
  }
}

export default HttpServer;
