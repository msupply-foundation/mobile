/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, Text } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { FlexRow, PageButton } from '..';
import { buttonStrings, vaccineStrings } from '../../localization';
import {
  selectColdConsecutiveBreaches,
  selectHotConsecutiveBreaches,
} from '../../selectors/fridge';
import { APP_FONT_FAMILY, DARKER_GREY, SUSSOL_ORANGE, WHITE } from '../../globalStyles';

export const BreachAcknowledgeComponent = ({ isOpen, onClose, isHot, unacknowledgedBreaches }) => {
  const BreachLine = ({ item }) => {
    const {
      startTimestamp,
      endTimestamp,
      thresholdMinTemperature,
      thresholdMaxTemperature,
      type,
    } = item;

    return (
      <FlexRow justifyContent="space-evenly" alignItems="center" style={{ width: '100%' }} flex={1}>
        <Text>Start: {moment(startTimestamp).format('DD-MM-YYYY HH:mm')}</Text>
        <Text>End: {moment(endTimestamp).format('DD-MM-YYYY HH:mm')}</Text>
        <Text>
          Threshold:{' '}
          {type === 'HOT_CONSECUTIVE' ? thresholdMinTemperature : thresholdMaxTemperature}°C
        </Text>
      </FlexRow>
    );
  };

  BreachLine.propTypes = {
    item: PropTypes.shape({
      startTimestamp: PropTypes.number.isRequired,
      endTimestamp: PropTypes.number,
      thresholdMinTemperature: PropTypes.number.isRequired,
      thresholdMaxTemperature: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <PaperModalContainer isVisible={isOpen} onClose={onClose}>
      <FlexRow justifyContent="space-evenly" alignItems="center" style={{ width: '100%' }} flex={1}>
        <Text style={localStyles.headerText}>
          {`${vaccineStrings.formatString(
            vaccineStrings.unacknowledged_breaches,
            isHot ? 'Hot' : 'Cold'
          )}`}
        </Text>
      </FlexRow>
      <FlatList
        ListEmptyComponent={null}
        data={unacknowledgedBreaches}
        renderItem={({ item }) => <BreachLine item={item} />}
      />
      <FlexRow justifyContent="space-evenly" alignItems="center" style={{ width: '100%' }} flex={1}>
        <PageButton
          text={buttonStrings.acknowledge_breaches}
          textStyle={localStyles.acknowledgeText}
          onPress={() => console.log('acknowledge pressed')}
          style={localStyles.acknowledgeButton}
          isDisabled={unacknowledgedBreaches.length === 0}
        />
      </FlexRow>
    </PaperModalContainer>
  );
};

const mapStateToProps = (state, props) => {
  const unacknowledgedBreaches = props.isHot
    ? selectHotConsecutiveBreaches(state)
    : selectColdConsecutiveBreaches(state);

  return { unacknowledgedBreaches };
};

const localStyles = {
  acknowledgeButton: {
    width: 200,
    backgroundColor: SUSSOL_ORANGE,
  },
  acknowledgeText: { textTransform: 'uppercase', color: WHITE },
  headerText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
  },
};

BreachAcknowledgeComponent.defaultProps = {
  isHot: false,
  isOpen: false,
  unacknowledgedBreaches: [],
};

BreachAcknowledgeComponent.propTypes = {
  isHot: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  unacknowledgedBreaches: PropTypes.array,
};

export const BreachAcknowledge = connect(mapStateToProps)(BreachAcknowledgeComponent);
