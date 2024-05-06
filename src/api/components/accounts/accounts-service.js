const Decimal = require('decimal.js');
const accountsRepository = require('./accounts-repository');

/**
 * Get list of accounts
 * @returns {Array}
 */
async function getAccounts() {
  const accounts = await accountsRepository.getAccounts();

  const results = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    results.push({
      id: account.id,
      name: account.name,
      email: account.email,
      account_type: account.account_type,
      balance: account.balance,
    });
  }

  return results;
}

/**
 * Get Account detail
 * @param {string} id - account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    account_type: account.account_type,
    balance: account.balance,
  };
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} account_type - tipe akun
 * @returns {boolean}
 */
async function createAccount(name, email, account_type) {
  try {
    await accountsRepository.createAccount(name, email, account_type);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing account
 * @param {string} id - account ID
 * @param {string} account_type
 * @returns {boolean}
 */
async function updateAccount(id, account_type) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.updateAccount(id, account_type);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}
/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const account = await accountsRepository.getAccountByEmail(email);

  if (account) {
    return true;
  }

  return false;
}

Decimal.set(
  { 
    precision: 20 
  }
);

/**
 * Deposit uang ke akun
 * @param {string} id - ID akun
 * @param {number} jumlah - Jumlah uang yang akan dideposit
 * @returns {boolean}
 */
async function deposit(id, jumlah) {
  const account = await accountsRepository.getAccount(id);

  if (!account) {
    return null;
  }

  //ubah type balance ke decimal, ditambahkan, lalu dibenarkan supaya keluaran jadi xxx.000
  const balanceAw = new Decimal(account.balance);
  const balanceBar = balanceAw.add(jumlah);
  account.balance = balanceBar.toFixed(3);

  await account.save();

  return true;
}

/**
 * Tarik uang dari akun 
 * @param {string} id 
 * @param {number} jumlah - Jumlah uang yang akan ditarik
 * @returns {boolean}
 */
async function narik(id, jumlah) {
  const account = await accountsRepository.getAccount(id);

  if (!account) {
    return null;
  }
 
  //ubah balance jadi decimal supaya ga eror nanti keluarannya
  const balanceAw = new Decimal(account.balance);

  if (balanceAw.lessThan(jumlah)) {
    throw new Error('Saldo tidak mencukupi untuk penarikan');
  }

  //disini balance tadi dimasukin ke variabel baru lalu dikurangni oleh jumlah yg ditarik
  const balanceBar = balanceAw.sub(jumlah).toFixed(3); 
  account.balance = balanceBar; 
  await account.save();

  return true;
}

/**
 * Transfer uang
 * @param {string} dari -id pengirim
 * @param {string} ke -id penerima
 * @param {number} jumlah - Jumlah uang yang akan ditransfer
 * @returns {boolean}
 */
async function transfer(dari, ke, jumlah) {
  //butuh dua account, penerima dan pengirim
  const dariAcc = await accountsRepository.getAccount(dari);
  const keAcc = await accountsRepository.getAccount(ke);

  if (!dariAcc || !keAcc) {
    throw new Error('Satu atau lebih akun tidak ditemukan');
  }

  if (jumlah <= 0) {
    throw new Error('Jumlah transfer harus lebih besar dari nol');
  }

  //ubah balance pengirim ke decimal
  const balanceDari = new Decimal(dariAcc.balance);

  if (balanceDari.lessThan(jumlah)) {
    throw new Error('Saldo tidak mencukupi untuk transfer');
  }

  //balance pengirim dikiurang jumlah transfer, lalu balance penerima bertambah dari jumlah transfer
  const balanceDariBar = balanceDari.sub(jumlah).toFixed(3); 
  const balanceKeBar = new Decimal(keAcc.balance).add(jumlah).toFixed(3); 

  //update balance dari masing masing account/rekening
  dariAcc.balance = balanceDariBar; 
  keAcc.balance = balanceKeBar;
  await dariAcc.save();
  await keAcc.save();

  return true;
}

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  emailIsRegistered,
  deposit,
  narik,
  transfer,
}