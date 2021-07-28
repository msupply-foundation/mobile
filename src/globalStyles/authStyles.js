/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { BACKGROUND_COLOR, SUSSOL_ORANGE, WARMER_GREY } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const authStyles = {
  authFormModal: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'flex-start',
  },
  authFormTextInputStyle: {
    flex: 1,
    marginHorizontal: 60,
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
  },
  authFormContainer: {
    marginHorizontal: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    borderColor: WARMER_GREY,
    borderWidth: 1,
    borderRadius: 1,
  },
  authFormButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  authFormButtonContainer: {
    alignSelf: 'stretch',
  },
  authFormButtonText: {
    color: 'white',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    fontSize: 22,
    marginVertical: 15,
  },
  authFormLogo: {
    marginTop: 30,
    marginBottom: 60,
  },
  authWindowButtonText: {
    fontFamily: APP_FONT_FAMILY,
    color: WARMER_GREY,
  },
  loginButton: {
    marginTop: 60,
  },
};

export default authStyles;
