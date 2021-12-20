import { BleService as MsBleService } from '@openmsupply/msupply-ble-service';

let BleServiceInstance;

export const getBleServiceInstance = (manager, logger) => {
  if (!BleServiceInstance) {
    BleServiceInstance = new MsBleService(manager, logger);
  }

  return BleServiceInstance;
};

export default getBleServiceInstance;
