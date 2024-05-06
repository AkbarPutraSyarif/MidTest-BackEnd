const { Account } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getAccounts() {
  return Account.find({});
}

/**
 * Get account detail
 * @param {string} id - account ID
 * @returns {Promise}
 */
async function getAccount(id) {
  return Account.findById(id);
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} account_type - tipe akun
 * @returns {Promise}
 */
async function createAccount(name, email, account_type) {
  return Account.create({
    name,
    email,
    account_type,
  });
}

/**
 * Update existing account
 * @param {string} id - User ID
 * @param {string} account_type - tipe akun
 * @returns {Promise}
 */
async function updateAccount(id, account_type) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        account_type,
      },
    }
  );
}

/**
 * Delete an account
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return Account.findOne({ email });
}

/**
 * Deposit uang ke akun
 * @param {string} id - ID akun
 * @param {number} jumlah - Jumlah uang yang akan dideposit
 * @returns {Promise}
 */
async function deposit(id, jumlah) {
  return Account.updateOne(
    { 
      _id: id 
    },
    { 
      $inc: { 
      balance: jumlah 
    } 
  }
  );
}

/**
 * Tarik uang dari akun
 * @param {string} id - ID akun
 * @param {number} jumlah - Jumlah uang yang akan ditarik
 * @returns {Promise}
 */
async function narik(id, jumlah) {
  return Account.updateOne(
    { 
      _id: id 
    },
    { 
      $inc: { 
      balance: -jumlah 
    } 
  }
  );
}

/**
 * Transfer uang 
 * @param {string} dari - ID akun asal
 * @param {string} ke - ID akun tujuan
 * @param {number} jumlah - Jumlah uang yang akan ditransfer
 * @returns {Promise}
 */
async function transfer(dari, ke, jumlah) {
  const session = await Account.startSession();
  session.startTransaction();

  try {
    const opts = { session };

    await Account.updateOne(
      { 
        _id: dari 
      },
      { 
        $inc: { 
        balance: -jumlah 
      } 
    },
      opts
    );

    await Account.updateOne(
      { 
        _id: ke 
      },
      { 
        $inc: { 
        balance: jumlah 
      } 
    },
      opts
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountByEmail,
  deposit,
  narik,
  transfer,
};