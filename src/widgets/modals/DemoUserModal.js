/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-ui-components';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfirmForm } from '../modalChildren';

import { DemoSiteRequest } from '../../authentication';
import { authStrings, generalStrings, demoUserModalStrings } from '../../localization';

import globalStyles, { SUSSOL_ORANGE, GREY, WARM_GREY } from '../../globalStyles';
import { ModalContainer } from './ModalContainer';
import { FormPasswordInput } from '../FormInputs/FormPasswordInput';
import { AuthFormView } from '../AuthFormView';

const STATUS = {
  SUBMIT: 'submit',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
  ERROR: 'error',
};

export class DemoUserModal extends React.Component {
  constructor(props) {
    super(props);
    this.demoSiteRequest = new DemoSiteRequest();
    this.state = {
      status: STATUS.SUBMIT,
      error: '',
      username: '',
      password: '',
      repeatPassword: '',
      email: '',
    };
    this.errorTimeoutId = null;
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  onDemoRequestSubmit = async () => {
    const { username, email, password, repeatPassword } = this.state;

    if (this.canAttemptSubmit) {
      this.setState({ status: STATUS.SUBMITTING });
      try {
        await this.demoSiteRequest.createActivationURL(username, email, password, repeatPassword);
        this.setState({ status: STATUS.SUBMITTED });
      } catch (error) {
        this.setState({ status: STATUS.ERROR, error: error.message });
        if (!error.message.startsWith('Invalid username or password')) {
          // After ten seconds of displaying the error, re-enable the button
          this.errorTimeoutId = setTimeout(() => {
            this.setState({ status: STATUS.SUBMIT });
            this.errorTimeoutId = null;
          }, 10 * 1000);
        }
      }
    }
  };

  onDemoSubmittedModalClose = () => {
    const { onClose } = this.props;

    // Reset state, close modals and go back to FirstUsePage
    this.setState({
      status: STATUS.SUBMIT,
      username: '',
      password: '',
      repeatPassword: '',
      email: '',
    });
    onClose();
  };

  get canAttemptSubmit() {
    const { status, username, password, email, repeatPassword } = this.state;

    return (
      status === STATUS.SUBMIT &&
      username.length > 0 &&
      password.length > 0 &&
      email.length > 0 &&
      repeatPassword.length > 0
    );
  }

  get buttonText() {
    const { status, error } = this.state;

    switch (status) {
      case STATUS.SUBMITTING:
        return generalStrings.submitting;
      case STATUS.SUBMITTED:
        return generalStrings.submitted;
      case STATUS.ERROR:
        return error;
      default:
        return generalStrings.submit;
    }
  }

  // Handlers to set state of form variables on input onChange trigger
  // Extracting into local methods because calling an anonymous function in onChange would
  // re-render the input fields each time render() is called, causing slight performance hit
  handleOnChangeEmail = text => this.setState({ email: text, status: STATUS.SUBMIT });

  handleOnChangeUsername = text => this.setState({ username: text, status: STATUS.SUBMIT });

  handleOnChangePassword = text => this.setState({ password: text, status: STATUS.SUBMIT });

  handleOnChangeRepeatPassword = text =>
    this.setState({ repeatPassword: text, status: STATUS.SUBMIT });

  render() {
    const { isOpen, onClose } = this.props;
    const { username, email, password, repeatPassword, status } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        swipeToClose={true}
      >
        <View style={[globalStyles.verticalContainer, { flex: 1 }]}>
          <AuthFormView>
            <View style={localStyles.closeButtonContainer}>
              <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
                <Icon name="close" style={localStyles.closeIcon} />
              </TouchableOpacity>
            </View>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              // TODO: require assets at top of file
              // eslint-disable-next-line global-require
              source={require('../../images/logo_large.png')}
            />
            <View style={globalStyles.horizontalContainer}>
              <Text style={[globalStyles.authFormTextInputStyle, localStyles.syncSiteName]}>
                {demoUserModalStrings.modal_body_text}
              </Text>
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.user_name}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={username}
                editable={status !== STATUS.SUBMITTING}
                returnKeyType="next"
                selectTextOnFocus
                onChangeText={this.handleOnChangeUsername}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.email}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={email}
                editable={status !== STATUS.SUBMITTING}
                returnKeyType="next"
                selectTextOnFocus
                onChangeText={this.handleOnChangeEmail}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <FormPasswordInput
                value={password}
                editable={status !== STATUS.SUBMITTING}
                onChangeText={this.handleOnChangePassword}
                returnKeyType="next"
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <FormPasswordInput
                value={repeatPassword}
                editable={status !== STATUS.SUBMITTING}
                onChangeText={this.handleOnChangeRepeatPassword}
                onSubmitEditing={this.onDemoRequestSubmit}
                placeholder={authStrings.repeat_password}
                returnKeyType="next"
              />
            </View>
            <View style={globalStyles.authFormButtonContainer}>
              <Button
                style={[globalStyles.authFormButton, globalStyles.loginButton]}
                textStyle={globalStyles.authFormButtonText}
                text={this.buttonText}
                onPress={this.onDemoRequestSubmit}
                disabledColor={WARM_GREY}
                isDisabled={!this.canAttemptSubmit}
              />
            </View>
          </AuthFormView>
          <ModalContainer isVisible={status === STATUS.SUBMITTED}>
            <ConfirmForm
              isOpen={status === STATUS.SUBMITTED}
              questionText={demoUserModalStrings.confirm_modal_body}
              onConfirm={this.onDemoSubmittedModalClose}
              confirmText="Close"
            />
          </ModalContainer>
        </View>
      </Modal>
    );
  }
}

export default DemoUserModal;

/* eslint-disable react/require-default-props */
DemoUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  onClose: PropTypes.func,
};

/* eslint-disable react/default-props-match-prop-types */
DemoUserModal.defaultProps = {
  style: {},
  textStyle: {},
};

const localStyles = StyleSheet.create({
  bottomIcon: {
    color: GREY,
  },
  syncSiteName: {
    textAlign: 'center',
    color: GREY,
    marginBottom: 20,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 15,
    right: 0,
  },
  closeButton: {
    width: 50,
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: GREY,
  },
});
