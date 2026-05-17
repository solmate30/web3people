import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/web3people/)
    await expect(page.getByRole('link', { name: /web3people/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Interviews' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'People' })).toBeVisible()
  })
})
