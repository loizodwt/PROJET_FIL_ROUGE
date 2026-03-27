const prisma = require('../lib/prisma');

async function getAll() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function create({ name, slug }) {
  return prisma.category.create({ data: { name, slug } });
}

async function update(id, data) {
  return prisma.category.update({ where: { id: parseInt(id) }, data });
}

async function deleteCategory(id) {
  await prisma.category.delete({ where: { id: parseInt(id) } });
}

module.exports = { getAll, create, update, deleteCategory };
