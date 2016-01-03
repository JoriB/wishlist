/**
 * wishlist - core.containers/Login
 *
 * Created by nijk on 03/01/2016.
 */

'use strict';

// Dependencies
const _ = require('lodash');
const core = require('core/Core');
const React = require('react');
const classnames = require('classnames');
const events = require('../events');

// Components
const Input = require('../components/Input');
const Button = require('../components/Button');
const Text = require('../components/Text');

/* Styles */
//require('style/login');
/* ------ */

module.exports = React.createClass({
    displayName: 'Login',

    mixins: [
        core.FluxMixin,
        core.StoreWatchMixin('Products')
    ],

    getStateFromFlux () {
        return {
            userLogin: {
                email: '',
                password: ''
            }
        };
    },

    onAddInput (field) {
        // Only honour if stateFromFlux has an addURL value triggered by a change event on input field.
        if (this.state.userLogin[field]) {
            core.actions.addLoginInput( this.state.userLogin );
        }
    },

    onHandleInput (e, value, name) {
        let userLogin = this.state.userLogin;
        userLogin[name] = value;

        console.info('onHandleInput', userLogin);

        this.setState({ userLogin });
    },

    onSubmitLogin (e) {
        e.preventDefault();
        core.actions.userLogin( this.state.userLogin );
    },

    _renderLoginForm () {
        const inputClasses = {
            label: {
                label__above: true
            }
        };

        return (
            <form key="form-login" className="form__login">
                <Input
                    key="email"
                    name="email"
                    label="Email"
                    classes={ inputClasses }
                    onChange={ this.onHandleInput }
                    value={ this.state.userLogin.email }
                />
                <Input
                    key="password"
                    name="password"
                    type="password"
                    label="Password"
                    classes={ inputClasses }
                    onChange={ this.onHandleInput }
                    value={ this.state.userLogin.password }
                />
                <Button key="submit" text="Login" onClick={ this.onSubmitLogin } className="button__submit" />
            </form>
        );
    },

    render () {
        return (
            <div className="user__login">
                { this._renderLoginForm() }
            </div>
        );
    }
});


