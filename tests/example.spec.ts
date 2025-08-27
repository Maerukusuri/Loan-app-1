import { test, expect, Locator, Page } from '@playwright/test';

class LoanPage {
  readonly page: Page;

  readonly applyButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginContinueButton: Locator;
  readonly finalContinueButton: Locator;
  readonly finalOkButton: Locator;
  readonly amountField: Locator;
  readonly amountError: Locator;
  readonly periodOptions: Locator;
  readonly imageButton1: Locator;
  readonly imageButton2: Locator;

  constructor(page: Page) {
    this.page = page;
    this.applyButton = page.getByTestId('id-small-loan-calculator-field-apply');
    this.usernameInput = page.getByTestId('login-popup-username-input');
    this.passwordInput = page.getByTestId('login-popup-password-input');
    this.loginContinueButton = page.getByTestId('login-popup-continue-button');
    this.finalContinueButton = page.getByTestId('final-page-continue-button');
    this.finalOkButton = page.getByTestId('final-page-success-ok-button');
    this.amountField = page.getByTestId('id-small-loan-calculator-field-amount');
    this.amountError = page.getByTestId('id-small-loan-calculator-field-error');
    this.periodOptions = page.locator('select option');
    this.imageButton1 = page.getByTestId('id-image-element-button-image-1');
    this.imageButton2 = page.getByTestId('id-image-element-button-image-2');
  }

  async goto() {
    await this.page.goto('https://loan-app.tallinn-learning.ee/small-loan');
  }

  async clickApply() {
    await this.applyButton.click();
  }

  async fillLogin(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async clickContinue() {
    await this.loginContinueButton.click();
  }

  async clickFinalContinue() {
    await this.finalContinueButton.click();
  }

  async setAmount(amount: string) {
    await this.amountField.fill(amount);
  }

  async clickImageButton1() {
    await this.imageButton1.click();
  }

  async clickImageButton2() {
    await this.imageButton2.click();
  }

  async getPeriodOptionsCount() {
    return this.periodOptions.count();
  }

  async getAmountValue() {
    return this.amountField.inputValue();
  }
}

let loanPage: LoanPage;

test.describe('Loan Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    loanPage = new LoanPage(page);
    await loanPage.goto();
  });

  test('Continue button is disabled', async () => {
    await loanPage.clickApply();
    await expect(loanPage.loginContinueButton).toBeDisabled();
  });

  // убрали тест "Close button is active"

  test('Continue button is available after login', async () => {
    await loanPage.clickApply();
    await loanPage.fillLogin('test', 'test_pass');
    await loanPage.clickContinue();
    await loanPage.clickFinalContinue();
    await expect(loanPage.finalOkButton).toBeVisible();
  });

  test('Success flow', async () => {
    await loanPage.clickApply();
    await loanPage.fillLogin('test', 'test');
    await loanPage.clickContinue();
    await loanPage.clickFinalContinue();
    await expect(loanPage.finalOkButton).toBeVisible();
  });

  test('Loan amount out of boundaries', async () => {
    await loanPage.clickApply();
    await loanPage.setAmount('499');
    await expect(loanPage.amountError).toBeVisible();

    await loanPage.setAmount('5000');
    await expect(loanPage.amountError).toBeHidden();

    await loanPage.setAmount('10001');
    await expect(loanPage.amountError).toBeVisible();
  });

  test('Verify scroll action', async () => {
    await loanPage.clickImageButton1();
    await expect(loanPage.amountField).toBeInViewport();
    await loanPage.clickImageButton2();
    await expect(loanPage.amountField).toBeInViewport();
  });

  test('Verify period options count', async () => {
    const count = await loanPage.getPeriodOptionsCount();
    expect(count).toBe(7);
  });

  test('Verify amount and periods match calculator', async () => {
    const amount = await loanPage.getAmountValue();
    expect(amount).toBe('500');
    const periodCount = await loanPage.getPeriodOptionsCount();
    expect(periodCount).toBe(7);
  });
});
