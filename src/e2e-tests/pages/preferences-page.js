/* jshint module: true */
var PreferencesPage = function() {
  this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Account preferences'));
  this.pendingConnections = element.all(by.repeater('connection in pendingConnections').column('connection.user.name'));
  this.approveConnectionButton = element.all(by.css('.t-approve-connection')).first();
  this.modalOverlay = element(by.css('.modal'));
  this.approveConnectionModalText = element(by.cssContainingText('div .modal-body', 'Connection approved'));
  this.noPendingConnectionsMessage = element(by.css('.t-no-pending-connections'));
  this.approvedConnections = element(by.repeater('connection in approvedConnections').column('connection.user.name'));
  this.removeConnectionButton = element.all(by.css('.t-remove-connection')).first();
  this.removeConnectionModalText = element(by.cssContainingText('div .modal-body', 'Connection removed'));
};

module.exports = PreferencesPage;
