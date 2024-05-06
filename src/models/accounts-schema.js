const accountsSchema = {
  name: String,
  email: String,
  account_type: {
    type: String,
    enum: ['savings', 'checking', 'business'],
  },
  balance: {
    type: String, 
    default: "50.000"},
};

module.exports = accountsSchema;