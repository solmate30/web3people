import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Web3People/)
    await expect(
      page.getByRole('banner').getByRole('link', { name: /web3people/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Interviews', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'People', exact: true }),
    ).toBeVisible()
  })
})
