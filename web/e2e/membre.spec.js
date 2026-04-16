import { test, expect } from '@playwright/test';

// Helper : se connecter avant chaque test
async function loginAs(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: /se connecter|sign in/i }).click();
  await expect(page).toHaveURL('/', { timeout: 8_000 });
}

test.describe('Espace membre', () => {
  test('ajout aux favoris depuis la fiche film', async ({ page }) => {
    await loginAs(page, 'user@filrouge.com', 'user123');
    // Va sur le premier film
    const firstFilm = page.locator('a[aria-label^="Voir"]').first();
    await firstFilm.waitFor({ timeout: 10_000 });
    await firstFilm.click();
    // Bouton favoris visible
    const favBtn = page.getByRole('button', { name: /favoris/i });
    await expect(favBtn).toBeVisible();
    await favBtn.click();
    // Toast de confirmation
    await expect(page.getByText(/favoris/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('noter un film et voir la note mise à jour', async ({ page }) => {
    await loginAs(page, 'user@filrouge.com', 'user123');
    const firstFilm = page.locator('a[aria-label^="Voir"]').first();
    await firstFilm.waitFor({ timeout: 10_000 });
    await firstFilm.click();
    // Sélectionner une note
    const noteSelect = page.getByLabel(/note de 1 à 5/i);
    await expect(noteSelect).toBeVisible();
    await noteSelect.selectOption('4');
    // Soumettre
    await page.getByRole('button', { name: /soumettre|submit/i }).click();
    // Toast de confirmation
    await expect(page.getByText(/note.*enregistrée|recorded/i)).toBeVisible({ timeout: 5_000 });
  });

  test('profil — onglets navigables', async ({ page }) => {
    await loginAs(page, 'user@filrouge.com', 'user123');
    await page.goto('/profil');
    // Cliquer sur Favoris
    await page.getByRole('tab', { name: /favoris|favorites/i }).click();
    await expect(page.getByRole('tab', { name: /favoris|favorites/i })).toHaveAttribute('aria-selected', 'true');
    // Cliquer sur Watchlist
    await page.getByRole('tab', { name: /watchlist/i }).click();
    await expect(page.getByRole('tab', { name: /watchlist/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('admin peut accéder au panel admin', async ({ page }) => {
    await loginAs(page, 'admin@filrouge.com', 'admin123');
    await page.goto('/admin');
    await expect(page.locator('h1')).toBeVisible();
    // Le formulaire d'ajout de film est visible
    await expect(page.getByPlaceholder(/Titre/i)).toBeVisible();
  });
});
