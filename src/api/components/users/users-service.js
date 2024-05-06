
const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */

const getUsers = async ({ halKe, isiHal, search, sort }) => {
  sorting = fungSort(sort);//fungsi utk sorting
  searching = fungSearch(search)//fungsi utk searching

  const jumUser = await usersRepository.itungUsers(searching);//mencari jumlah user yg ada di database, ambil fungsi dari repo
  const jumPages = Math.ceil(jumUser / isiHal);//mencari jumlah halaman, dari banyaknya user dibagi isi perhalaman

  const pindah = (halKe - 1) * isiHal;//variabel utk pindah page
  const users = await usersRepository.getUsers({ skip: pindah, limit: isiHal, sorting, searching,});

  //data dari user yg akan ditampilkan
  const dataUser = users.map(user => ({
    id: user.id.toString(),
    name: user.name,
    email: user.email,
  }));

  //keluaran di bruno
  return {
    page_number: halKe,
    page_size: isiHal,
    count: jumUser,
    total_pages: jumPages,
    has_previous_page: halKe > 1,
    has_next_page: halKe < jumPages,
    data: dataUser,
  };
};

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
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
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

//fungsi untuk sorting
const fungSort = (sort) =>{
  const [sortField, sortOrder] = sort.split(':');
  return {[sortField]: sortOrder === 'desc' ? -1 : 1}
}

//fungsi untuk search
const fungSearch = (search) =>{
  const searchQ = {};

  if (search) {
    const [field, key] = search.split(':');
    if (field && key) {
      searchQ[field] = new RegExp(key, 'i'); 
    }
  }
  return searchQ
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await usersRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
    };
  }

  return null;
}

const loginKe = {};
const waktu = Math.floor(new Date().getTime() / 1000);//variabel global waktu
//fungsi buat cek user lagi/masih di dalem cooldown atau engga
const cekCooldown = (email) => {
  const coba = loginKe[email] || { 
    count: 0, 
    coolSampe: 0 };
  return waktu <= coba.coolSampe;
};
 
//buat itung gagal
const hitungGagal = (email) => {
  const batasNyoba = 5;
  const lamaCool = 1800;
  let coba = loginKe[email] || { 
    count: 0,
    terCoba: waktu, 
    coolSampe: 0 };
  coba.count++;
  coba.terCoba = waktu;
 
  if (coba.count >= batasNyoba) {
    coba.coolSampe = waktu + lamaCool; //waktu cooldown
  }
  loginKe[email] = coba;
};

//kalau login berhasil di reset cobanya
const ulangLogin = (email) => {
  loginKe[email] = { count: 0, coolSampe: 0 };
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  fungSearch,
  fungSort,
  checkLoginCredentials,
  cekCooldown,
  hitungGagal,
  ulangLogin,
};