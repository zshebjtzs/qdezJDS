import { getUserList } from '../services/userListService.js';

export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const q = req.query.q || '';

    const result = await getUserList(page, pageSize, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
};