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

  test('can open mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000')

    await expect(page.getByRole('banner').getByRole('link', { name: /web3people/i })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Interviews', exact: true })).toBeHidden()

    await page.getByRole('button', { name: 'Open navigation menu' }).click()

    const mobileNav = page.getByRole('banner').getByRole('navigation')

    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: 'Search', exact: true })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: 'Interviews', exact: true })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: 'People', exact: true })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: 'Board', exact: true })).toBeVisible()
  })
})
