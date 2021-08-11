/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { View, Text } from 'react-native';
import Popover from 'react-native-popover-view';
import { withNavigation } from '@react-navigation/compat';

import { getBadgeData } from '../utilities/getBadgeData';
import { usePopover } from '../hooks';

import Badge from './Badge';

import { SUSSOL_ORANGE } from '../globalStyles';
import { useSyncListener } from '../hooks/useSyncListener';

const animationConfig = { duration: 150 };

const InfoBadgeComponent = ({
  popoverBackgroundStyle,
  children,
  mainWrapperStyle,
  popoverPosition,
  routeName,
  arrowStyle,
  popoverStyle,
  badgeTextStyle,
  navigation,
}) => {
  const [ref, visible, show, close] = usePopover(navigation);

  // Get total of all the count variables in the info array. We want to show it on the badge
  const [info, setInfo] = useState(getBadgeData(routeName));

  useSyncListener(() => setInfo(getBadgeData(routeName)), ['Requisition', 'Transaction']);

  const pendingCount = info.reduce((total, item) => total + (item.count || 0), 0);

  // show 99+ if the number is greater then 99 to limit the number of characters.
  const unfinalisedCountText = pendingCount > 99 ? '99+' : pendingCount;

  const popoverText = useCallback(
    (item, key) =>
      (item.count > 0 || !!item.text) && (
        <Text style={badgeTextStyle} key={key}>
          {`${item.title}: ${item.count || item.text}`}
        </Text>
      ),
    []
  );

  return (
    <View>
      {children}
      {pendingCount !== 0 && (
        <View style={mainWrapperStyle}>
          <Badge ref={ref} value={unfinalisedCountText} onPress={show} />
          <Popover
            isVisible={visible}
            from={ref}
            onRequestClose={close}
            popoverStyle={popoverStyle}
            arrowStyle={arrowStyle}
            backgroundStyle={popoverBackgroundStyle}
            placement={popoverPosition}
            animationConfig={animationConfig}
          >
            {info.map(popoverText)}
          </Popover>
        </View>
      )}
    </View>
  );
};

export const InfoBadge = withNavigation(InfoBadgeComponent);

InfoBadgeComponent.propTypes = {
  routeName: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  mainWrapperStyle: PropTypes.object,
  popoverPosition: PropTypes.string,
  popoverBackgroundStyle: PropTypes.object,
  arrowStyle: PropTypes.object,
  popoverStyle: PropTypes.object,
  badgeTextStyle: PropTypes.object,
  navigation: PropTypes.object.isRequired,
};

InfoBadgeComponent.defaultProps = {
  arrowStyle: { backgroundColor: SUSSOL_ORANGE },
  popoverStyle: { padding: 10, backgroundColor: SUSSOL_ORANGE },
  badgeTextStyle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  mainWrapperStyle: {
    position: 'absolute',
    top: 0,
    right: 8,
  },

  popoverPosition: 'auto',
  popoverBackgroundStyle: { backgroundColor: 'transparent' },
};
