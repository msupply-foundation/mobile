/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { SHADOW_BORDER, BLUE_WHITE, BACKGROUND_COLOR } from './colors';

export const PAGE_CONTENT_PADDING_HORIZONTAL = 20;
export const FULL_SCREEN_MODAL_MARGIN = 1;

export const pageStyles = {
  pageContentContainer: {
    flex: 1,
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: SHADOW_BORDER,
    backgroundColor: BLUE_WHITE,
  },
  pageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flex: 3,
    paddingHorizontal: 10,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  pageTopViewContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: BLUE_WHITE,
  },
};

export default pageStyles;
