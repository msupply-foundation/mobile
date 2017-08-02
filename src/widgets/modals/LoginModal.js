/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-ui-components';
import { LanguageModal } from './LanguageModal';
import Modal from 'react-native-modalbox';
import globalStyles, {
  SUSSOL_ORANGE,
  GREY,
  WARM_GREY,
} from '../../globalStyles';
import { SETTINGS_KEYS, getAppVersion } from '../../settings';
import { authStrings, navStrings } from '../../localization';
import Icon from 'react-native-vector-icons/FontAwesome';


export class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    const username = props.settings.get(SETTINGS_KEYS.MOST_RECENT_USERNAME);
    this.state = {
      authStatus: 'unauthenticated', // unauthenticated, authenticating, authenticated, error
      error: '',
      username: username || '',
      password: '',
      isLanguageModalOpen: false,
      appVersion: '',
    };
    this.setAppVersion();
    this.passwordInputRef = null;
    this.errorTimeoutId = null;
  }

  componentWillMount() {
    this.onLogin = this.onLogin.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.authStatus === 'authenticated' && !nextProps.isAuthenticated) {
      this.setState({
        authStatus: 'unauthenticated',
        password: '',
      });
    }
  }

  componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  async onLogin() {
    this.props.settings.set(SETTINGS_KEYS.MOST_RECENT_USERNAME, this.state.username);
    this.setState({ authStatus: 'authenticating' });
    try {
      const user = await this.props.authenticator.authenticate(this.state.username,
                                                               this.state.password);
      this.setState({ authStatus: 'authenticated' });
      this.props.onAuthentication(user);
    } catch (error) {
      this.setState({ authStatus: 'error', error: error.message });
      this.props.onAuthentication(null);
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ authStatus: 'unauthenticated' });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  }

  async setAppVersion() {
    const appVersion = await getAppVersion();
    this.setState({ appVersion: appVersion });
  }

  get canAttemptLogin() {
    return (
      this.state.authStatus === 'unauthenticated' &&
      this.state.username.length > 0 &&
      this.state.password.length > 0
    );
  }

  get buttonText() {
    switch (this.state.authStatus) {
      case 'authenticating':
      case 'authenticated':
        return authStrings.logging_in;
      case 'error':
        return this.state.error;
      default:
        return authStrings.login;
    }
  }

  render() {
    return (
      <Modal
        isOpen={!this.props.isAuthenticated}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        backdropOpacity={1}
        swipeToClose={false}
        position="top"
        startOpen
      >
        <View style={[globalStyles.verticalContainer, { flex: 1 }]}>
          <View style={[globalStyles.authFormContainer]}>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              source={require('../../images/logo_large.png')}
            />
            <View style={globalStyles.horizontalContainer}>
              <Text style={[globalStyles.authFormTextInputStyle, localStyles.syncSiteName]}>
                {this.props.settings.get(SETTINGS_KEYS.SYNC_SITE_NAME)}
              </Text>
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.user_name}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.username}
                editable={this.state.authStatus !== 'authenticating'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={(text) => {
                  this.setState({ username: text, authStatus: 'unauthenticated' });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.focus();
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                ref={(reference) => (this.passwordInputRef = reference)}
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.password}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.password}
                secureTextEntry
                editable={this.state.authStatus !== 'authenticating'}
                returnKeyType={'done'}
                selectTextOnFocus
                onChangeText={(text) => {
                  this.setState({ password: text, authStatus: 'unauthenticated' });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.blur();
                  if (this.canAttemptLogin) this.onLogin();
                }}
              />
            </View>
            <View style={globalStyles.authFormButtonContainer}>
              <Button
                style={[globalStyles.authFormButton, globalStyles.loginButton]}
                textStyle={globalStyles.authFormButtonText}
                text={this.buttonText}
                onPress={this.onLogin}
                disabledColor={WARM_GREY}
                isDisabled={!this.canAttemptLogin}
              />
            </View>
          </View>
        </View>
        <View style={globalStyles.bottomContainer}>
          <Icon.Button
            name="language"
            size={25}
            underlayColor="#888888"
            iconStyle={localStyles.bottomIcon}
            borderRadius={4}
            backgroundColor="rgba(255,255,255,0)"
            onPress={() => this.setState({ isLanguageModalOpen: true })}
          >
            <Text style={globalStyles.authWindowButtonText}>{navStrings.language}</Text>
          </Icon.Button>
          <Text style={globalStyles.authWindowButtonText}> v{this.state.appVersion}</Text>
        </View>
        <LanguageModal
          isOpen={this.state.isLanguageModalOpen}
          onClose={() => this.setState({ isLanguageModalOpen: false })}
          settings={this.props.settings}
        />
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  authenticator: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onAuthentication: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};
LoginModal.defaultProps = {
  style: {},
  textStyle: {},
};

const localStyles = StyleSheet.create({
  bottomIcon: {
    color: GREY,
  },
  syncSiteName: {
    textAlign: 'center',
  },
});
