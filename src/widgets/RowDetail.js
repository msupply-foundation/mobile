/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-native-modalbox';

import { ItemDetails } from './bottomModals';
import { CloseIcon } from './icons';
import { RowDetailActions, ROW_DETAIL_KEYS } from '../actions/RowDetailActions';
import { SupplierRequisitionItemDetails } from './SupplierRequisitionItemDetail';

import { DARKER_GREY } from '../globalStyles';
import { selectRowDetailIsOpen } from '../selectors/rowDetail';
import { CustomerRequisitionItemDetails } from './CustomerRequisitionItemDetail';
import { useKeyboard } from '../hooks';

/**
 * Container component for a presentation component that will display
 * details for a row.
 */
export const RowDetailComponent = ({
  detailKey,
  rowData,
  isOpen,
  onClose,
  swipeToClose,
  backdropPressToClose,
  position,
  backdrop,
  modalStyle,
  headerRowStyle,
  containerStyle,
  dismissKeyboardOnOpen,
  dismissOnKeyboardOpen,
}) => {
  const { visible: keyboardIsOpen } = useKeyboard();

  // This component renders at the bottom of the screen. Dismiss the keyboard when rendering
  // so the full screen isn't covered by keyboard and this modal.
  React.useEffect(() => {
    if (isOpen && dismissKeyboardOnOpen) Keyboard.dismiss();
  }, [isOpen]);

  // Add/removing a listener on mounting/unmounting which will hide this component when the
  // keyboard shows.
  React.useEffect(() => {
    if (dismissOnKeyboardOpen) {
      Keyboard.addListener('keyboardDidShow', onClose);
      return () => Keyboard.removeListener('keyboardDidShow', onClose);
    }
    return null;
  }, [dismissOnKeyboardOpen]);

  const getDetailComponent = () => {
    switch (detailKey) {
      case ROW_DETAIL_KEYS.ITEM_DETAIL:
        return <ItemDetails item={rowData} />;
      case ROW_DETAIL_KEYS.SUPPLIER_REQUISITION_ITEM_DETAIL:
        return <SupplierRequisitionItemDetails item={rowData} />;
      case ROW_DETAIL_KEYS.CUSTOMER_REQUISITION_ITEM_DETAIL:
        return <CustomerRequisitionItemDetails item={rowData} />;
      default:
        return null;
    }
  };

  return (
    !keyboardIsOpen && (
      <Modal
        isOpen={isOpen}
        swipeToClose={swipeToClose}
        backdropPressToClose={backdropPressToClose}
        position={position}
        backdrop={backdrop}
        style={modalStyle}
      >
        <View style={headerRowStyle}>
          <TouchableOpacity onPress={onClose}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <View style={containerStyle}>{getDetailComponent()}</View>
      </Modal>
    )
  );
};

const localStyles = StyleSheet.create({
  modal: { backgroundColor: 'transparent', height: 250 },
  container: {
    height: 250,
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: DARKER_GREY,
  },
  headerRow: {
    backgroundColor: DARKER_GREY,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 20,
    marginLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
  },
});

RowDetailComponent.defaultProps = {
  rowData: null,
  swipeToClose: false,
  backdropPressToClose: false,
  position: 'bottom',
  backdrop: false,
  dismissKeyboardOnOpen: true,
  dismissOnKeyboardOpen: true,
  modalStyle: localStyles.modal,
  headerRowStyle: localStyles.headerRow,
  containerStyle: localStyles.container,
};

RowDetailComponent.propTypes = {
  detailKey: PropTypes.string.isRequired,
  rowData: PropTypes.any,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  swipeToClose: PropTypes.bool,
  backdropPressToClose: PropTypes.bool,
  position: PropTypes.string,
  backdrop: PropTypes.bool,
  modalStyle: PropTypes.object,
  headerRowStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  dismissKeyboardOnOpen: PropTypes.bool,
  dismissOnKeyboardOpen: PropTypes.bool,
};

const mapStateToProps = state => {
  const { rowDetail } = state;
  const { detailKey, rowData } = rowDetail;
  const isOpen = selectRowDetailIsOpen(state);

  return { detailKey, rowData, isOpen };
};

const mapDispatchToProps = dispatch => {
  const onClose = () => dispatch(RowDetailActions.close());

  return { onClose };
};

export const RowDetail = connect(mapStateToProps, mapDispatchToProps)(RowDetailComponent);
