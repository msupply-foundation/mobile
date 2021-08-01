/* eslint-disable react/prop-types */
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CloseIcon, PlusCircle } from '../../icons';
import { FlexColumn } from '../../FlexColumn';
import { FlexRow } from '../../FlexRow';
import { generalStrings } from '../../../localization';
import { SHADOW_BORDER, DARKER_GREY, APP_FONT_FAMILY, SUSSOL_ORANGE } from '../../../globalStyles';

const StyledText = ({ children }) => <Text style={styles.text}>{children}</Text>;

const AddButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <FlexRow alignItems="center">
      <StyledText>{generalStrings.add_item}</StyledText>
      <PlusCircle color={SUSSOL_ORANGE} size={20} />
    </FlexRow>
  </TouchableOpacity>
);

const CloseButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <FlexRow alignItems="center">
      <StyledText>{generalStrings.remove_item}</StyledText>
      <CloseIcon color={SUSSOL_ORANGE} size={15} />
    </FlexRow>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const ArrayFieldTemplateItem = ({ index, onDropIndexClick, children }) => (
  <FlexColumn>
    <FlexColumn alignItems="flex-end">
      <CloseButton onPress={onDropIndexClick(index)} />
    </FlexColumn>
    {children}
  </FlexColumn>
);

const isLastItem = (index, items) => items.length - 1 === index;

export const ArrayField = ({ items, onAddClick }) => (
  <FlexColumn flex={1} style={styles.template}>
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={`array_field_template_item${index}`}>
        <ArrayFieldTemplateItem {...item} />
        {!isLastItem(index, items) && <Divider />}
      </React.Fragment>
    ))}
    <FlexColumn alignItems="flex-end" style={{ marginTop: 20 }}>
      <AddButton onPress={onAddClick} />
    </FlexColumn>
  </FlexColumn>
);

const styles = StyleSheet.create({
  template: {
    borderWidth: 2,
    padding: 20,
    borderRadius: 5,
    margin: 20,
    borderColor: SHADOW_BORDER,
  },
  divider: { width: '100%', height: 1, marginTop: 20, backgroundColor: DARKER_GREY },
  text: { fontFamily: APP_FONT_FAMILY, fontSize: 12, paddingRight: 5 },
});
