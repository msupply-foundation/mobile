import { BtUtilService as MsBtUtilService } from 'msupply-ble-service';

let BtUtilServiceInstance;

export const getBtUtilServiceInstance = () => {
  if (!BtUtilServiceInstance) {
    BtUtilServiceInstance = new MsBtUtilService();
  }

  return BtUtilServiceInstance;
};

export default getBtUtilServiceInstance;
