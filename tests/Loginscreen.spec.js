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

    test('Only the creator of the blog can see Delete button', async ({ page }) => {
      await page.getByRole('button', { name: 'View' }).first().click()
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
      await page.getByRole('button', { name: 'Hide' }).click()
      await page.getByRole('button', { name: 'View' }).last().click()
      const deleteButton = await page.$('button[id="remove-button"]')
      expect(deleteButton).toBeNull()
    })

    test('Blogs are arranged based on their Likes', async ({ page }) => {
      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.getByTestId('title-input').fill('First Created')
      await page.getByTestId('author-input').fill('J.H')
      await page.getByTestId('url-input').fill('Testing Url')
      await page.getByRole('button', { name: 'Create' }).click()

      await page.waitForTimeout(200)

      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.getByTestId('title-input').fill('Second Created')
      await page.getByTestId('author-input').fill('J.H')
      await page.getByTestId('url-input').fill('Testing Url2')
      await page.getByRole('button', { name: 'Create' }).click()
      
      await page.waitForTimeout(200)

      await page.getByRole('button', { name: 'View' }).last().click()
      await page.getByRole('button', { name: 'Like' }).click()
      await page.getByRole('button', { name: 'Hide' }).click()

      await page.waitForTimeout(200)

      const blogTitles = await page.$$eval('.blog-container strong', blogs => blogs.map(blog => blog.textContent))
      const indexOfFirstCreated = blogTitles.findIndex(title => title === 'First Created')
      expect(indexOfFirstCreated).toBe(blogTitles.length - 1)

      await page.getByRole('button', { name: 'View' }).last().click()
      await page.evaluate(() => {
        window.confirm = () => true
      })
      await page.getByRole('button', { name: 'Delete' }).click()

      await page.waitForTimeout(200)

      await page.getByRole('button', { name: 'View' }).last().click()
      await page.evaluate(() => {
        window.confirm = () => true
      })
      await page.getByRole('button', { name: 'Delete' }).click()
    })
  })
})