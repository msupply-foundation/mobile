/* eslint-disable global-require */
/* eslint-disable no-undef */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-ui-components';

import { Synchroniser } from '../sync';

import { SyncState } from '../widgets';
import { DemoUserModal } from '../widgets/modals';
import packageJson from '../../package.json';

import { PermissionActions } from '../actions/PermissionActions';
import { buttonStrings } from '../localization';
import { importData } from '../database/utilities';

import globalStyles, { SUSSOL_ORANGE, WARM_GREY } from '../globalStyles';
import { FormPasswordInput } from '../widgets/FormInputs/FormPasswordInput';
import { AuthFormView } from '../widgets/AuthFormView';

const STATUSES = {
  UNINITIALISED: 'uninitialised',
  INITIALISING: 'initialising',
  INITIALISED: 'initialised',
  ERROR: 'error',
};

export class FirstUsePageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
      status: STATUSES.UNINITIALISED,
      isDemoUserModalOpen: false,
    };
    this.appVersion = packageJson.version;
    this.siteNameInputRef = null;
    this.passwordInputRef = null;
    this.onPressConnect = this.onPressConnect.bind(this);
  }

  async onPressConnect() {
    const { onInitialised, synchroniser } = this.props;
    const { serverURL, syncSiteName, syncSitePassword } = this.state;

    try {
      this.setState({ status: STATUSES.INITIALISING });
      await synchroniser.initialise(serverURL, syncSiteName, syncSitePassword);
      this.setState({ status: STATUSES.INITIALISED });

      onInitialised();
    } catch (error) {
      this.setState({ status: STATUSES.ERROR });
    }
  }

  get canAttemptLogin() {
    const { status, serverURL, syncSiteName, syncSitePassword } = this.state;

    return (
      (status === STATUSES.UNINITIALISED || status === STATUSES.ERROR) &&
      serverURL.length > 0 &&
      syncSiteName.length > 0 &&
      syncSitePassword.length > 0
    );
  }

  get buttonText() {
    const { status } = this.state;

    const { progressMessage, errorMessage, progress, total } = this.props;

    switch (status) {
      case STATUSES.INITIALISING:
        return `${progressMessage}${total > 0 ? `\n${progress}/${total}` : ''}`;
      case STATUSES.ERROR:
        return `${errorMessage}\nTap to retry.`;
      case STATUSES.INITIALISED:
        return 'Success!';
      default:
        return 'Connect';
    }
  }

  onChangeServerUrl = text =>
    this.setState({
      serverURL: text,
      status: STATUSES.UNINITIALISED,
    });

  onChangeSiteName = text =>
    this.setState({
      syncSiteName: text,
      status: STATUSES.UNINITIALISED,
    });

  onChangePassword = text =>
    this.setState({
      syncSitePassword: text,
      status: STATUSES.UNINITIALISED,
    });

  handleDemoModalOpen = () => this.setState({ isDemoUserModalOpen: true });

  handleDemoModalClose = () => this.setState({ isDemoUserModalOpen: false });

  render() {
    const { isDemoUserModalOpen, serverURL, status, syncSiteName, syncSitePassword } = this.state;
    const { requestImportStorageWritePermission } = this.props;

    return (
      <View style={[globalStyles.verticalContainer, localStyles.verticalContainer]}>
        <AuthFormView>
          <Image
            resizeMode="contain"
            style={globalStyles.authFormLogo}
            source={require('../images/logo_large.png')}
          />
          <View style={globalStyles.horizontalContainer}>
            <TextInput
              style={globalStyles.authFormTextInputStyle}
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              placeholder="Primary Server URL"
              value={serverURL}
              editable={status !== STATUSES.INITIALISING}
              returnKeyType="next"
              selectTextOnFocus
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onChangeServerUrl}
              onSubmitEditing={() => {
                if (this.siteNameInputRef) this.siteNameInputRef.focus();
              }}
              onBlur={() => {
                // Trim URLS. Any leading/trailing spaces lead to invalid URLs.
                this.setState({ serverURL: serverURL.trim() });
              }}
            />
          </View>
          <View style={globalStyles.horizontalContainer}>
            <TextInput
              ref={reference => {
                this.siteNameInputRef = reference;
              }}
              style={globalStyles.authFormTextInputStyle}
              autoCompleteType="username"
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              placeholder="Sync Site Name"
              value={syncSiteName}
              editable={status !== STATUSES.INITIALISING}
              returnKeyType="next"
              selectTextOnFocus
              onChangeText={this.onChangeSiteName}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.focus();
              }}
              onBlur={() => {
                // Trim site names. Most users don't intentionally put leading/trailing spaces in!
                this.setState({ syncSiteName: syncSiteName.trim() });
              }}
            />
          </View>
          <View style={globalStyles.horizontalContainer}>
            <FormPasswordInput
              value={syncSitePassword}
              editable={status !== STATUSES.INITIALISING}
              onChangeText={this.onChangePassword}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.blur();
                if (this.canAttemptLogin) this.onPressConnect();
              }}
              placeholder="Sync Site Password"
              ref={ref => {
                this.passwordInputRef = ref;
              }}
            />
          </View>
          <SyncState style={localStyles.initialisationStateIcon} showText={false} />
          <View style={globalStyles.authFormButtonContainer}>
            <Button
              style={globalStyles.authFormButton}
              textStyle={globalStyles.authFormButtonText}
              text={this.buttonText}
              onPress={this.onPressConnect}
              disabledColor={WARM_GREY}
              isDisabled={!this.canAttemptLogin}
            />
          </View>
        </AuthFormView>
        <View style={localStyles.demoSiteRequestButtonContainer}>
          <View style={globalStyles.horizontalContainer}>
            <Button
              style={[globalStyles.authFormButton, { flex: 1 }]}
              textStyle={globalStyles.authFormButtonText}
              text="Request a Demo Store"
              onPress={this.handleDemoModalOpen}
              disabledColor={WARM_GREY}
              isDisabled={status !== STATUSES.UNINITIALISED && status !== STATUSES.ERROR}
            />
            {__DEV__ ? (
              <Button
                style={[globalStyles.authFormButton, { marginLeft: 10, flex: 1 }]}
                textStyle={globalStyles.authFormButtonText}
                text={buttonStrings.import_data}
                onPress={requestImportStorageWritePermission}
                disabledColor={WARM_GREY}
                isDisabled={status !== STATUSES.UNINITIALISED && status !== STATUSES.ERROR}
              />
            ) : null}
          </View>
        </View>
        <Text style={globalStyles.authWindowButtonText}> v{this.appVersion}</Text>
        <DemoUserModal isOpen={isDemoUserModalOpen} onClose={this.handleDemoModalClose} />
      </View>
    );
  }
}
const mapStateToDispatch = dispatch => ({
  requestImportStorageWritePermission: () =>
    dispatch(PermissionActions.requestWriteStorage()).then(importData),
});

const mapStateToProps = state => {
  const { sync } = state;
  return sync;
};

export const FirstUsePage = connect(mapStateToProps, mapStateToDispatch)(FirstUsePageComponent);

FirstUsePageComponent.propTypes = {
  onInitialised: PropTypes.func.isRequired,
  synchroniser: PropTypes.instanceOf(Synchroniser).isRequired,
  progressMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  requestImportStorageWritePermission: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
};

const localStyles = StyleSheet.create({
  demoSiteRequestButtonContainer: {
    marginHorizontal: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  initialisationStateIcon: {
    marginTop: 46,
    marginBottom: 24,
  },
  verticalContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
