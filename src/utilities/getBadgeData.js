import { generalStrings } from '../localization';
import { UIDatabase } from '../database';

const routeList = {
  customerRequisitions: 'ResponseRequisition',
  supplierRequisitions: 'RequestRequisition',
  supplierInvoices: 'SupplierInvoice',
  stocktakes: 'Stocktake',
  customerInvoices: 'CustomerInvoice',
  vaccines: 'Sensor',
};

const getBadgeData = routeName => {
  const dataType = routeName in routeList ? routeList[routeName] : '';

  switch (dataType) {
    case 'Sensor': {
      return [
        {
          count: UIDatabase.objects(dataType).filter(
            sensor => sensor.isActive && (sensor.isInHotBreach || sensor.isInColdBreach)
          ).length,
          title: `${generalStrings.sensors_in_breach}`,
        },
      ];
    }
    default:
      return [
        {
          count: dataType
            ? UIDatabase.objects(dataType).filtered('status != "finalised"').length
            : 0,
          title: `${generalStrings.unfinalised} ${generalStrings[routeName]}`,
        },
      ];
  }
};

export default getBadgeData;
export { getBadgeData };
