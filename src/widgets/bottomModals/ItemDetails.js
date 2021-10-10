/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';

import { formatExpiryDate } from '../../utilities';

import { PageInfo } from '../PageInfo/PageInfo';

import { tableStrings, generalStrings } from '../../localization';
import { DARKER_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { twoDecimalsMax } from '../../utilities/formatters';

export const ItemDetailsComponent = ({ item }) => {
  const headers = {
    batch: generalStrings.batch_name,
    expiryDate: generalStrings.expiry_date,
    numberOfPacks: generalStrings.quantity,
    doses: generalStrings.doses,
    vials: generalStrings.vials,
    category: tableStrings.category,
    department: tableStrings.department,
    usage: tableStrings.monthly_usage_s,
  };

  const formatters = {
    expiryDate: expiryDate => formatExpiryDate(expiryDate),
    numberOfPacks: packs => twoDecimalsMax(packs),
  };

  const getRow = (title, info) => ({ info, title });

  const getBatchColumn = field =>
    item.batchesWithStock.sorted('expiryDate').map(itemBatch => {
      const title = headers[field];

      const data = itemBatch[field];
      const info =
        (formatters[field] && formatters[field](data)) || data || generalStrings.not_available;

      return getRow(title, info);
    });

  const getBatchInfo = () => {
    const batchNameColumn = getBatchColumn('batch');
    const expiryDateColumn = getBatchColumn('expiryDate');
    const quantityColumn = getBatchColumn('numberOfPacks');

    return [batchNameColumn, expiryDateColumn, quantityColumn];
  };

  const getVaccineBatchInfo = () => {
    const batchNameColumn = getBatchColumn('batch');
    const expiryDateColumn = getBatchColumn('expiryDate');
    const vialsColumn = getBatchColumn('numberOfPacks').map(batchColumn => ({
      title: headers.vials,
      info: batchColumn.info,
    }));
    const dosesColumn = getBatchColumn('doses');

    return [batchNameColumn, expiryDateColumn, vialsColumn, dosesColumn];
  };

  const getItemInfo = () => {
    const { categoryName, departmentName, monthlyUsage } = item;

    const categoryRow = {
      title: `${tableStrings.category}:`,
      info: categoryName || generalStrings.not_available,
    };
    const departmentRow = {
      title: `${tableStrings.department}:`,
      info: departmentName || generalStrings.not_available,
    };
    const usageRow = { title: `${tableStrings.monthly_usage_s}:`, info: Math.round(monthlyUsage) };

    return [[categoryRow, departmentRow, usageRow]];
  };

  return (
    <ScrollView indicatorStyle="white" style={localStyles.container}>
      <PageInfo titleColor={SUSSOL_ORANGE} infoColor="white" columns={getItemInfo()} />
      <PageInfo
        titleColor={SUSSOL_ORANGE}
        infoColor="white"
        columns={item.isVaccine ? getVaccineBatchInfo() : getBatchInfo()}
      />
    </ScrollView>
  );
};

export const ItemDetails = React.memo(ItemDetailsComponent);

const localStyles = {
  container: {
    height: 250,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 50,
    backgroundColor: DARKER_GREY,
  },
};

ItemDetailsComponent.propTypes = {
  item: PropTypes.object.isRequired,
};
