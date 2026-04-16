import { test, expect } from '@playwright/test';

const USER_EMAIL = 'user@filrouge.com';
const USER_PASSWORD = 'user123';
const ADMIN_EMAIL = 'admin@filrouge.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Authentification', () => {
  test('login avec identifiants valides', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page.getByLabel('Mot de passe').fill(USER_PASSWORD);
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    // Redirigé vers home après login
    await expect(page).toHaveURL('/', { timeout: 8_000 });
    // Nom d'utilisateur visible dans la navbar
    await expect(page.getByText('Utilisateur')).toBeVisible();
  });

  test('login avec mauvais mot de passe → erreur', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 });
  });

  test('accès profil après login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page.getByLabel('Mot de passe').fill(USER_PASSWORD);
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await page.goto('/profil');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(USER_EMAIL)).toBeVisible();
  });

  test('déconnexion fonctionne', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page.getByLabel('Mot de passe').fill(USER_PASSWORD);
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 8_000 });
    await page.getByRole('button', { name: /déconnexion|logout/i }).click();
    // Après déconnexion le bouton connexion réapparaît
    await expect(page.getByRole('link', { name: /connexion|login/i })).toBeVisible();
  });

  test('admin voit le lien Admin dans la navbar', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Mot de passe').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await expect(page.getByRole('link', { name: /admin/i })).toBeVisible({ timeout: 8_000 });
  });
});
