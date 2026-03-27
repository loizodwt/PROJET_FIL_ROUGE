const categoryService = require('../services/category.service');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, slug } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'name est requis' });
    }
    const computedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await categoryService.create({ name: String(name).trim(), slug: computedSlug });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { name, slug } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (slug !== undefined) data.slug = slug;
    const category = await categoryService.update(req.params.id, data);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
