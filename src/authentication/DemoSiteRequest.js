/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable class-methods-use-this */

import { validationStrings } from '../localization/index';

const DEMO_SITE_URL = 'https://demo.msupply.org/api/v4/mobile/requestDemo';
export class DemoSiteRequest {
  async createActivationURL(username, email, password, repeatPassword) {
    this.validateFields(username, email, password, repeatPassword);

    // eslint-disable-next-line no-undef
    const response = await fetch(DEMO_SITE_URL, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.error);
    return responseJson;
  }

  validateFields(username, email, password, repeatPassword) {
    // Client side validation
    if (email.length === 0) throw new Error(validationStrings.email_required);
    if (!this.validateEmail(email)) {
      throw new Error(validationStrings.email_valid);
    }
    if (username.length === 0) {
      throw new Error(validationStrings.username_required);
    }
    if (password.length === 0) {
      throw new Error(validationStrings.password_required);
    }
    if (repeatPassword.length === 0) {
      throw new Error(validationStrings.repeat_password_required);
    }
    if (password !== repeatPassword) {
      throw new Error(validationStrings.password_match_repeat);
    }
    if (this.textLengthInvalid(password)) {
      throw new Error(validationStrings.password_length_invalid);
    }
    if (this.textContainsSpaces(password)) {
      throw new Error(validationStrings.password_contains_spaces);
    }
  }

  // Validation methods.
  // TODO: Could be extracted to a helper file to be used elsewhere.
  // eslint-disable-next-line class-methods-use-this
  validateEmail(text) {
    const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  }

  // eslint-disable-next-line class-methods-use-this
  textContainsSpaces(text) {
    const reg = /^\S*$/;
    return !reg.test(text);
  }

  // eslint-disable-next-line class-methods-use-this
  textLengthInvalid(text, lessThen = 8, greaterThen = 32) {
    return text.length < lessThen || text.length > greaterThen;
  }
}

export default DemoSiteRequest;
