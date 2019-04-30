/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings from 'react-native-localization';

/* eslint-disable max-len */

/**
 * TODO: select_a_reason
 */

export const modalStrings = new LocalizedStrings({
  gb: {
    add_at_least_one_item_before_finalising: 'You need to add at least one item before finalising',
    and: 'and',
    cancel: 'Cancel',
    confirm: 'Confirm',
    create: 'Create',
    delete_these_invoices: 'Are you sure you want to delete these invoices?',
    delete_these_requisitions: 'Are you sure you want to delete these requisitions?',
    delete_these_stocktakes: 'Are you sure you want to delete these stocktakes?',
    delete: 'Delete',
    edit_the_invoice_comment: 'Edit the invoice comment',
    edit_the_requisition_comment: 'Edit the requisition comment',
    edit_their_reference: 'Edit their reference',
    edit_the_stocktake_comment: 'Edit stocktake comment',
    edit_the_stocktake_name: 'Edit stocktake name',
    finalise_customer_invoice: 'Finalise will lock this invoice permanently.',
    finalise_supplier_requisition: 'Finalise will send this requisition and lock it permanently.',
    finalise_customer_requisition:
      // eslint-disable-next-line no-multi-str
      'Finalise will generate a finalised customer invoice, adjust inventory, and lock this\
       requisition permanently.',
    finalise_stocktake: 'Finalise will adjust inventory and lock this stocktake permanently.',
    finalise_supplier_invoice: 'Finalise will adjust inventory and lock this invoice permanently.',
    following_items_reduced_more_than_available_stock:
      'The following items have been reduced by more than the available stock:',
    give_your_stocktake_a_name: 'Give your stocktake a name',
    got_it: 'Got it',
    more: 'more',
    record_stock_required_before_finalising:
      'You need to record how much stock is required before finalising',
    record_stock_to_issue_before_finalising:
      'You need to record how much stock to issue before finalising',
    remove_these_items: 'Are you sure you want to remove these items?',
    remove: 'Remove',
    search_for_an_item_to_add: 'Search for an item to add',
    search_for_the_customer: 'Search for the customer',
    search_for_the_supplier: 'Search for the supplier',
    select_a_language: 'Select a language',
    select_the_number_of_months_stock_required: 'Select the number of months stock required',
    start_typing_to_select_customer: 'Start typing to select customer',
    start_typing_to_select_supplier: 'Start typing to select supplier',
    stock_quantity_greater_then_zero: 'Stock quantity must be greater then zero before finalising',
    stocktake_no_counted_items: "Can't finalise a stocktake with no counted items",
    stocktake_invalid_stock:
      // eslint-disable-next-line no-multi-str
      'Stock on hand for these item(s) have changed since this stocktake was last opened \
       (through customer invoice, supplier invoice or another stocktake), both "Snapshot Quantity" \
       and "Actual Quantity" will be reset',
    select_a_reason: 'Select a reason',
  },
  fr: {
    add_at_least_one_item_before_finalising:
      'Vous devez ajouter au moins un article avant de finaliser',
    and: 'et',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    create: 'Créer',
    delete_these_invoices: 'Êtes-vous sûr de vouloir supprimer ces factures ?',
    delete_these_requisitions: 'Êtes-vous sûr de vouloir supprimer ces réquisitions ?',
    delete_these_stocktakes: "Êtes-vous sûr de vouloir supprimer ces relevé d'inventaires ?",
    delete: 'Supprimer',
    edit_the_invoice_comment: 'Modifier le commentaire de la facture',
    edit_the_requisition_comment: 'Modifier le commentaire de la réquisition',
    edit_their_reference: 'Modifier leur référence',
    edit_the_stocktake_comment: "Modifier le commmentaire de ce relevé d'inventaire",
    edit_the_stocktake_name: "Modifier le nom de ce relevé d'inventaire:",
    finalise_customer_invoice: 'Finaliser verrouillera cette facture de façon permanente.',
    finalise_supplier_requisition:
      'Finaliser enverra cette réquisition et la verrouillera de façon permanente',
    finalise_customer_requisition:
      // eslint-disable-next-line no-multi-str
      "Finaliser va générer une facture client finalisé, ajuster l'inventaire et verrouiller\
       cette réquisition de façon permanente.",
    finalise_stocktake:
      "Finaliser ajustera l'inventaire et verrouillera ce relevé d'inventaire de façon permanente.",
    finalise_supplier_invoice:
      "Finaliser ajustera l'inventaire and verrouillera cette facture de façon permanente.",
    following_items_reduced_more_than_available_stock: 'Les articles suivants:',
    give_your_stocktake_a_name: "Nommer votre relevé d'inventaire",
    got_it: 'Je comprends',
    more: 'plus',
    record_stock_required_before_finalising:
      'Vous devez spécifier la quantité de stock requise avant de pouvoir finaliser',
    record_stock_to_issue_before_finalising:
      'Vous devez spécifier la quantité de stock à émettre avant de pouvoir finaliser',
    remove_these_items: 'Êtes-vous sûr de vouloir enlever ces articles ?',
    remove: 'Enlever',
    search_for_an_item_to_add: 'Rechercher un article à ajouter',
    search_for_the_customer: 'Rechercher un client',
    search_for_the_supplier: 'Rechercher un fournisseur',
    select_a_language: 'Sélectionner un langage',
    select_the_number_of_months_stock_required: 'Sélectionner le nombre de mois de stock requis',
    start_typing_to_select_customer: 'Tapez pour rechercher un client',
    start_typing_to_select_supplier: 'Tapez pour rechercher un fournisseur',
    stock_quantity_greater_then_zero:
      'La quantité de stock doit être plus grande que zéro avant de finaliser',
    stocktake_no_counted_items: "Ne peut finaliser un relevé d'inventaire sans articles dénombrés",
    stocktake_invalid_stock:
      // eslint-disable-next-line no-multi-str
      "Le stock disponible pour ces article(s) a changé depuis que ce relevé d'inventaire a été \
       ouvert pour la dernière fois ( à cause de factures clients, factures de fournisseurs ou \
       d'autres relevé d'inventaire). La quantité actuelle et celle de l'instantané seront \
       réinitialisées.",
    select_a_reason: 'Select a reason',
  },
  gil: {
    // TODO: add |edit_the_stocktake_comment|, |edit_the_stocktake_name|, |stocktake_invalid_stock|
    add_at_least_one_item_before_finalising: 'E riai n iai kanoana imwain ae ko finalise',
    and: 'ao',
    cancel: 'kamauna',
    confirm: 'kamatoa',
    create: 'Karina/Karaoa ae boou',
    delete_these_invoices: 'Ko koaua bwa ko na kanakoi am kanakobwai aikai?',
    delete_these_requisitions: 'Ko koaua bwa ko na kanakoi am oota aikai?',
    delete_these_stocktakes: 'Ko koaua bwa ko na kanakoi am warebwai aikai?',
    delete: 'Delete',
    edit_the_invoice_comment: 'Manga bita am kanakobwai',
    edit_the_requisition_comment: 'Manga bita am oota',
    edit_their_reference: 'Bita ana reference number',
    finalise_customer_invoice: 'Ko aki kona n manga bita te invoice ae a tia n Finalise',
    finalise_customer_requisition:
      // eslint-disable-next-line no-multi-str
      'Kamatoakin raoi te katitama inwoiti ma mwaitin bwaain aoraki ni ikotaki ma bubuti\
       ke oota ena tia raoi ao man aki kona ni bibitaki imwin te kamatoa ke te bainaraiti',
    finalise_supplier_requisition: 'Am order ae Finalise, e nako, ao ko aki kona n bitia',
    finalise_stocktake: 'Am warebwai ae Finalise, ko aki manga kona n bitia',
    finalise_supplier_invoice: 'Am karao-oota ae Finalise, ko aki manga kona n bitia',
    following_items_reduced_more_than_available_stock:
      'Bwaai aikai aika a tia n kauarereaki nakon mwaitin are inanon baim',
    give_your_stocktake_a_name: 'Arana am warebwai',
    got_it: 'Ngaia anne (Oota Raoi)',
    more: 'Baikara riki?',
    record_stock_required_before_finalising:
      'Ko riai n taua mwin am warebwai imwain ae ko  finalise',
    record_stock_to_issue_before_finalising:
      'Ko riai n taua mwain am kanakobwai imwain ae ko finalise',
    remove_these_items: 'Ko bon kakoaua ae ko na kanakoi aikai?',
    remove: 'Kanakoi ke kamaunai',
    search_for_an_item_to_add: 'Rinea ke kakaea aran te bwai n aoraki',
    search_for_the_customer: 'Rinea am list',
    search_for_the_supplier: 'Kakaea am kambana n oota',
    select_a_language: 'English ke Kiribati',
    select_the_number_of_months_stock_required:
      'Rinea mwaitin te namakaina ae ko kantaningaia ibukin am stock inanon baim',
    start_typing_to_select_customer: 'Karina aran am kiriniki ke am aoraki',
    start_typing_to_select_supplier: 'Taibinna n rinea am kambana n oota',
    stock_quantity_greater_then_zero:
      'Te maiti are e warekaki e na maiti riki nakon AKEA imain kamatoana',
    stocktake_no_counted_items: 'Ko aki kona n Finalise ngkana akea am warebwai',
    select_a_reason: 'Select a reason',
  },
  tl: {
    // TODO: add - edit_the_stocktake_comment, edit_the_stocktake_name, stocktake_invalid_stock
    add_at_least_one_item_before_finalising: 'Tenke hatama sasán ida antes finaliza',
    and: 'no',
    cancel: 'Kansela',
    confirm: 'Konfirma',
    create: 'Kria',
    delete_these_invoices: "Ita sente tebes ita hakarak hapus konta sira-ne'e?",
    delete_these_requisitions: "Ita sente tebes ita hakarak hapus rekuizisaun sira-ne'e?",
    delete_these_stocktakes: "Ita sente tebes ita hakarak hapus ajustamentu sira-ne'e?",
    delete: 'Apaga',
    edit_the_invoice_comment: 'Hadia komentáriu iha Invoice',
    edit_the_requisition_comment: 'Hadia komentáriu iha rekuizisaun',
    edit_their_reference: 'Hadia Referensia',
    finalise_customer_invoice: "Finaliza sei xave permanente Invoice ne'e.",
    finalise_customer_requisition:
      "Finaliza sei afi kliente nia kontaida ne'e, ajusta inventori, sei konfirma xafi permanente",
    finalise_supplier_requisition: "Finaliza sei labele edit rekuizasaun ne'eno xave permanente.",
    finalise_stocktake: "Finaliza sei ajusta inventariu no xave permanente Invoice ne'e.",
    finalise_supplier_invoice:
      "Finaliza sei ajusta inventariu no xave permanente ajustamentu ne'e.",
    following_items_reduced_more_than_available_stock:
      "Item tuir mai ne'e la bele hamenus nia kuantidade menus liu duke kuantidade Item atuál:",
    give_your_stocktake_a_name: 'Justifika naran ajustamentu',
    got_it: 'Komprende',
    more: 'aumenta tan',
    record_stock_required_before_finalising:
      "Ita tenke hatama info kona-ba sasán hira ne'ebé presiza antes bele halo finaliza",
    record_stock_to_issue_before_finalising:
      "Ita tenke hatama info kona-ba sasán hira ne'ebé atu haruka antes bele halo finaliza",
    remove_these_items: "Tebes duni hakarak apaga item sira-ne'e?",
    remove: 'Hasai',
    search_for_an_item_to_add: 'Buka-hetan sasán atu hatama',
    search_for_the_customer: 'Buka-hetan kliente',
    search_for_the_supplier: 'Buka-hetan distribuidor',
    select_a_language: 'Hili lingua',
    select_the_number_of_months_stock_required: 'Hili numeru sira tuir pedidu',
    start_typing_to_select_customer: "Hakerek kliente nia naran iha ne'e",
    start_typing_to_select_supplier: "Hakerek iha ne'e atu selekta distribuidor",
    stock_quantity_greater_then_zero: 'Kuantidade Disponivel tenki bot liu Zero antes finaliza',
    stocktake_no_counted_items: 'La bele finaliza ajustamentu se laiha item ida priense',
    select_a_reason: 'Select a reason',
  },
  la: {
    add_at_least_one_item_before_finalising:
      'ທ່ານ​ຕ້ອງ ເພີ່ມ​ຢ່າງ​ໜ້ອຍໜຶ່ງ​ລາຍ​ການກ່ອນ​ເຮັດ​ການກົດ​ສະຫຼຸບ',
    and: 'ແລະ',
    cancel: 'ຍົກເລີກ',
    confirm: 'ຢືນຢັນ',
    create: 'ສ້າງ',
    delete_these_invoices: 'ທ່ານ​ແນ່​ໃຈ​ບໍ​ວ່າ ທ່ານ​ຕ້ອງ​ການ​ລຶບ​ບັນ​ດາ​ໃບ​ຈ່າຍ​ສິນ​ຄ້າ​ນີ້​ອອກ?',
    delete_these_requisitions:
      'ທ່ານ​ແນ່​ໃຈ​ບໍ​ວ່າ ທ່ານ​ຕ້ອງ​ການ​ລຶບ​ບັນ​ດາ​ໃບ​ສະ​ເໜີ​ຂໍ​ສິນ​ຄ້າ​ນີ້​ອອກ?',
    delete_these_stocktakes: 'ທ່ານ​ແນ່​ໃຈ​ບໍ​ວ່າ ທ່ານ​ຕ້ອງ​ການ​ລຶບ​ບັນ​ດາ​ໃບ​ກວດ​ກາ​ສາງ​ນີ້​ຖິ້ມ?',
    delete: 'ລຶບອອກ',
    edit_the_invoice_comment: 'ແກ້​ໄຂ ຄຳ​ເຫັນ​ໃນ​ໃບ​ຮັບ​\nຈ່າ​ຍ ສິນ​ຄ້າ',
    edit_the_requisition_comment: 'ແກ້​ໄຂ ​ຄຳ​ເຫັນ​ໃນ​ໃບ​ສະ​ເໜີຂໍ ສິນ​ຄ້າ',
    edit_their_reference: 'ແກ້​ໄຂ ຂໍ້​ມູນ​ອ້າງ​ອີງ​ຂອງ​ພວກ​ເຂົາ',
    edit_the_stocktake_comment: 'ແກ້​ໄຂ ​ຄຳ​ເຫັນ​ໃນ​ໃບ​ກວດ​ກາ​ສາງ',
    edit_the_stocktake_name: 'ແກ້​ໄຂ ຊື່​ໃນ​ໃບ​ກວດ​ກາ​ສາງ',
    finalise_customer_invoice: 'ການ​ສະ​ຫຼຸບ ຈະ​ລ໋ອກ​ໃບ​ຈ່າຍ​ສິນ​ຄ້າ​ນີ້​ຖາ​ວອນ',
    finalise_supplier_requisition:
      'ການກ​ກົດ​ສະ​ຫຼຸບ ຈະ​ສົ່ງ​ຄຳ​ຮ້ອງ​ຂໍ ແລະ ຈະ​ລ໋ອກ​ໃບ​ນຳ​ສົ່ງ​ນີ້ເປັນ​ການ​ຖາ​ວອນ',
    finalise_customer_requisition:
      '​ກົດສະ​ຫຼຸບ ແມ່ນ​ເປັນ​ການ​ເຮັດ​ໃຫ້ ໃບ​ຈ່າຍ​ສິນ​ຄ້າ​, ການ​ດັດ​ປັບ​ສາງ ຖືກ​ສະຫຼຸບ ແລະ​ລ໋ອກ​ການ​ຮ້ອງ​ຂໍ​ນີ້ເປັນ​ການຖາ​ວອນ',
    finalise_stocktake:
      'ກົດ​ສະ​ຫຼຸບ ຈະ​ເປັນ​ການ​ເຮັດ​ການ​ດັດ​ປັບ ແລະ​ລ໋ອກ​ໃບ​ກວດ​ກາ​ສາງ​ນີ້​ໄວ້​ຖາ​ວອນ',
    finalise_supplier_invoice:
      'ການກົດ​ສະ​ຫຼຸບ ຈະ​ເຮັດ​ໃຫ້​ຈຳ​ນວນ​ທີ່​ມີ​ຢູ່​ໃນ​ສາງ​ມີ​ການ​ປັບ​ປ່ຽນ ແລະ​​ໃບ​ຮັບ​ສິນ​ຄ້າ​ຈາກ​ຜູ້​ສະ​ໝອງ ຈະ​ບໍ່​ປັບ​ປ່ຽນ​ໄດ້​ອີກ',
    following_items_reduced_more_than_available_stock:
      'ບັນ​ດາ​ລາຍ​ການ​ຕ​ໍ່​ໄປ​ນີ້​ແມ່ນ​ຖືກ​ປັບ​ລົງ ຫຼາຍກວ່າ​ ຈຳ​ນວນ​ທີ່​ມີ​ຢູ່​ໃນ​ສາງຕົວ​ຈິງ',
    give_your_stocktake_a_name: 'ໃສ່​ຊື່​ໃນ​ໃບ​ກວດ​ກາ​ສິນ​ຄ້າ​ໃນ​ສາງ',
    got_it: 'ຢືນ​ຢັນ',
    more: 'ມີ​ອີກ',
    record_stock_required_before_finalising:
      'ທ່ານ​ຈຳ​ຕ້ອງ​ໄດ້​ເຮັດ​ການ​ບັນ​ທຶກ​ວ່າ​ ຈຳ​ນວນ​ສິນ​ຄ້າຫຼາຍ​ປານ​ໃດ​ທີ່​ທ່ານ​ສະ​ເໜີ​ຂໍ ກ່ອນ​ການ​ກົດ​ສະ​ຫຼຸບ',
    record_stock_to_issue_before_finalising:
      'ທ່ານ​ຈຳ​ຕ້ອງ​ໄດ້​ເຮັດ​ການ​ບັນ​ທຶກ​ວ່າ​ ຈຳ​ນວນ​ສິນ​ຄ້າຫຼາຍ​ປານ​ໃດ​ທີ່​ທ່ານ​ຈະ​ຈ່າຍ​ອອກ ກ່ອນ​ການ​ກົດ​ສະ​ຫຼຸບ',
    remove_these_items: 'ທ່ານ​ແນ່​ໃນ​ບໍ​ ວ່າ​ໃຫ້​ລົບ​ລາຍ​ກາ​ນ​ນີ້​ອອກ?',
    remove: 'ລົບ​ອອກ',
    search_for_an_item_to_add: 'ຄົ້ນ​ຫາ​ລາຍ​ການ​ທີ່​ຕ້ອງ​ການ​ເພີ່ມ​ໃສ່',
    search_for_the_customer: 'ຄົ້ນ​ຫາ​ລາຍ​ຊື່​ລູກ​ຄ້າ',
    search_for_the_supplier: 'ຄົ້ນ​ຫາ​ລາຍ​ຊື່​ຜູ້​ສະ​ໜອງ',
    select_a_language: 'ເລືອກ​ພາ​ສາ',
    select_the_number_of_months_stock_required: 'ເລືອກ​ຈຳ​ນວນ​ເດືອນທີ່​ຕ້ອງ​ການ',
    start_typing_to_select_customer: 'ພິມ ເພື່ອ​ເລືອກ​ລູກ​ຄ້າ',
    start_typing_to_select_supplier: 'ພິມ ເພື່ອ​ຄົ້ນ​ຫາ​ແລະ​ເລືອກ​ຜູ້​ສະ​ໜອງ',
    stock_quantity_greater_then_zero:
      'ຈຳ​ນວນ​ສິນ​ຄ້າ​ໃນ​ສາງ​ຄວນ​ມີ​ຫຼາຍກວ່າສູນ(0) ກ່ອນ​ເຮັດ​ການ​ກົດ​ສະຫຼຸບ',
    stocktake_no_counted_items:
      'ບໍ່​ສາ​ມາດ​ກົດ​ສະຫຼຸບ​ໃບ​ກວດ​ກາ​ສາງ​ໄດ້​ໂດຍ​ທີ່​ບໍ່​ມີ​ການກວດ​ນັບ​ລາຍ​ການ​ສິນ​ຄ້າ​ໃນ​ສາງ​ກ່ອນ',
    stocktake_invalid_stock:
      'ສິນ​ຄ້າ​ໃນ​ສາງ​ໄດ້​ມີ​ການ​ປ່ຽນ​ແປງ​ຕັ້ງ​ແຕ່ ໄດ້​ມີ​ການ​ເຮັດ​ການ​ດັດ​ປັບ​ສາງ​ຄັ້ງ​ສຸດ​ທ້າຍ​ຂອງ​ການ ການ​ກວດ​ການ​ສິນ​ຄ້າ​ໃນ​ສາງ (ຜ່ານ ໃບ​ສັ່ງ​ຈ່າຍ, ໃບ​ຮັບ​ສິນ​ຄ້າ, ຫຼື​ໃບ​ກວດ​ກາ​ສິນ​ຄ້າ​ໃນ​ສາງ), ບໍ່​ວ່າ​ຈະ​ເປັນ ສ​ະ​ພາບ​ລວມ​ ແລະ ຈຳ​ນວນ​ຕົວ​ຈິ່ງ​ຂອງ​ສິນ​ຄ້າ "ຈະ​ຖືກ​ດັດ​ປັບ​ໃຫມ່',
    select_a_reason: 'Select a reason',
  },
});

/* eslint-enable max-len */

export default modalStrings;
