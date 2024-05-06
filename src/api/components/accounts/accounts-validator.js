const joi = require('joi');

module.exports = {
  createAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      account_type: joi.string().min(1).max(100).required().label('Account Type'),
    },
  },

  updateAccount: {
    body: {
      account_type: joi.string().min(1).max(100).required().label('Account Type'),
    },
  },

  deposit: {
    body: {
      jumlah: joi.number().positive().required().label('Jumlah uang yg dideposit'),
    },
  },

  narik: {
    body: {
      jumlah: joi.number().positive().required().label('Jumlah uang yg ditarik'),
    },
  },

  transfer: {
    body: {
      dari: joi.string().required().label('id pengirim'),
      ke: joi.string().required().label('id penerima'),
      jumlah: joi.number().positive().required().label('Jumlah uang untuk transfer'),
    },
  },

}
