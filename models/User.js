'use strict';

let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

// User Collection Name
const USERS_COLLECTION = 'user';

// Users Schema Instance
let UserSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true
  },
  personalId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: [String],
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileImageId: {
    type: String,
    required: false
  },
  registrationDate: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  passwordLastChange: {
    type: String,
    required: true
  }
});

/**
 * User Model instance using User Collection Name, and User Schema Instance.
 * Second User Collection avoids collection naming in plural by Mongoose.
 */
let userModel = mongoose.model(USERS_COLLECTION, UserSchema, USERS_COLLECTION);
module.exports.UserModel = userModel;

/**
 * get a user module data by agentId.
 * @param  {} agentId
 */
module.exports.getUserByUserID = (agentId) => {
  return new Promise((resolve, reject) => {
    userModel.findOne({
      agentId: agentId
    }).then((user, err) => {
      if (user !== null) {
        return resolve(user);
      } else {
        return resolve(err);
      }
    }).catch(err => {
      return reject(err);
    })

  })
};
