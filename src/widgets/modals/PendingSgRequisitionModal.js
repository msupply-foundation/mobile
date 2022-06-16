import React from 'react';
import PropTypes from 'prop-types';
import { ToastAndroid } from 'react-native';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';
import Settings from '../../settings/MobileAppSettings';
import { SETTINGS_KEYS } from '../../settings';
import { modalStrings } from '../../localization';

const PendingSgRequisitionModal = ({ isOpen, onClose, count }) => {
  const onModalConfirm = async () => {
    const syncSiteID = Settings.get(SETTINGS_KEYS.SYNC_SITE_ID);
    const serverURL = Settings.get(SETTINGS_KEYS.SYNC_URL);

    const url = `${serverURL}/api/v4/mobile/sg-customer-requisition/${syncSiteID}`;

    const response = await fetch(url, { method: 'DELETE' });

    if (response.status < 200 || response.status >= 300) {
      ToastAndroid.show(modalStrings.failed_to_delete_sg_customer_requisition, ToastAndroid.LONG);

      Settings.delete(SETTINGS_KEYS.SYNC_URL);
      Settings.delete(SETTINGS_KEYS.SYNC_SITE_NAME);
    } else {
      ToastAndroid.show(modalStrings.success_delete_sg_customer_requisition, ToastAndroid.LONG);
    }

    onClose();
  };

  return (
    <PaperModalContainer heightFactor={0.8} isVisible={isOpen} onClose={onClose}>
      <PaperConfirmModal
        questionText={modalStrings.formatString(
          modalStrings.pending_sg_customer_requisition,
          count
        )}
        confirmText={modalStrings.delete}
        cancelText={modalStrings.cancel}
        onConfirm={onModalConfirm}
        onCancel={onClose}
      />
    </PaperModalContainer>
  );
};

PendingSgRequisitionModal.defaultProps = {
  count: 0,
};

PendingSgRequisitionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  onClose: PropTypes.func,
  count: PropTypes.number,
};

export { PendingSgRequisitionModal };
