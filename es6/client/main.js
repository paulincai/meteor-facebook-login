/* globals Meteor, facebookConnectPlugin, Accounts, BasMTR */

import assign from 'lodash.assign'
import pick from 'lodash.pick'

const FB_API_ = (mtr => {
  // ------------------------------------------------------------------------
  // Constants
  // ------------------------------------------------------------------------

  const VERSION = BasMTR.Utils.VERSION

  // ------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------

  class FB_API_ {
    static get VERSION () {
      return VERSION
    }

    // Static
    // ------------------------------------------------------------------------

    static login (options, callback) {
      // Default login
      if (!mtr.isCordova || typeof facebookConnectPlugin === 'undefined') {
        return mtr.loginWithFacebook(options, callback)
      }

      // support a callback without options
      if (!callback && typeof options === 'function') {
        callback = options
        options = {
          'requestPermissions': ['public_profile', 'email', 'user_friends']
        }
      }

      // Native login
      facebookConnectPlugin.login(options.requestPermissions, function (res) {
        let opts = assign(pick(res.authResponse, ['accessToken', 'expiresIn', 'userID']), {methodName: 'native-facebook'})
        Accounts.callLoginMethod({methodArguments: [opts], userCallback: callback})
      }, function (err) {
        console.error('err', err)
        callback(err, null)
      })
    }
  }
  return FB_API_
})(Meteor)

BasMTR.FB_API = FB_API_
export default FB_API_