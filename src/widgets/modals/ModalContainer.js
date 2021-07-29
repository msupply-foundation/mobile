/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';

import { CloseIcon } from '../icons';

import { APP_FONT_FAMILY, PAGE_CONTENT_PADDING_HORIZONTAL, DARKER_GREY } from '../../globalStyles';
import { FlexView } from '../FlexView';

/**
 * A modal that can be displayed over the page content container, rendering any children
 * about two thirds of the way up, and a cross in the top right to close.
 * @prop {Bool}             isVisible       Whether the modal is open.
 * @prop {Func}             onClose         A function to call if the close x is pressed.
 * @prop {String}           title           The title to show in within the modal.
 * @prop {React.Element}    children        The components to render within the modal.
 * @prop {Bool}             noCancel        Indicator that the close button should not display.
 * @prop {String}           backgroundColor BackgroundColor of the modal container.
 */
export const ModalContainer = ({
  isVisible,
  onClose,
  title,
  children,
  noCancel,
  backgroundColor,
  numberOfLines,
}) => {
  const {
    contentContainer,
    modalContainer,
    titleFont,
    titleBar,
    closeButtonContainer,
    childrenContainer,
    flexSpacer,
    closeButton,
  } = localStyles;

  const wrapStyle = style => ({ ...style, backgroundColor });

  const internalChildrenContainer = wrapStyle(childrenContainer);
  const internalContentContainer = wrapStyle(contentContainer);

  const CloseButton = React.useCallback(
    () => (
      <TouchableOpacity onPress={onClose} style={closeButton}>
        <CloseIcon />
      </TouchableOpacity>
    ),
    []
  );

  const TitleBar = React.useCallback(
    () => (
      <View style={titleBar}>
        <View style={flexSpacer} />
        {!!title && (
          <FlexView flex={2}>
            <Text ellipsizeMode="tail" numberOfLines={numberOfLines} style={titleFont}>
              {title}
            </Text>
          </FlexView>
        )}
        <FlexView flex={1} style={closeButtonContainer}>
          {!!onClose && !noCancel && <CloseButton />}
        </FlexView>
      </View>
    ),
    [title, onClose, noCancel]
  );

  return (
    <View style={modalContainer}>
      <Modal
        visible={isVisible}
        presentationStyle="fullScreen"
        animationType="slide"
        hardwareAccelerated={true}
        onRequestClose={onClose}
      >
        <View style={internalContentContainer}>
          <TitleBar />
          <View style={internalChildrenContainer}>{children}</View>
        </View>
      </Modal>
    </View>
  );
};

export default ModalContainer;

ModalContainer.defaultProps = {
  title: '',
  noCancel: false,
  onClose: null,
  backgroundColor: DARKER_GREY,
  numberOfLines: 1,
  children: null,
};

ModalContainer.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  noCancel: PropTypes.bool,
  backgroundColor: PropTypes.string,
  numberOfLines: PropTypes.number,
};

const localStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginLeft: PAGE_CONTENT_PADDING_HORIZONTAL / 2,
    marginRight: PAGE_CONTENT_PADDING_HORIZONTAL / 2,
    marginBottom: PAGE_CONTENT_PADDING_HORIZONTAL / 2,
    paddingBottom: 10,
  },
  childrenContainer: {
    flex: 1,
    paddingLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  flexSpacer: {
    flex: 1,
  },
  titleFont: {
    justifyContent: 'center',
    fontFamily: APP_FONT_FAMILY,
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  closeButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  closeButton: {
    width: 75,
    alignItems: 'center',
  },
});
