_ = require('underscore');
expect = require('chai').expect;

// Set start point 1
var _start_point = BasMTR;

// FB_API_Login_Handler
(function (mtr) {
    _start_point.FB_API_Login_Handler = {};
    var _this = function(){return _start_point.FB_API_Login_Handler;}();

    // Include all fields from facebook
    // http://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/
    _this._fields = ['id', 'email', 'name', 'first_name', 'last_name', 'link', 'gender', 'locale', 'age_range'];
    _this._apiUri = "https://graph.facebook.com/v2.6/me";

    _this.login = function(options) {

        console.log('native-facebook');
        if (options.methodName !== 'native-facebook') {
            return;
        }

        // authResponse accessToken, expiresIn, userID
        expect(options).to.have.property("accessToken").that.is.a("string");
        expect(options).to.have.property("expiresIn").that.is.a("string");
        expect(options).to.have.property("userID").that.is.a("string");

        var user = mtr.users.findOne({
            "services.facebook.id": options.userID
        });

        if (!user) {
            var identity = _this.getIdentity(options.accessToken);
            _.extend(identity, {
                accessToken: options.accessToken,
                expiresAt: (+new Date()) + (1000 * options.expiresIn)
            });
            user = {
                profile: {name: identity.name},
                services: {
                    facebook: identity
                }
            };
            user._id = Accounts.insertUserDoc({}, user);
        }

        return {
            userId: user._id
        };
    };

    // Get Identity
    _this.getIdentity = function(accessToken) {
        expect(accessToken).to.be.a("string");
        try {
            return HTTP.get(_this._apiUri, {
                params: {
                    access_token: accessToken,
                    fields: _this._fields
                }
            }).data;
        } catch (ex) {
            var err = new Error("Failed to fetch identity from Facebook. " + ex.message);
            err.response = ex.response;
            throw err;
        }
    };

    // Meteor Init
    _this.mtr_init = function() {
        //...
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor ));

// Set login handler
Accounts.registerLoginHandler(function(options){
    return BasMTR.FB_API_Login_Handler.login(options);
});