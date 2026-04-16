import { test, expect } from '@playwright/test';

test.describe('Catalogue public', () => {
  test('la page home charge et affiche des films', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Attend que la grille de films soit visible
    await expect(page.locator('a[aria-label^="Voir"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('la recherche filtre les films', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('improbable_xyz_999');
    // Attend le résultat vide
    await expect(page.getByText(/aucun film/i)).toBeVisible({ timeout: 8_000 });
  });

  test('la recherche par titre fonctionne', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Inception');
    // Au moins un film doit apparaître
    await expect(page.locator('a[aria-label^="Voir"]').first()).toBeVisible({ timeout: 8_000 });
  });

  test("l'URL se met à jour avec les filtres", async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('nolan');
    await expect(page).toHaveURL(/search=nolan/);
  });

  test('le détail d\'un film est accessible', async ({ page }) => {
    await page.goto('/');
    // Clic sur le premier film
    const firstFilm = page.locator('a[aria-label^="Voir"]').first();
    await firstFilm.waitFor({ timeout: 10_000 });
    const filmName = await firstFilm.getAttribute('aria-label');
    await firstFilm.click();
    // On doit être sur /films/:id
    await expect(page).toHaveURL(/\/films\/\d+/);
    await expect(page.locator('h1')).toBeVisible();
  });
});
