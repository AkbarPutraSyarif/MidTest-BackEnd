const accountsService = require('./accounts-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
  try {
    const accounts = await accountsService.getAccounts();
    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccount(request, response, next) {
  try {
    const account = await accountsService.getAccount(request.params.id);

    if (!account) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown Account');
    }

    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const account_type = request.body.account_type;

    const emailIsRegistered = await accountsService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await accountsService.createAccount(name, email, account_type);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Account'
      );
    }

    return response.status(200).json({ email, account_type });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccount(request, response, next) {
  try {
    const id = request.params.id;
    const account_type = request.body.account_type;

    const success = await accountsService.updateAccount(id, account_type);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id, account_type });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;

    const success = await accountsService.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    succes = "berhasil didelete"
    return response.status(200).json({ succes });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit uang ke akun
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deposit(request, response, next) {
  try {
    const id = request.params.id; 
    const jumlah = request.body.jumlah; //jumlah uang buat di deposit

    await accountsService.deposit(id, jumlah);

    return response.status(200).json({ success: true, message: 'Deposit berhasil' });
  } catch (error) {
    return next(errorResponder(errorTypes.UNPROCESSABLE_ENTITY, error.message));
  }
}

/**
 * Handle tarik uang dari akun
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function narik(request, response, next) {
  try {
    const id = request.params.id;
    const jumlah = request.body.jumlah; // Jumlah uang buat di tarik

    await accountsService.narik(id, jumlah);

    return response.status(200).json({ success: true, message: 'Penarikan tunai berhasil',  });
  } catch (error) {
    return next(errorResponder(errorTypes.UNPROCESSABLE_ENTITY, error.message));
  }
}

/**
 * Handle transfer uang dari satu akun ke akun lainnya
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transfer(request, response, next) {
  try {
    const dari = request.body.dari;
    const ke = request.body.ke;
    const jumlah = request.body.jumlah;

    await accountsService.transfer(dari, ke, jumlah);

    return response.status(200).json({ success: true, message: 'Transfer berhasil' });
  } catch (error) {
    return next(errorResponder(errorTypes.UNPROCESSABLE_ENTITY, error.message));
  }
}

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  deposit,
  narik,
  transfer,
};