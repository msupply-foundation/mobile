/* eslint-disable react/forbid-prop-types */
/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-ui-components';

import { UserActions } from '../../actions';
import { SETTINGS_KEYS } from '../../settings';

import globalStyles, { WHITE, SUSSOL_ORANGE, WARM_GREY } from '../../globalStyles';
import { Flag, IconButton } from '..';
import { GenericChoiceList } from '../modalChildren/GenericChoiceList';
import { ModalContainer } from './ModalContainer';
import { LanguageIcon } from '../icons';
import { AuthFormView } from '../AuthFormView';

import { LANGUAGE_NAMES, LANGUAGE_CHOICE, authStrings, navStrings } from '../../localization';
import { getModalTitle, MODAL_KEYS } from '../../utilities';
import { setCurrencyLocalisation } from '../../localization/currency';
import { setDateLocale } from '../../localization/utilities';
import { UIDatabase } from '../../database';
import packageJson from '../../../package.json';
import { FormPasswordInput } from '../FormInputs/FormPasswordInput';

const AUTH_STATUSES = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
};

class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    const username = props.settings.get(SETTINGS_KEYS.MOST_RECENT_USERNAME);
    this.state = {
      authStatus: AUTH_STATUSES.UNAUTHENTICATED,
      error: '',
      username: username || '',
      password: '',
      isLanguageModalOpen: false,
    };
    this.appVersion = packageJson.version;
    this.passwordInputRef = null;
    this.errorTimeoutId = null;
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { authStatus } = this.state;

    if (authStatus === AUTH_STATUSES.AUTHENTICATED && !nextProps.isAuthenticated) {
      this.setState({
        authStatus: AUTH_STATUSES.UNAUTHENTICATED,
        password: '',
      });
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  onLogin = async () => {
    const { authenticator, onAuthentication, settings } = this.props;
    const { username, password } = this.state;

    settings.set(SETTINGS_KEYS.MOST_RECENT_USERNAME, username);

    this.setState({ authStatus: AUTH_STATUSES.AUTHENTICATING });

    try {
      const user = await authenticator.authenticate(username, password);
      this.setState({ authStatus: AUTH_STATUSES.AUTHENTICATED });
      onAuthentication(user);
    } catch (error) {
      const message = error.message.startsWith('Invalid username or password')
        ? authStrings.invalid_username_or_password
        : error.message;

      this.setState({ authStatus: AUTH_STATUSES.ERROR, error: message });
      onAuthentication(null);
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ authStatus: AUTH_STATUSES.UNAUTHENTICATED });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  };

  get canAttemptLogin() {
    const { authStatus, username, password } = this.state;

    return (
      authStatus === AUTH_STATUSES.UNAUTHENTICATED && username.length > 0 && password.length > 0
    );
  }

  get buttonText() {
    const { authStatus, error } = this.state;

    switch (authStatus) {
      case AUTH_STATUSES.AUTHENTICATING:
      case AUTH_STATUSES.AUTHENTICATED:
        return authStrings.logging_in;
      case AUTH_STATUSES.ERROR:
        return error;
      default:
        return authStrings.login;
    }
  }

  onCloseModal = () => {
    this.setState({ isLanguageModalOpen: false });
  };

  onSelectLanguage = ({ item }) => {
    const { settings, changeCurrentLanguage } = this.props;
    changeCurrentLanguage(item.code);
    settings.set(SETTINGS_KEYS.CURRENT_LANGUAGE, item.code);
    setCurrencyLocalisation(item.code);
    setDateLocale(item.code);
    this.setState({ isLanguageModalOpen: false });
  };

  renderFlag = ({ code }) => <Flag countryCode={code} />;

  render() {
    const { isAuthenticated, settings } = this.props;
    const { authStatus, username, password, isLanguageModalOpen } = this.state;
    const storeName = UIDatabase.objects('Name').filtered(
      'id == $0',
      settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
    )[0]?.name;

    return (
      <ModalContainer
        isVisible={!isAuthenticated}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        swipeToClose={false}
        backgroundColor={WHITE}
      >
        <View style={[globalStyles.verticalContainer, { flex: 1 }]}>
          <AuthFormView>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              source={require('../../images/logo_large.png')}
            />
            <Text style={[globalStyles.authFormTextInputStyle, { flex: 0 }]}>
              {authStrings.site}: {settings.get(SETTINGS_KEYS.SYNC_SITE_NAME)}
            </Text>
            <Text style={[globalStyles.authFormTextInputStyle, { flex: 0, marginVertical: 10 }]}>
              {authStrings.store}: {storeName}
            </Text>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                autoCompleteType="username"
                placeholder={authStrings.user_name}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={username}
                editable={authStatus !== AUTH_STATUSES.AUTHENTICATING}
                returnKeyType="next"
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({
                    username: text,
                    authStatus: AUTH_STATUSES.UNAUTHENTICATED,
                  });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.focus();
                }}
                onBlur={() => {
                  // Trim usernames. Most users don't intentionally put leading/trailing spaces in!
                  this.setState({ username: username.trim() });
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <FormPasswordInput
                ref={ref => {
                  this.passwordInputRef = ref;
                }}
                value={password}
                editable={authStatus !== AUTH_STATUSES.AUTHENTICATING}
                onChangeText={text => {
                  this.setState({ password: text, authStatus: AUTH_STATUSES.UNAUTHENTICATED });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.blur();
                  if (this.canAttemptLogin) this.onLogin();
                }}
                placeholder={authStrings.password}
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
          </AuthFormView>
        </View>
        <View style={globalStyles.bottomContainer}>
          <IconButton
            Icon={<LanguageIcon />}
            label={navStrings.language}
            onPress={() => {
              this.setState({ isLanguageModalOpen: true });
            }}
          />
          <Text style={globalStyles.authWindowButtonText}>v{this.appVersion}</Text>
        </View>
        <ModalContainer
          isVisible={isLanguageModalOpen}
          onClose={this.onCloseModal}
          title={getModalTitle(MODAL_KEYS.SELECT_LANGUAGE)}
        >
          <GenericChoiceList
            data={LANGUAGE_CHOICE}
            keyToDisplay="name"
            onPress={this.onSelectLanguage}
            renderLeftComponent={this.renderFlag}
            highlightValue={LANGUAGE_NAMES[settings.get(SETTINGS_KEYS.CURRENT_LANGUAGE)]}
          />
        </ModalContainer>
      </ModalContainer>
    );
  }
}

LoginModal.propTypes = {
  authenticator: PropTypes.object.isRequired,
  changeCurrentLanguage: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onAuthentication: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};

const mapDispatchToProps = dispatch => ({
  changeCurrentLanguage: code => dispatch(UserActions.setLanguage(code)),
});

export default connect(null, mapDispatchToProps)(LoginModal);
