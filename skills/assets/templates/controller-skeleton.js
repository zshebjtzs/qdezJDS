// {{ FILE_PATH }}
import * as service from '../services/{{ MODULE_NAME }}.js';

/**
 * 获取列表（分页）
 */
export const getList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await service.getList(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * 获取单个详情
 */
export const getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await service.getById(id);
    if (!item) return res.status(404).json({ error: '记录不存在' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * 创建新记录
 */
export const create = async (req, res, next) => {
  try {
    const { field1, field2 } = req.body;
    if (!field1) return res.status(400).json({ error: '必填字段不能为空' });

    const id = await service.create({ field1, field2 });
    res.status(201).json({ id, message: '创建成功' });
  } catch (err) {
    next(err);
  }
};

/**
 * 更新记录
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { field1, field2 } = req.body;

    await service.update(id, { field1, field2 });
    res.json({ message: '更新成功' });
  } catch (err) {
    next(err);
  }
};

/**
 * 删除记录
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.remove(id);
    res.json({ message: '删除成功' });
  } catch (err) {
    next(err);
  }
};