import { Router } from 'express';
import contactRoutes from './contact/contact.route';

const router = Router();

router.use('/contact', contactRoutes);

router.use('/', async (req, res, next) => {
  return res.send('Endpoint hit');
});


export default router;
