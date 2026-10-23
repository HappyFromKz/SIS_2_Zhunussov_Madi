import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';

test.describe('Suite 4: Contact form', () => {
  let contact: ContactPage;

  test.beforeEach(async ({ page }) => {
    contact = new ContactPage(page);
    await contact.goto();
  });

  test('TC-14 Empty contact form shows validation errors', async () => {
    await contact.submit.click();
    await expect(contact.errors.first()).toBeVisible();
    // count() does not auto-wait; poll until all validation messages are rendered
    await expect.poll(() => contact.errors.count()).toBeGreaterThanOrEqual(3);
  });

  test('TC-15 Invalid email format is rejected', async () => {
    await contact.firstName.fill('Test');
    await contact.lastName.fill('User');
    await contact.email.fill('not-an-email');
    await contact.subject.selectOption({ label: 'Webmaster' });
    await contact.message.fill('This is an automated test message that is longer than fifty characters.');
    await contact.submit.click();
    await expect(contact.errors.first()).toBeVisible();
    await expect(contact.success).toHaveCount(0);
  });

  test('TC-16 Too-short message is rejected', async () => {
    await contact.firstName.fill('Test');
    await contact.lastName.fill('User');
    await contact.email.fill('test.user@example.com');
    await contact.subject.selectOption({ label: 'Webmaster' });
    await contact.message.fill('Too short');
    await contact.submit.click();
    await expect(contact.errors.first()).toBeVisible();
  });

  test('TC-17 Valid contact form is sent successfully', async () => {
    await contact.firstName.fill('Test');
    await contact.lastName.fill('User');
    await contact.email.fill('test.user@example.com');
    await contact.subject.selectOption({ label: 'Webmaster' });
    await contact.message.fill('This is an automated test message that is longer than fifty characters.');
    await contact.submit.click();
    await expect(contact.success).toContainText('Thanks for your message');
  });
});
