/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { StyleSheet } from 'react-native';

import { appStyles, COMPONENT_HEIGHT } from './appStyles';
import { authStyles } from './authStyles';
import { buttonStyles } from './buttonStyles';
import { confirmModalStyles } from './confirmModalStyles';
import { dataTableStyles, dataTableColors } from './dataTableStyles';
import { loadingIndicatorStyles } from './loadingIndicatorStyles';
import { modalStyles } from './modalStyles';
import { navigationStyles } from './navigationStyles';
import {
  pageStyles,
  expansionPageStyles,
  // TODO: fix missing export.
  // PAGE_TOP_LEFT_WIDTH.
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
} from './pageStyles';
import { toggleBarStyles } from './toggleBarStyles';

export {
  BACKGROUND_COLOR,
  BLUE_WHITE,
  DARK_GREY,
  DARKER_GREY,
  FINALISE_GREEN,
  FINALISED_RED,
  GREY,
  LIGHT_GREY,
  ROW_BLUE,
  SHADOW_BORDER,
  SOFT_RED,
  SUSSOL_ORANGE,
  WARM_GREY,
  WARMER_GREY,
} from './colors';

export { APP_FONT_FAMILY } from './fonts';

export { textStyles } from './textStyles';

export {
  COMPONENT_HEIGHT,
  dataTableStyles,
  dataTableColors,
  pageStyles,
  expansionPageStyles,
  // TODO: fix missing export.
  // PAGE_TOP_LEFT_WIDTH
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
};

export default StyleSheet.create({
  ...appStyles,
  ...authStyles,
  ...buttonStyles,
  ...confirmModalStyles,
  ...loadingIndicatorStyles,
  ...modalStyles,
  ...navigationStyles,
  ...pageStyles,
  ...toggleBarStyles,
});
