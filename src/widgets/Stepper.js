/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { PropTypes } from 'prop-types';

import { ConfirmIcon } from './icons';
import { Circle } from './Circle';

import {
  DARKER_GREY,
  MISTY_CHARCOAL,
  TRANSPARENT,
  WHITE,
  SUSSOL_ORANGE,
  GREY,
  APP_FONT_FAMILY,
} from '../globalStyles';

const getNewLocalStyles = (step, numberOfSteps, currentStep) => ({
  stepContainer: {
    borderRadius: 15,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: step === currentStep ? DARKER_GREY : 'rgba(51,51,51,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentStep === step ? DARKER_GREY : TRANSPARENT,
    overflow: 'hidden',
  },
  stepNumber: {
    color: 'rgba(51,51,51,0.2)',
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
  },
  stepText: {
    color: step > currentStep ? GREY : SUSSOL_ORANGE,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
  },
  stepSeparator: {
    borderTopColor: 'rgba(51,51,51,0.2)',
    borderTopWidth: 1,
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: step === numberOfSteps - 1 ? 0 : 1,
  },
});

const { height, width } = Dimensions.get('window');

const getOldLocalStyles = (step, numberOfSteps, currentStep) => ({
  stepContainer: {
    borderRadius: height / 20,
    borderWidth: 2,
    borderColor: step > currentStep ? GREY : SUSSOL_ORANGE,
    width: width / 33,
    height: height / 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentStep === step ? SUSSOL_ORANGE : WHITE,
  },
  stepNumber: {
    color: step > currentStep ? GREY : (step === currentStep && 'white') || SUSSOL_ORANGE,
    fontSize: 18,
    fontFamily: APP_FONT_FAMILY,
  },
  stepText: {
    color: step > currentStep ? GREY : SUSSOL_ORANGE,
    fontSize: 18,
    fontFamily: APP_FONT_FAMILY,
    paddingLeft: 20,
  },
  stepSeperator: {
    borderTopColor: step > currentStep ? GREY : SUSSOL_ORANGE,
    borderTopWidth: 2,
    marginHorizontal: 20,
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: step === numberOfSteps - 1 ? 0 : 1,
  },
});

const OldStepperNumber = ({ step, numberOfSteps, currentStep, title, onPress }) => {
  const { stepContainer, stepNumber, stepText, stepSeperator, container } = getOldLocalStyles(
    step,
    numberOfSteps,
    currentStep
  );

  const lastStep = step === numberOfSteps - 1;
  const completedStep = currentStep > step;
  const Container = completedStep ? TouchableOpacity : View;
  const wrappedOnPress = () => onPress(step);

  return (
    <Container onPress={wrappedOnPress} style={container}>
      <View style={stepContainer}>
        <Text style={stepNumber}>{step + 1}</Text>
      </View>

      <Text adjustsFontSizeToFit ellipsizeMode="tail" numberOfLines={1} style={stepText}>
        {title}
      </Text>

      {!lastStep && <View style={stepSeperator} />}
    </Container>
  );
};

OldStepperNumber.propTypes = {
  step: PropTypes.number.isRequired,
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

const NewStepperNumber = ({ step, numberOfSteps, currentStep, isActive, isLast, onPress }) => {
  const { stepNumber, stepSeparator, container } = getNewLocalStyles(
    step,
    numberOfSteps,
    currentStep
  );

  const completedStep = currentStep > step;
  const Container = completedStep ? TouchableOpacity : View;
  const backgroundColor = isActive || completedStep ? WHITE : TRANSPARENT;
  const borderColor = isActive || completedStep ? DARKER_GREY : MISTY_CHARCOAL;

  const wrappedOnPress = () => onPress(step);

  return (
    <Container onPress={wrappedOnPress} style={container}>
      <Circle size={30} backgroundColor={backgroundColor} borderColor={borderColor}>
        {isActive || completedStep ? (
          <ConfirmIcon color={DARKER_GREY} size={35} style={{ marginTop: -4, marginLeft: -1 }} />
        ) : (
          <Text style={stepNumber}>{step + 1}</Text>
        )}
      </Circle>

      {!isLast && <View style={stepSeparator} />}
    </Container>
  );
};

NewStepperNumber.propTypes = {
  step: PropTypes.number.isRequired,
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};

export const OldStepper = ({ numberOfSteps, currentStep, titles, onPress }) => (
  <View style={localStyles.oldContainer}>
    {Array.from({ length: numberOfSteps }).map((_, i) => (
      <OldStepperNumber
        onPress={onPress}
        step={i}
        numberOfSteps={numberOfSteps}
        currentStep={currentStep}
        title={titles[i]}
        key={`${i}`}
      />
    ))}
  </View>
);

export const NewStepper = ({ numberOfSteps, currentStep, onPress }) => (
  <View style={localStyles.container}>
    <View style={localStyles.innerContainer}>
      {Array.from({ length: numberOfSteps }).map((_, i) => (
        <NewStepperNumber
          key={`${i}`}
          step={i}
          onPress={() => onPress(i)}
          numberOfSteps={numberOfSteps}
          currentStep={currentStep}
          isActive={currentStep === i}
          isLast={i === numberOfSteps - 1}
        />
      ))}
    </View>
  </View>
);

export const Stepper = ({ useNewStepper, ...stepperProps }) =>
  useNewStepper ? <NewStepper {...stepperProps} /> : <OldStepper {...stepperProps} />;

const localStyles = StyleSheet.create({
  oldContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container: { height: 50, alignItems: 'center' },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: 400,
  },
});

NewStepper.propTypes = {
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  onPress: PropTypes.func.isRequired,
};

OldStepper.propTypes = {
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  titles: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
};

Stepper.defaultProps = {
  useNewStepper: false,
};

Stepper.propTypes = {
  useNewStepper: PropTypes.bool,
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  titles: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
};
