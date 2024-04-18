const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Joni Hostikka',
        username: 'JoHo',
        password: 'salasana'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText('Login Screen')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('Succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('JoHo')
      await page.getByRole('textbox').last().fill('salasana')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Logged in as Joni Hostikka')).toBeVisible()
    })

    test('Fails with wrong credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('JoHo')
      await page.getByRole('textbox').last().fill('fail')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
    })
  })
})