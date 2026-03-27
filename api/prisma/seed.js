const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'action' },
      update: {},
      create: { name: 'Action', slug: 'action' },
    }),
    prisma.category.upsert({
      where: { slug: 'comedie' },
      update: {},
      create: { name: 'Comédie', slug: 'comedie' },
    }),
    prisma.category.upsert({
      where: { slug: 'drame' },
      update: {},
      create: { name: 'Drame', slug: 'drame' },
    }),
    prisma.category.upsert({
      where: { slug: 'sci-fi' },
      update: {},
      create: { name: 'Science-Fiction', slug: 'sci-fi' },
    }),
    prisma.category.upsert({
      where: { slug: 'thriller' },
      update: {},
      create: { name: 'Thriller', slug: 'thriller' },
    }),
  ]);

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@filrouge.com' },
    update: {},
    create: {
      email: 'admin@filrouge.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // Sample user
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@filrouge.com' },
    update: {},
    create: {
      email: 'user@filrouge.com',
      password: userPassword,
      name: 'Utilisateur',
      role: 'USER',
    },
  });

  // Sample films
  const films = [
    { title: 'Inception', synopsis: 'Un voleur qui s\'infiltre dans les rêves.', releaseYear: 2010, director: 'Christopher Nolan', categoryId: categories[3].id },
    { title: 'The Dark Knight', synopsis: 'Batman affronte le Joker à Gotham City.', releaseYear: 2008, director: 'Christopher Nolan', categoryId: categories[0].id },
    { title: 'Interstellar', synopsis: 'Des astronautes voyagent à travers un trou de ver.', releaseYear: 2014, director: 'Christopher Nolan', categoryId: categories[3].id },
    { title: 'Le Fabuleux Destin d\'Amélie Poulain', synopsis: 'Une jeune femme décide de changer la vie des autres.', releaseYear: 2001, director: 'Jean-Pierre Jeunet', categoryId: categories[1].id },
    { title: 'Parasite', synopsis: 'Une famille pauvre s\'infiltre dans la vie d\'une famille riche.', releaseYear: 2019, director: 'Bong Joon-ho', categoryId: categories[2].id },
  ];

  for (const film of films) {
    await prisma.film.create({ data: film });
  }

  console.log('Seed terminé ✓');
  console.log('Admin: admin@filrouge.com / admin123');
  console.log('User:  user@filrouge.com / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
