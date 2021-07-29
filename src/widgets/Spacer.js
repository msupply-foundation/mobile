/* eslint-disable arrow-body-style */
import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

export const Spacer = ({ vertical, horizontal, space }) => {
  const internalStyle = {};

  if (vertical) {
    internalStyle.minHeight = space;
  }

  if (horizontal) {
    internalStyle.minWidth = space;
  }

  return <View style={internalStyle} />;
};

Spacer.defaultProps = { vertical: false, horizontal: true, space: 0 };

Spacer.propTypes = {
  vertical: PropTypes.bool,
  horizontal: PropTypes.bool,
  space: PropTypes.number,
};

export const SpacedChildren = ({ children, space, vertical, horizontal }) => {
  return Children.map(children, (child, i) => {
    const isLastChild = i === React.Children.count(children) - 1;
    return (
      <WithSpace space={isLastChild ? 0 : space} vertical={vertical} horizontal={horizontal}>
        {child}
      </WithSpace>
    );
  });
};

SpacedChildren.defaultProps = {
  children: null,
  space: 0,
  vertical: false,
  horizontal: true,
};

SpacedChildren.propTypes = {
  children: PropTypes.node,
  space: PropTypes.number,
  vertical: PropTypes.bool,
  horizontal: PropTypes.bool,
};

export const WithSpace = ({ space, vertical, horizontal, before, after, children }) => (
  <>
    {!!before && <Spacer space={space} vertical={vertical} horizontal={horizontal} />}
    {children}
    {!!after && <Spacer space={space} vertical={vertical} horizontal={horizontal} />}
  </>
);

WithSpace.defaultProps = {
  space: 0,
  vertical: false,
  horizontal: true,
  before: false,
  after: true,
  children: null,
};

WithSpace.propTypes = {
  space: PropTypes.number,
  vertical: PropTypes.bool,
  horizontal: PropTypes.bool,
  before: PropTypes.bool,
  after: PropTypes.bool,
  children: PropTypes.node,
};
