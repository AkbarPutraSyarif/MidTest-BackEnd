const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const accountsControllers = require('./accounts-controller');
const accountsValidator = require('./accounts-validator');

const route = express.Router();


module.exports = (app) => {
  app.use('/accounts', route);

  // Get list of account
  route.get('/', authenticationMiddleware, accountsControllers.getAccounts);

  // Create account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(accountsValidator.createAccount),
    accountsControllers.createAccount
  );

  // Get account detail
  route.get('/:id', authenticationMiddleware, accountsControllers.getAccount);

  // Update account
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(accountsValidator.updateAccount),
    accountsControllers.updateAccount
  );

  // Delete account
  route.delete('/:id', authenticationMiddleware, accountsControllers.deleteAccount);

  //Deposit uang
  route.post(
    '/:id/deposit',
    authenticationMiddleware,
    celebrate(accountsValidator.deposit),
    accountsControllers.deposit
  );

  //Tarik uang
  route.post(
    '/:id/narik',
    authenticationMiddleware,
    celebrate(accountsValidator.narik),
    accountsControllers.narik
  );

  //transfer uang
  route.post(
    '/transfer',
    authenticationMiddleware,
    celebrate(accountsValidator.transfer),
    accountsControllers.transfer
  );

};