/* globals MTR, Accounts, Meteor, HTTP */
/* eslint-disable camelcase */

import assign from 'lodash/assign'
import chai from 'chai'
let expect = chai.expect

const FB_API_Login_Handler_ = (mtr => {
// ------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------

  // Include all fields from facebook
  // http://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/
  let _fields = ['id', 'email', 'name', 'first_name', 'last_name', 'link', 'gender', 'locale', 'age_range']
  let _apiUri = 'https://graph.facebook.com/v3.2/me'

  // ------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------

  class FB_API_Login_Handler_ {
    // Getters
    // ------------------------------------------------------------------------

    // Static
    // ------------------------------------------------------------------------

    static login (options) {
      console.log('native-facebook')
      if (options.methodName !== 'native-facebook') {
        return
      }

      // authResponse accessToken, expiresIn, userID
      expect(options).to.have.property('accessToken').that.is.a('string')
      expect(options).to.have.property('expiresIn').that.is.a('string')
      expect(options).to.have.property('userID').that.is.a('string')

      let user = mtr.users.findOne({
        'services.facebook.id': options.userID
      })

      if (!user) {
        let identity = FB_API_Login_Handler_.getIdentity(options.accessToken)
        assign(identity, {
          accessToken: options.accessToken,
          expiresAt: (+new Date()) + (1000 * options.expiresIn)
        })
        let _options = {
          profile: {
            name: identity.first_name + ' ' + identity.last_name
          }
        }
        user = {
          services: {
            facebook: identity
          }
        }
        user._id = Accounts.insertUserDoc(_options, user)
      }

      return {
        userId: user._id
      }
    }

    // Get Identity
    static getIdentity (accessToken) {
      expect(accessToken).to.be.a('string')
      try {
        return HTTP.get(_apiUri, {
          params: {
            access_token: accessToken,
            fields: _fields.join(',')
          }
        }).data
      } catch (ex) {
        let err = new Error('Failed to fetch identity from Facebook. ' + ex.message)
        err.response = ex.response
        throw err
      }
    }
  }

  // Set login handler
  Accounts.registerLoginHandler(function (options) {
    return FB_API_Login_Handler_.login(options)
  })
  return FB_API_Login_Handler_
})(Meteor)

MTR.FB_API_Login_Handler = FB_API_Login_Handler_
export default FB_API_Login_Handler_
