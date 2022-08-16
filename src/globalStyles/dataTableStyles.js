/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import {
  BACKGROUND_COLOR,
  BLUE_WHITE,
  DARK_GREY,
  LIGHT_GREY,
  SUSSOL_ORANGE,
  WARM_GREY,
} from './colors';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from './fonts';

export const dataTableColors = {
  checkableCellDisabled: LIGHT_GREY,
  checkableCellChecked: SUSSOL_ORANGE,
  checkableCellUnchecked: WARM_GREY,
  editableCellUnderline: WARM_GREY,
};

export const dataTableStyles = {
  cellContainer: {
    left: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'left',
    },
    right: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'right',
    },
    center: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
    },
  },
  warningCellContainer: {
    left: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'left',
      backgroundColor: 'rgba(233,92,48, 0.5)',
    },
    right: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'right',
      backgroundColor: 'rgba(233,92,48, 0.5)',
    },
    center: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: 'rgba(233,92,48, 0.5)',
    },
  },
  errorCellContainer: {
    left: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'left',
      backgroundColor: 'rgba(233,92,48, 0.75)',
    },
    right: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'right',
      backgroundColor: 'rgba(233,92,48, 0.75)',
    },
    center: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: 'rgba(233,92,48, 0.75)',
    },
  },

  cellText: {
    left: {
      marginLeft: 20,
      textAlign: 'left',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    right: {
      marginRight: 10,
      textAlign: 'right',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    center: {
      textAlign: 'center',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
  },
  editableCellUnfocused: {
    right: {
      textAlign: 'right',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    center: {
      textAlign: 'center',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    left: {
      textAlign: 'left',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
  },
  editableCellText: {
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: DARK_GREY,
    marginRight: 20,
  },
  editableCellTextView: {
    borderBottomColor: '#cbcbcb',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    width: '88%',
    maxHeight: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 20,
  },
  touchableCellContainer: {
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },
  alternateRow: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },
  selectedRow: {
    backgroundColor: LIGHT_GREY,
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },

  headerRow: {
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  emptyRow: {
    backgroundColor: 'white',
    height: 250,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCells: {
    left: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    right: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    center: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  expiryBatchTextView: {
    borderBottomColor: '#cbcbcb',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    width: '88%',
    maxHeight: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  expiryBatchView: {
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
  },
  expiryBatchText: {
    textAlign: 'center',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: DARK_GREY,
  },
  expiryBatchPlaceholderText: {
    textAlign: 'center',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: LIGHT_GREY,
  },
  dropDownCellTextContainer: { flex: 2, justfyContent: 'center', alignItems: 'center' },
  dropDownCellIconContainer: { flex: 1, justfyContent: 'center', alignItems: 'center' },
  dropDownFont: {
    marginLeft: 20,
    textAlign: 'left',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: DARK_GREY,
  },
  dropDownPlaceholderFont: {
    textAlign: 'center',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: LIGHT_GREY,
  },
  iconCell: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
  },
};

export default dataTableStyles;
