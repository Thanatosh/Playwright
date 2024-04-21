const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
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

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('textbox').first().fill('JoHo')
      await page.getByRole('textbox').last().fill('salasana')
      await page.getByRole('button', { name: 'Login' }).click()
    })
  
    test('User can create new blog and delete it', async ({ page }) => {
      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.getByTestId('title-input').fill('Testing blog')
      await page.getByTestId('author-input').fill('J.H')
      await page.getByTestId('url-input').fill('Testing Url')
      await page.getByRole('button', { name: 'Create' }).click()
      
      await expect(page.getByText('Blog "Testing blog" added')).toBeVisible()
      await expect(page.getByText('Testing blog by J.H')).toBeVisible()
      
      await page.getByRole('button', { name: 'View' }).last().click()
      await page.evaluate(() => {
        window.confirm = () => true
      })
      await page.getByRole('button', { name: 'Delete' }).click()
    })

    test('User is able to like the post', async ({ page }) => {
      await page.getByRole('button', { name: 'View' }).last().click()
      const initialLikesText = await page.$eval('.likes', element => element.innerText)
      const initialLikes = parseInt(initialLikesText)

      await page.getByRole('button', { name: 'Like' }).click()
      const updatedLikesText = await page.$eval('.likes', element => element.innerText)
      const updatedLikes = parseInt(updatedLikesText)

      expect(updatedLikes).toBe(initialLikes + 1)
    })
  })
})